import type { Metadata } from "next";
import { Big_Shoulders, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { JinxMode } from "@/components/JinxMode";
import { Navigation } from "@/components/ui/Navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
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

export const metadata: Metadata = {
  title: "Lourdu Raju · Machine Learning Engineer",
  description: TRUTH.identity.pitch,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <JinxMode />
          <Navigation />
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            <div className="film-grain absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(5,5,7,0.7)_100%)]" />
          </div>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
