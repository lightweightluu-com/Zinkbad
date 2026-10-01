import type { Metadata } from "next";
import { Anton, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  // Testdomain nicht indexieren; für Livegang NEXT_PUBLIC_INDEXABLE=1 beim Build setzen
  robots: process.env.NEXT_PUBLIC_INDEXABLE === "1" ? undefined : { index: false, follow: false },
  title: "Z!NKBAD CLUB — Zürich",
  description: "Z!NKBAD Club, Geerenweg 2, 8048 Zürich. Events, Tickets und Membercards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${body.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/* Fullpage-Modus auf der Startseite schon vor dem ersten Paint, damit nichts springt */}
        <script dangerouslySetInnerHTML={{ __html: 'if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("fp")' }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
