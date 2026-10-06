import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { JinxMode } from "@/components/JinxMode";
import { Navigation } from "@/components/ui/Navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CommandPalette } from "@/components/interaction/CommandPalette";
import { Cursor } from "@/components/interaction/Cursor";
import { Toaster } from "@/components/interaction/Toaster";
import { themeScript } from "@/components/ui/ThemeToggle";
import { posts } from "#velite";
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

// viewport-fit=cover lets the background run under the notch and home indicator;
// components pad themselves with env(safe-area-inset-*).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F2EE" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const palettePosts = posts
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ slug, title }) => ({ slug, title }));

  return (
    // The head script sets data-theme before hydration, so React must not flag the mismatch.
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-[6px] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-bg"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll>
          <JinxMode />
          <ScrollProgress />
          <CommandPalette posts={palettePosts} />
          <Cursor />
          <Toaster />
          <Navigation />
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden" style={{ viewTransitionName: "site-grain" }}>
            <div className="film-grain absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,color-mix(in_srgb,var(--color-bg)_70%,transparent)_100%)]" />
          </div>
          <div id="content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
