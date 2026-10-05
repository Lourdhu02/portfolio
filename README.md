# Lourdu Raju · Cinematic Machine Learning Portfolio

> *"I make vision models fast, honest, and boring to run."*  
> Production Computer Vision · Low-Latency GPU Inference · Applied GenAI

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-050507?style=flat&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Motion](https://img.shields.io/badge/Motion-React-FF4655?style=flat)](https://motion.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## ✦ Overview

This is the personal engineering portfolio of **Lourdu Raju**—ML Engineer at **Sujanix**, Founder of **spacedrift**, and author of **Achilles** and the **PhilArchive** preprint *No Final Save*.

Designed with a dark cinematic 3D aesthetic inspired by modern film titles and engineering control planes. Every metric displayed is verified against production telemetry across over **40,000,000 live meter readings**.

---

## ⚡ Key Highlights & Systems

### 1. [Flagship: Meter OCR Pipeline](/app/work/meter-ocr)
- **Scale**: 5-model production pipeline handling up to 330,000 requests/day for a state electricity utility.
- **Accuracy**: Lifted live exact-match accuracy from **79% to 91%** across 40M+ readings.
- **Serving**: Triton Inference Server with 9 TensorRT FP16 engines on a single **NVIDIA L4**.
- **Latency**: End-to-end p50 reduced from **1,415 ms to 156 ms** (**9× faster**); load-tested to **181 img/s sustained** at p95 340 ms with zero errors (12.6× production peak).
- **Optimization**: Patched unsupported UINT8 Transpose graph operations, cutting classifier compute from **309.5 ms to 3.3 ms** (**94× faster**).

### 2. [SVTRv2-ARD Research](/content/writing/svtrv2-ard.mdx)
- Retrained SVTRv2 on production field crops with fused SDPA (FlashAttention) and ahead-of-time `torch.compile`.
- Training speedup of **3.8×** on DGX Spark clusters while cutting peak VRAM from **50.5 GB down to 14.7 GB**.
- Gated in CI with mandatory **$1.2 \times 10^{-5}$** PyTorch-to-ONNX numerical parity checks.

### 3. [ECHOME Local-First Agent](/content/writing/echome.mdx)
- LangGraph agent with CoALA-style three-tier memory (episodic Qdrant vectors, semantic fact consolidation, procedural patterns).
- Recalls 11 of 12 planted facts up to 52 turns prior in top-5 candidates at ~1 ms retrieval.
- Adaptive personality assessment engine using Item Response Theory (IRT), halving questionnaire length at $r = 0.97$.

### 4. [FinSentinelAI](/content/writing/finsentinel.mdx)
- Self-contained, air-gapped financial document RAG engine (FastAPI, Ollama, ChromaDB).
- Hybrid BM25 + dense semantic retrieval with reciprocal-rank fusion (RRF) and cross-encoder reranking over 1,000+ financial PDFs, boosting exact-ID lookups from **15% to 100%**.

### 5. [Achilles — Core AI from First Principles](https://github.com/Lourdhu02/achilles)
- Open-source curriculum of **18 test-driven labs**: reverse-mode autograd, Llama transformer, FlashAttention kernels in OpenAI Triton, KV cache, LoRA, DPO, GRPO, quantization, and MoE.
- **229 automated unit tests** passing in CI across Linux, macOS, and Windows.

### 6. [No Final Save: Research Preprint](https://philarchive.org/rec/BANNFS)
- 23-page formal framework for persistent AI agents published on PhilArchive: causal-continuity criterion for agent identity, terminal vs instrumental self-preservation proofs, and developmental safety boundaries.

---

## 🎨 Visual & Motion Architecture

- **Color Palette**: Void Black (`#050507`), Deep Surface (`#0B0B0F`), Signal Red (`#FF4655`), ML Detection Cyan (`#2DE2E6`).
- **3D Hero**: React Three Fiber particle canvas sampling SVG vector glyphs into dynamic point clouds with physics restitution, pointer repulsion, and dynamic performance tiers (auto-downgrading from 24k to 12k/6k particles based on frame rate).
- **Interactive ML Lab (`/lab`)**: Soundless in-browser OCR inference simulator featuring live OBB bounding box locks, laser sweep animations, character confidence matrices, and exportable JSON telemetry.
- **Micro-Interactions**: Magnetic hover pull buttons, split-line title reveal masks, velocity-linked scrolling, and smooth cmdk palette navigation.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **UI Library**: React 19, Motion for React (formerly Framer Motion)
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Content Engine**: Velite (Type-safe MDX compiler with Zod schemas)
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System Tokens
- **Icons & Controls**: cmdk, Lucide

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended), npm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Lourdhu02/portfolio.git
cd portfolio

# Install dependencies
pnpm install
```

### Development
```bash
# Start development server with live Velite watching
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Compile Velite content and run Next.js production build
pnpm build

# Serve production build locally
pnpm start
```

---

## 📁 Repository Structure

```text
portfolio/
├── app/
│   ├── layout.tsx             # Root layout with custom navigation and typography
│   ├── page.tsx               # Home: Hero, Counters, Work, Lab, Creed, Resume
│   ├── about/page.tsx         # Full profile, Spacedrift venture, papers, credentials
│   ├── lab/page.tsx           # Interactive in-browser ML inference simulator
│   ├── work/
│   │   ├── meter-ocr/page.tsx # Flagship utility-scale OCR case study
│   │   └── [slug]/page.tsx    # Dynamic project case study template
│   └── writing/
│       ├── page.tsx           # Writing index (post-mortems, papers, engineering logs)
│       └── [slug]/page.tsx    # Dedicated MDX reading experience
├── components/
│   ├── motion/                # Magnetic buttons, counters, SVG pipeline diagram
│   ├── three/                 # R3F ParticleName, canvas sampling, performance tiers
│   └── ui/                    # Navigation drawer, cmdk LabCommand, Easter eggs
├── content/
│   ├── truth.ts               # Single source of truth for metrics, bio, links
│   └── writing/               # MDX field notes, research summaries, post-mortems
├── public/
│   └── LourduRaju_Resume.pdf  # Downloadable verified resume PDF
└── velite.config.ts           # Type-safe content schema configuration
```

---

## 📬 Contact & Profiles

- **Email**: [b.lourdhuraju1234@gmail.com](mailto:b.lourdhuraju1234@gmail.com)
- **Phone**: +91 99595 94460
- **GitHub**: [github.com/Lourdhu02](https://github.com/Lourdhu02)
- **LinkedIn**: [linkedin.com/in/lourdhu](https://linkedin.com/in/lourdhu)
- **Kaggle**: [kaggle.com/blourdhuraju](https://kaggle.com/blourdhuraju)
- **Studio**: [spacedrift.in](https://spacedrift.in)

---

© 2026 Lourdu Raju. All rights reserved.
