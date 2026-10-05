"""Train the /lab meter reader: a tiny fully-convolutional CTC recogniser.

    python scripts/lab/train.py <data dir from generate.mjs> [epochs] [max train samples]

Writes public/lab/meter-ctc.bin (int8 weights, BN folded) and
lib/lab/model-card.json (every number the /lab page shows about the model).
"""
import json
import math
import os
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

ALPHABET = "0123456789."
IN_H, IN_W = 32, 128
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")

torch.manual_seed(0)
torch.set_num_threads(os.cpu_count() or 4)


def load(data, name):
    meta = json.load(open(os.path.join(data, f"{name}.json")))
    px = np.fromfile(os.path.join(data, f"{name}.u8"), dtype=np.uint8)
    return px.reshape(len(meta), IN_H, IN_W), meta


def normalize(x):
    # Matches lib/lab/meter.ts normalize(): per-image standardisation
    x = x.float()
    m = x.mean(dim=(1, 2), keepdim=True)
    s = ((x - m) ** 2).mean(dim=(1, 2), keepdim=True).sqrt() + 4
    return ((x - m) / s).unsqueeze(1)


def encode(texts):
    tg = [torch.tensor([ALPHABET.index(c) + 1 for c in t]) for t in texts]
    return torch.cat(tg), torch.tensor([len(t) for t in tg])


# (kind, in, out, kernel, pool) — mirrored by lib/lab/infer.ts
ARCH = [
    ("conv", 1, 16, (3, 3), (2, 2)),
    ("conv", 16, 32, (3, 3), (2, 2)),
    ("conv", 32, 48, (3, 3), None),
    ("conv", 48, 48, (3, 3), (2, 1)),
    ("conv", 48, 64, (3, 3), (2, 1)),
    ("conv", 64, 96, (2, 1), None),  # collapses height: 2 -> 1
    ("conv", 96, 96, (1, 3), None),
    ("conv", 96, 96, (1, 3), None),
    ("head", 96, len(ALPHABET) + 1, (1, 1), None),
]


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList()
        for kind, ci, co, k, _ in ARCH:
            pad = (0, 0) if k == (2, 1) else (k[0] // 2, k[1] // 2)
            conv = nn.Conv2d(ci, co, k, padding=pad, bias=kind == "head")
            self.layers.append(nn.ModuleDict({"conv": conv, "bn": nn.BatchNorm2d(co)} if kind == "conv" else {"conv": conv}))

    def forward(self, x):
        for (kind, *_, pool), L in zip(ARCH, self.layers):
            x = L["conv"](x)
            if kind == "conv":
                x = F.relu(L["bn"](x))
            if pool:
                x = F.max_pool2d(x, pool)
        return x.squeeze(2).permute(2, 0, 1)  # T, B, C


def greedy(logits):
    best = logits.argmax(-1).T  # B, T
    out = []
    for row in best.tolist():
        s, prev = "", 0
        for c in row:
            if c and c != prev:
                s += ALPHABET[c - 1]
            prev = c
        out.append(s)
    return out


def cer(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)]


@torch.no_grad()
def evaluate(model, px, texts, bs=1000):
    model.eval()
    preds = []
    for i in range(0, len(texts), bs):
        preds += greedy(model(normalize(torch.from_numpy(px[i : i + bs]))))
    exact = sum(p == t for p, t in zip(preds, texts)) / len(texts)
    c = sum(cer(p, t) for p, t in zip(preds, texts)) / sum(len(t) for t in texts)
    return exact, c


def fold_and_quantise(model):
    """Fold BN into conv, quantise weights to int8 per output channel."""
    layers = []
    for (kind, ci, co, k, pool), L in zip(ARCH, model.layers):
        w = L["conv"].weight.detach().clone()
        b = L["conv"].bias.detach().clone() if L["conv"].bias is not None else torch.zeros(co)
        if kind == "conv":
            bn = L["bn"]
            g = bn.weight / torch.sqrt(bn.running_var + bn.eps)
            w = w * g[:, None, None, None]
            b = (b - bn.running_mean) * g + bn.bias
        scale = w.abs().amax(dim=(1, 2, 3)).clamp(min=1e-8) / 127
        q = torch.round(w / scale[:, None, None, None]).clamp(-127, 127).to(torch.int8)
        layers.append(dict(kind=kind, ci=ci, co=co, k=list(k), pool=list(pool) if pool else None,
                           q=q, scale=scale.detach(), bias=b.detach()))
    return layers


def quantised_model(layers):
    m = Net()
    with torch.no_grad():
        for spec, L in zip(layers, m.layers):
            L["conv"].weight.copy_(spec["q"].float() * spec["scale"][:, None, None, None])
            if "bn" in L:  # identity BN: weights already folded
                L["bn"].running_mean.zero_(); L["bn"].running_var.fill_(1 - L["bn"].eps)
                L["bn"].weight.fill_(1); L["bn"].bias.copy_(spec["bias"])
            else:
                L["conv"].bias.copy_(spec["bias"])
    return m


