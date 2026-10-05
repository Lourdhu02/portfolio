/**
 * The one place the site's claims live.
 *
 * Rule: a number reaches the page only through this file, and a number is in
 * this file only if a repository backs it. Every metric says what was measured
 * (`context`) and where the measurement is recorded (`source`), and the UI
 * prints that next to the number. Change a figure here and every page follows.
 */

export type Source = {
  /** Short name shown on the page, e.g. "triton-server". */
  name: string
  /** File inside that source that records the figure. */
  path: string
  /** Public link. Omitted for private repos, which the page labels as such. */
  url?: string
}

export type Metric = {
  value: number
  /** Baseline, when the claim is an improvement. */
  before?: number
  unit: string
  /** Decimal places to display. */
  decimals?: number
  label: string
  /** How it was measured, in one plain sentence. */
  context: string
  source: Source
}

const triton = (path: string): Source => ({ name: 'triton-server', path })
const gh = (repo: string, path: string): Source => ({
  name: repo,
  path,
  url: `https://github.com/Lourdhu02/${repo}/blob/main/${path}`,
})
const resume: Source = { name: 'résumé', path: 'LourduRaju_Resume.pdf', url: '/LourduRaju_Resume.pdf' }

export const METRICS = {
  meterOcr: {
    p50: {
      before: 1386,
      value: 60,
      unit: 'ms',
      label: 'End-to-end p50, GPU path vs serverless',
      context: 'The same 1,000 meter photos sent through the production router at 14 req/s, timed at the client.',
      source: triton('westbengal/ec2/router-lambda/TEST_RESULTS.md'),
    },
    throughput: {
      before: 19,
      value: 321,
      unit: 'img/s',
      label: 'Single-image throughput',
      context: 'At 16 concurrent requests on the GB10 dev box, after moving the last classifier from ONNX Runtime to TensorRT.',
      source: triton('CHANGELOG.md'),
    },
    p50AtLoad: {
      before: 873,
      value: 47,
      unit: 'ms',
      label: 'Single-image p50 at 16 concurrent',
      context: 'Same run as the throughput figure.',
      source: triton('CHANGELOG.md'),
    },
    classifierCompute: {
      before: 309.5,
      value: 3.3,
      unit: 'ms',
      decimals: 1,
      label: 'Meter-classifier compute',
      context: 'ONNX Runtime to TensorRT FP16, after patching a UINT8 Transpose that TensorRT rejects.',
      source: triton('CHANGELOG.md'),
    },
    sustainedL4: {
      value: 181,
      unit: 'img/s',
      label: 'Sustained throughput on one NVIDIA L4',
      context: 'g6.2xlarge under a paced load test; the ceiling is the host CPU, not the GPU.',
      source: triton('westbengal/ec2/router-lambda/README.md'),
    },
    productionPeak: {
      value: 14.4,
      unit: 'req/s',
      decimals: 1,
      label: 'Production peak',
      context: 'Busiest five minutes on the busiest day, 22 Aug 2026 (CloudWatch).',
      source: triton('eval/scripts/peak_test.py'),
    },
    busiestDay: {
      value: 330707,
      unit: 'requests',
      label: 'Requests on the busiest day',
      context: 'West Bengal production, 22 Aug 2026 (CloudWatch).',
      source: triton('eval/scripts/peak_test.py'),
    },
    weeklyRequests: {
      value: 121181,
      unit: 'requests',
      label: 'Requests a week, zero 4xx and zero 5xx',
      context: 'CloudWatch, the seven days to 17 Sep 2026.',
      source: triton('westbengal/ec2/router-lambda/README.md'),
    },
    readingAccuracy: {
      value: 83.4,
      unit: '%',
      decimals: 1,
      label: 'Reading accuracy, West Bengal',
      context: '2,950 labelled photos from the fixed 3,965-image test set. Every release must reproduce it before it ships.',
      source: triton('README.md'),
    },
    invalidDetection: {
      value: 99.8,
      unit: '%',
      decimals: 1,
      label: 'Unreadable photos caught',
      context: '1,015 blurred, blank or non-meter photos from the same test set, answered "NA" instead of a wrong number.',
      source: triton('README.md'),
    },
    biharAccuracy: {
      value: 90.5,
      unit: '%',
      decimals: 1,
      label: 'Reading accuracy, Bihar',
      context: '95 labelled photos through all six routes on a T4, measured on the box.',
      source: triton('bihar/ec2/version-1/README.md'),
    },
    biharP50: {
      value: 79,
      unit: 'ms',
      label: 'Bihar p50 on a T4',
      context: 'Five-field routes, 600 requests, no errors.',
      source: triton('README.md'),
    },
    engines: {
      value: 11,
      unit: '',
      label: 'TensorRT FP16 engines',
      context: 'Nine for West Bengal; Bihar adds a parameter classifier and a spoof check.',
      source: triton('README.md'),
    },
    rolloutRequests: {
      value: 8000,
      unit: 'requests',
      label: 'Shadow and canary rollout, 0 errors',
      context: 'Eight stages of 1,000 requests, from shadow 10% to canary 100%, with zero errors and zero fallbacks.',
      source: triton('westbengal/ec2/router-lambda/TEST_RESULTS.md'),
    },
    canaryGap: {
      before: 88.1,
      value: 83.6,
      unit: '%',
      decimals: 1,
      label: 'Serverless vs GPU path accuracy in canary',
      context: '800 labelled photos. The ladder caught the gap, mostly analog dials, and held rollout until it was understood.',
      source: triton('westbengal/ec2/router-lambda/TEST_RESULTS.md'),
    },
    regressionTests: {
      value: 211,
      unit: 'tests',
      label: 'API and router regression tests',
      context: 'Run on every change.',
      source: triton('README.md'),
    },
    archiveDrops: {
      value: 475,
      unit: 'objects',
      label: 'S3 objects lost to fire-and-forget archiving',
      context: 'In a 1,000-image burst test on version 1. Version 2 spools failures to disk and replays them.',
      source: triton('westbengal/ec2/version-2/README.md'),
    },
  },
  achilles: {
    labs: {
      value: 18,
      unit: 'labs',
      label: 'Test-driven labs',
      context: 'Autograd to mixture of experts, each with a handout, an exercise and a reference solution.',
      source: gh('achilles', 'README.md'),
    },
    tests: {
      value: 229,
      unit: 'tests',
      label: 'Reference tests passing in CI',
      context: 'On Linux, Windows and macOS, with the Triton kernels in Triton’s CPU interpreter.',
      source: gh('achilles', 'README.md'),
    },
  },
  echome: {
    memoryRecall: {
      before: 0,
      value: 92,
      unit: '%',
      label: 'Multi-session memory recall',
      context: '11 of 12 scenarios recall the needed fact, up to 52 turns back. The baseline is the same agent with memory off.',
      source: gh('echome', 'tests/eval/run_eval.py'),
    },
    assessmentCut: {
      value: 70,
      unit: '%',
      label: 'Shorter personality assessment',
      context: 'Fisher-information item selection keeps standard error under 0.32 across 8 traits.',
      source: gh('echome', 'README.md'),
    },
  },
  svtrv2: {
    tests: {
      value: 49,
      unit: 'tests',
      label: 'Tests passing, 17 of them for ARD',
      context: 'Routing and distillation ship behind flags, including an end-to-end CPU fit with both on.',
      source: gh('svtrv2', 'agents/status.md'),
    },
  },
  finSentinel: {
    corpus: {
      value: 1000,
      unit: 'documents',
      label: 'Synthetic finance corpus',
      context: 'Invoices, salary slips, bank statements, GST returns, purchase orders, credit and debit notes across 10 layouts.',
      source: gh('fin-sentinal.ai', 'test-data/sugar_dataset/manifest.csv'),
    },
  },
} as const satisfies Record<string, Record<string, Metric>>

