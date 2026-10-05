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

Designed with a dark cinematic 3D aesthetic inspired by film titles and engineering control planes. Every number on the site lives in [`content/truth.ts`](content/truth.ts) with how it was measured and the repository file that records it; pages read from there and print that source next to the figure.

---

## ⚡ Key Highlights & Systems

### 1. [Flagship: Meter OCR](/app/work/meter-ocr/page.tsx)
- **Scope**: production meter-reading OCR for two state electricity utilities; 330,707 requests on the busiest day.
- **Serving**: 11 TensorRT FP16 engines behind Triton, with a hash-bucketed router, serverless fallback and a circuit breaker.
- **Latency**: end-to-end p50 **1,386 ms → 60 ms** against the serverless path on the same 1,000 photos (23×).
- **Throughput**: a UINT8 Transpose patch moved the last classifier to TensorRT: compute **309.5 → 3.3 ms** (94×), throughput **19 → 321 img/s** on the dev box; **181 img/s** sustained on one NVIDIA L4.
- **Quality**: **83.4%** reading accuracy on 2,950 labelled photos and **99.8%** of 1,015 unreadable photos refused (West Bengal); **90.5%** in Bihar.

### 2. [SVTRv2-ARD](content/writing/svtrv2-ard.mdx)
- Paper-first SVTRv2 (ICCV 2025) reimplementation, verified against the official OpenOCR code.
- ARD: adaptive routing and SGM→CTC distillation, both inference-preserving; 49/49 tests pass. No benchmark checkpoint trained yet.

### 3. [ECHOME](content/writing/echome.mdx)
- Fully local digital twin: adaptive IRT personality assessment, voice clone, and a LangGraph agent with CoALA-style memory.
- Recalls the needed fact in 11 of 12 multi-session scenarios (92%) vs 0% with memory off; assessment 70% shorter at SE < 0.32.

### 4. [FinSentinelAI](content/writing/finsentinel.mdx)
- Fully local RAG over invoices, receipts and bank statements: ChromaDB, cross-encoder reranking, Ollama, per-user isolation inside the vector store.
- 1,000-document synthetic finance test corpus across 10 layouts; zero external API calls.

### 5. [Achilles — Core AI from First Principles](https://github.com/Lourdhu02/achilles)
- 18 test-driven labs from autograd to FlashAttention in Triton, DPO, GRPO, quantization and MoE.
- 229 reference tests passing in CI on Linux, macOS and Windows.

### 6. [No Final Save](https://philarchive.org/rec/BANNFS)
- 23-page preprint on persistent AI agents: a causal-continuity criterion for identity, a proof that terminal and instrumental self-preservation cannot be told apart from behaviour, and a developmental safety model.

---

## 🎨 Visual & Motion Architecture

- **Color Palette**: Void Black (`#050507`), Deep Surface (`#0B0B0F`), Signal Red (`#FF4655`), ML Detection Cyan (`#2DE2E6`).
- **3D Hero**: React Three Fiber particle canvas sampling SVG vector glyphs into dynamic point clouds with physics restitution, pointer repulsion, and dynamic performance tiers (auto-downgrading from 24k to 12k/6k particles based on frame rate).
- **Interactive ML Lab (`/lab`)**: Scripted walkthrough of the OCR pipeline on synthetic samples featuring live OBB bounding box locks, laser sweep animations, character confidence matrices, and exportable JSON telemetry.
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
- **GitHub**: [github.com/Lourdhu02](https://github.com/Lourdhu02)
- **LinkedIn**: [linkedin.com/in/lourdhu](https://linkedin.com/in/lourdhu)
- **Kaggle**: [kaggle.com/blourdhuraju](https://kaggle.com/blourdhuraju)
- **Studio**: [spacedrift.in](https://spacedrift.in)

---

© 2026 Lourdu Raju. All rights reserved.
