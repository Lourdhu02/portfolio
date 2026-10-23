import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TRUTH } from '@/content/truth'
import { Header, Footer } from '@/components/SiteChrome'
import { withBase } from '@/lib/path'
import { siteAddress } from '@/lib/site'
import { MotionSystem } from '@/components/MotionSystem'
import './globals.css'
const sans = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
})
const { name, role, pitch, links } = TRUTH.identity
export const metadata: Metadata = {
  metadataBase: new URL(siteAddress()),
  title: { default: `${name} — ${role}`, template: `%s — ${name}` },
  description: pitch,
  alternates: { canonical: siteAddress() },
  openGraph: {
    type: 'website',
    siteName: name,
    title: `${name} — ${role}`,
    description: pitch,
    url: siteAddress(),
    images: [{ url: withBase('/og.png'), width: 1200, height: 630, alt: `${name}, ${role}` }],
  },
  twitter: { card: 'summary_large_image', images: [withBase('/og.png')] },
  icons: { icon: withBase('/icon.svg') },
}
const themeScript = `try{var t=localStorage.getItem('portfolio-theme')||'light';if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme}catch{document.documentElement.dataset.theme='light'}`
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sameAs = [...new Set(Object.values(links).filter((url) => url.startsWith('https://')))]
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>
            {'[data-motion], [data-page-stage] { opacity:1!important; transform:none!important; }'}
          </style>
        </noscript>
        {sameAs.map((url) => (
          <link key={url} rel="me" href={url} />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name,
              jobTitle: role,
              url: siteAddress(),
              worksFor: { '@type': 'Organization', name: TRUTH.identity.company },
              sameAs,
            }).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <div className="shell">
          <Header />
          <MotionSystem>{children}</MotionSystem>
          <Footer />
        </div>
        <script src={withBase('/preferences.js')} defer />
      </body>
    </html>
  )
}
