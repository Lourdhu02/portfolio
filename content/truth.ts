export const TRUTH = {
  identity: {
    name: "Lourdu Raju",
    role: "Machine Learning Engineer",
    focus: "Production Computer Vision · GPU Inference · Applied GenAI",
    company: "Sujanix",
    location: "Bengaluru, India",
    phone: "+91 99595 94460",
    email: "b.lourdhuraju1234@gmail.com",
    mission: "I make vision models fast, honest and boring to run.",
    links: {
      github: "https://github.com/Lourdhu02",
      linkedin: "https://linkedin.com/in/lourdhu",
      kaggle: "https://kaggle.com/blourdhuraju",
      studio: "https://spacedrift.in",
      preprint: "https://philarchive.org/rec/BANNFS",
      achilles: "https://github.com/Lourdhu02/achilles",
      resume: "/LourduRaju_Resume.pdf"
    }
  },
  metrics: {
    flagship: {
      readingsProcessed: 40000000,
      accuracy: {
        before: 79,
        after: 91,
      },
      latencyP50: {
        before: 1415,
        after: 156,
      },
      latencyP95: {
        before: 1714,
        after: 205,
      },
      classifierCompute: {
        before: 309.5,
        after: 3.3,
      },
      throughput: {
        before: 19,
        after: 321,
      },
      capacity1L4: 181,
      p95AtCapacity: 340,
      peakLoadMultiplier: 12.6,
      containerSizeGB: {
        before: 4.43,
        after: 2.2,
      },
      svtrv2TrainingThroughput: {
        before: 80,
        after: 305,
      },
      svtrv2PeakMemoryGB: {
        before: 50.5,
        after: 14.7,
      },
      exactMatchReleases: {
        before: 83.4,
        after: 87.8,
      },
      analogReads: {
        before: 67.2,
        after: 79.6,
      }
    },
    openSource: {
      contributions: 271,
      stars: 42,
      testsPassing: 229,
      achillesLabs: 18,
    }
  },
  career: [
    {
      role: "Machine Learning Engineer",
      company: "Sujanix Private Limited",
      location: "Bengaluru, India",
      period: "Jan 2026 – Present",
      description: "Owns 5-model meter reading pipeline (MobileViTv2, YOLO26n-OBB, SVTRv2+CTC) handling up to 330k req/day across 40M+ production readings. Built Triton GPU serving path with 9 TensorRT FP16 engines on NVIDIA L4 (p50 1415 -> 156ms)."
    },
    {
      role: "Founder",
      company: "spacedrift",
      location: "Bengaluru, India",
      period: "Aug 2024 – Present",
      description: "Founded and lead a 5-person ML & AI studio. Generated INR 12 lakh revenue from 36 clients (6 repeat). Specialized in reproducible PhD research ops and document AI."
    },
    {
      role: "Data Science Intern",
      company: "BrainOvision Solutions",
      location: "Hyderabad, India",
      period: "Feb 2024 – Apr 2024",
      description: "Built sales-forecasting models with ensemble gradient boosting and structured feature engineering, lifting forecast accuracy 15%."
    }
  ],
  publications: [
    {
      title: "No Final Save: Identity, Consciousness, and the Machine That Never Shuts Down",
      venue: "Preprint, PhilArchive",
      year: "2026",
      url: "https://philarchive.org/rec/BANNFS",
      description: "A 23-page formal framework for persistent AI agents: causal-continuity criterion for identity, indistinguishability proof for terminal vs instrumental self-preservation, and a developmental safety model."
    },
    {
      title: "Achilles — Core AI from First Principles",
      venue: "Open Source Curriculum",
      year: "2025–2026",
      url: "https://github.com/Lourdhu02/achilles",
      description: "18 test-driven labs covering autograd, Llama transformers, Triton FlashAttention forward/backward kernels, KV caching, LoRA, DPO, GRPO, quantization, and MoE with 229 reference tests in CI."
    }
  ],
  certifications: [
    {
      title: "Kaggle Notebooks Expert",
      issuer: "Kaggle",
      date: "Ranked Competitive ML"
    },
    {
      title: "Machine Learning Specialization",
      issuer: "DeepLearning.AI & Stanford University",
      date: "Supervised, Unsupervised & Advanced Learning"
    },
    {
      title: "NPTEL Data Science",
      issuer: "IIT Madras",
      date: "Data Science & Applied Algorithms"
    }
  ],
  education: {
    institution: "Andhra Loyola Institute of Engineering and Technology",
    degree: "Bachelor of Technology in Computer Science and Engineering",
    graduation: "May 2024",
    location: "Vijayawada, India"
  }
};