def export(layers, path):
    """Binary: u32 header length, JSON header, then per layer int8 weights,
    f32 scales, f32 bias (each section 4-byte aligned)."""
    blobs, meta, off = [], [], 0

    def add(arr):
        nonlocal off
        b = arr.tobytes()
        b += b"\0" * (-len(b) % 4)
        blobs.append(b)
        o = off
        off += len(b)
        return o

    for L in layers:
        meta.append(dict(kind=L["kind"], ci=L["ci"], co=L["co"], k=L["k"], pool=L["pool"],
                         w=add(L["q"].numpy()), s=add(L["scale"].numpy().astype("<f4")),
                         b=add(L["bias"].numpy().astype("<f4"))))
    head = json.dumps(dict(alphabet=ALPHABET, inH=IN_H, inW=IN_W, layers=meta)).encode()
    head += b" " * (-len(head) % 4)
    with open(path, "wb") as f:
        f.write(np.uint32(len(head)).tobytes())
        f.write(head)
        for b in blobs:
            f.write(b)
    return os.path.getsize(path)


def main():
    data = sys.argv[1]
    epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 14
    tr_px, tr_meta = load(data, "train")
    if len(sys.argv) > 3:
        tr_px, tr_meta = tr_px[: int(sys.argv[3])], tr_meta[: int(sys.argv[3])]
    va_px, va_meta = load(data, "val")
    sw_px, sw_meta = load(data, "sweep")
    tr_t = [m["t"] for m in tr_meta]
    va_t = [m["t"] for m in va_meta]
    print(f"train {len(tr_t)}  val {len(va_t)}  sweep {len(sw_meta)}")

    model = Net()
    params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print("params", params)
    bs = 128
    steps = epochs * math.ceil(len(tr_t) / bs)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=3e-3, total_steps=steps, pct_start=0.15)
    ctc = nn.CTCLoss(blank=0, zero_infinity=True)
    t0 = time.time()
    history = []
    for ep in range(epochs):
        model.train()
        perm = np.random.default_rng(ep).permutation(len(tr_t))
        tot = 0.0
        for i in range(0, len(perm), bs):
            idx = perm[i : i + bs]
            x = normalize(torch.from_numpy(tr_px[idx]))
            tg, tl = encode([tr_t[j] for j in idx])
            lp = model(x).log_softmax(-1)
            loss = ctc(lp, tg, torch.full((len(idx),), lp.shape[0], dtype=torch.long), tl)
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
            tot += loss.item() * len(idx)
            if (i // bs) % 100 == 0:
                print(f"  ep {ep + 1} step {i // bs} loss {loss.item():.3f} {time.time() - t0:.0f}s", flush=True)
        ex, c = evaluate(model, va_px, va_t)
        history.append(dict(epoch=ep + 1, loss=round(tot / len(perm), 4), valExact=round(ex, 4), valCer=round(c, 4)))
        print(history[-1], f"{time.time() - t0:.0f}s", flush=True)

    layers = fold_and_quantise(model)
    qm = quantised_model(layers)
    fp_ex, fp_c = evaluate(model, va_px, va_t)
    q_ex, q_c = evaluate(qm, va_px, va_t)
    print(f"fp32 exact {fp_ex:.4f} cer {fp_c:.4f} | int8 exact {q_ex:.4f} cer {q_c:.4f}")

    curves = {}
    for key in ["blur", "noise", "tilt", "glare", "fade", "dirt"]:
        pts = []
        for lvl in range(11):
            idx = [i for i, m in enumerate(sw_meta) if m.get("key") == key and round(m["level"] * 10) == lvl]
            ex, _ = evaluate(qm, sw_px[idx], [sw_meta[i]["t"] for i in idx])
            pts.append(round(ex, 4))
        curves[key] = pts
        print(key, pts)

    os.makedirs(os.path.join(ROOT, "public", "lab"), exist_ok=True)
    size = export(layers, os.path.join(ROOT, "public", "lab", "meter-ctc.bin"))
    macs, h, w = 0, IN_H, IN_W
    for kind, ci, co, k, pool in ARCH:
        if k == (2, 1):
            h -= 1
        macs += ci * co * k[0] * k[1] * h * w
        if pool:
            h, w = h // pool[0], w // pool[1]
    card = dict(
        trainedOn=time.strftime("%Y-%m-%d"),
        params=params,
        bytes=size,
        macs=macs,
        frames=w,
        trainSamples=len(tr_t),
        valSamples=len(va_t),
        sweepSamplesPerPoint=300,
        epochs=epochs,
        trainSeconds=round(time.time() - t0),
        valExact={"fp32": round(fp_ex, 4), "int8": round(q_ex, 4)},
        valCer={"fp32": round(fp_c, 4), "int8": round(q_c, 4)},
        history=history,
        curves=curves,
    )
    json.dump(card, open(os.path.join(ROOT, "lib", "lab", "model-card.json"), "w"), indent=2)
    torch.save(model.state_dict(), os.path.join(data, "model.pt"))
    # Reference logits for checking the JS port
    ref = va_px[:8]
    with torch.no_grad():
        logits = qm(normalize(torch.from_numpy(ref)))
    np.save(os.path.join(data, "ref_in.npy"), ref)
    np.save(os.path.join(data, "ref_logits.npy"), logits.permute(1, 0, 2).numpy())
    print("wrote", size, "bytes")


if __name__ == "__main__":
    main()
