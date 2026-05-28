import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import DotGrid from "@/components/ui/DotGrid";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillBridge AI — Career Intelligence Platform",
    template: "%s | SkillBridge AI",
  },
  description:
    "Platform career advisor berbasis AI dengan SBERT Semantic Search, XGBoost Re-ranking, dan SKKNI Competency Mapping untuk pasar kerja Indonesia.",
  keywords: [
    "career advisor",
    "AI job matching",
    "SBERT",
    "XGBoost",
    "SKKNI",
    "Indonesia",
    "talent analytics",
  ],
  openGraph: {
    title: "SkillBridge AI",
    description: "Bridging Talents to Industry Standards via Semantic Intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased",
        inter.variable,
        geistMono.variable
      )}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--sb-canvas)", color: "var(--sb-ink)" }}
      >
        {/* Global Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DotGrid
            dotSize={4}
            gap={32}
            baseColor="#30363d"
            activeColor="#5e6ad2"
            proximity={150}
            speedTrigger={50}
            shockRadius={200}
            shockStrength={3}
            maxSpeed={3000}
            resistance={600}
            returnDuration={1.5}
            className="opacity-50"
          />
        </div>

        <TooltipProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
