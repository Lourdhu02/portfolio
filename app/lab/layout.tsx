import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lab',
  description: 'A scripted walkthrough of a meter-reading OCR pipeline: detection, cropping and CTC decoding, on synthetic samples.',
  alternates: { canonical: '/lab' },
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children
}
