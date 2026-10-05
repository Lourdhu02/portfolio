import type { Metadata } from "next";
import { Big_Shoulders, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { JinxMode } from "@/components/JinxMode";
import { Navigation } from "@/components/ui/Navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { TRUTH } from "@/content/truth";

// Big Shoulders Display now ships on Google Fonts as the variable "Big Shoulders" family (opsz axis).
const fontDisplay = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  // next/font has no metric overrides for this family yet, so name the closest condensed fallback.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
});

const fontSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const { name, role, pitch, siteUrl, links } = TRUTH.identity;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${name} · ${role}`, template: `%s · ${name}` },
  description: pitch,
  authors: [{ name, url: siteUrl }],
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} · ${role}`,
    description: pitch,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${name} · ${role}`, description: pitch },
};

// Lets search engines show Raju as a person with a role, employer and profiles.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name,
  jobTitle: role,
  url: siteUrl,
  worksFor: { "@type": "Organization", name: TRUTH.identity.company },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  sameAs: [links.github, links.linkedin, links.kaggle, links.studio],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <MotionProvider>
          <SmoothScroll>
          <JinxMode />
          <ScrollProgress />
          <Navigation />
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden" style={{ viewTransitionName: "site-grain" }}>
            <div className="film-grain absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(5,5,7,0.7)_100%)]" />
          </div>
          {children}
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