export const TRUTH = {
  identity: {
    name: 'Lourdu Raju',
    role: 'Machine Learning Engineer',
    focus: 'Production Computer Vision · GPU Inference · Applied GenAI',
    company: 'Sujanix',
    location: 'Bengaluru, India',
    phone: '+91 99595 94460',
    email: 'b.lourdhuraju1234@gmail.com',
    mission: 'I make vision models fast, honest and boring to run.',
    /** Hero line under the name. Design places it; Content owns the words. */
    headline: 'Vision models that answer in milliseconds and say “I don’t know” when they should.',
    /** One-breath pitch for the hero and meta description. */
    pitch:
      'Machine learning engineer in Bengaluru. I build and serve production OCR for two state electricity utilities on TensorRT and Triton, and every number on this site links to where it was measured.',
    links: {
      github: 'https://github.com/Lourdhu02',
      linkedin: 'https://linkedin.com/in/lourdhu',
      kaggle: 'https://kaggle.com/blourdhuraju',
      studio: 'https://spacedrift.in',
      preprint: 'https://philarchive.org/rec/BANNFS',
      achilles: 'https://github.com/Lourdhu02/achilles',
      echome: 'https://github.com/Lourdhu02/echome',
      svtrv2: 'https://github.com/Lourdhu02/svtrv2',
      finSentinel: 'https://github.com/Lourdhu02/fin-sentinal.ai',
      resume: '/LourduRaju_Resume.pdf',
    },
  },
  studio: {
    name: 'spacedrift',
    team: 5,
    clients: 36,
    repeatClients: 6,
    revenueLakh: 12,
    source: resume,
  },
  career: [
    {
      role: 'Machine Learning Engineer',
      company: 'Sujanix Private Limited',
      location: 'Bengaluru, India',
      period: 'Jan 2026 – Present',
      description:
        'Own the meter-reading OCR platform for two state electricity utilities: 11 TensorRT FP16 engines behind Triton, a hash-bucketed router with serverless fallback, and the benchmarks that gate every release.',
    },
    {
      role: 'Founder',
      company: 'spacedrift',
      location: 'Bengaluru, India',
      period: 'Aug 2024 – Present',
      description:
        'Run a 5-person ML and AI studio: 36 clients (6 repeat) and INR 12 lakh revenue from fixed-scope work in reproducible research ops and document AI.',
    },
    {
      role: 'Data Science Intern',
      company: 'BrainOvision Solutions',
      location: 'Hyderabad, India',
      period: 'Feb 2024 – Apr 2024',
      description:
        'Built sales-forecasting models with gradient-boosted ensembles and structured feature engineering.',
    },
  ],
  publications: [
    {
      title: 'No Final Save: Identity, Consciousness, and the Machine That Never Shuts Down',
      venue: 'Preprint, PhilArchive',
      year: '2026',
      url: 'https://philarchive.org/rec/BANNFS',
      description:
        'A 23-page framework for persistent AI agents: a causal-continuity criterion for identity, a proof that terminal and instrumental self-preservation cannot be told apart from behaviour alone, and a developmental safety model.',
    },
    {
      title: 'Achilles: Core AI from First Principles',
      venue: 'Open-source curriculum',
      year: '2025–2026',
      url: 'https://github.com/Lourdhu02/achilles',
      description:
        '18 test-driven labs from autograd to FlashAttention in Triton, DPO, GRPO, quantization and mixture of experts, with 229 reference tests in CI on three operating systems.',
    },
  ],
  certifications: [
    { title: 'Kaggle Notebooks Expert', issuer: 'Kaggle', date: 'Notebooks tier' },
    {
      title: 'Machine Learning Specialization',
      issuer: 'DeepLearning.AI & Stanford University',
      date: 'Supervised, unsupervised and advanced learning',
    },
    { title: 'NPTEL Data Science', issuer: 'IIT Madras', date: 'Data science and applied algorithms' },
  ],
  education: {
    institution: 'Andhra Loyola Institute of Engineering and Technology',
    degree: 'Bachelor of Technology in Computer Science and Engineering',
    graduation: 'May 2024',
    location: 'Vijayawada, India',
  },
}

/** 330707 → "330,707"; respects `decimals`. */
export function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** "60 ms", "99.8%", "321 img/s". */
export function show(m: Metric, which: 'value' | 'before' = 'value'): string {
  const n = which === 'before' ? m.before : m.value
  if (n === undefined) throw new Error(`${m.label} has no baseline`)
  const unit = m.unit === '%' ? '%' : m.unit ? ` ${m.unit}` : ''
  return `${fmt(n, m.decimals)}${unit}`
}

/** Improvement factor, e.g. 1386 → 60 ms is 23. Lower-is-better units invert. */
export function factor(m: Metric): number {
  if (m.before === undefined) throw new Error(`${m.label} has no baseline`)
  const lowerIsBetter = m.unit === 'ms'
  return lowerIsBetter ? m.before / m.value : m.value / m.before
}

/** Headroom of the L4 over production's busiest five minutes. */
export const headroom = METRICS.meterOcr.sustainedL4.value / METRICS.meterOcr.productionPeak.value
