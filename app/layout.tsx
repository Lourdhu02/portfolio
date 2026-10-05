import type { Metadata } from "next";
import { Oswald, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontDisplay = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
});

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lourdu Raju · Machine Learning Engineer",
  description: "I make vision models fast, honest and boring to run.",
};

import { JinxMode } from "@/components/JinxMode";
import { Navigation } from "@/components/ui/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="antialiased">
        <JinxMode />
        <Navigation />
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {/* Film Grain */}
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-[0.03] mix-blend-screen" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,7,0.8)_100%)]" />
        </div>
        {children}
      </body>
    </html>
  );
}
