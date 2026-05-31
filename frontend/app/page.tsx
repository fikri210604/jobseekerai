import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Flame,
  Globe2,
  Layers3,
  MapPin,
  Megaphone,
  Palette,
  Quote,
  Search,
  Settings,
  Sparkles,
  Terminal,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TextType from "@/components/ui/TextType";
import { JobDistributionMap } from "@/components/features/search/JobDistributionMap";
import { SemanticSearchBar } from "@/components/features/search/SemanticSearchBar";
import JobCategoryChart from "@/components/features/search/JobCategoryChart";
import DotGrid from "@/components/ui/DotGrid";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export const metadata: Metadata = {
  title: "SkillBridge AI - Bridging Talents to Industry Standards",
  description:
    "Temukan pekerjaan impian dengan pencocokan AI berbasis semantic intelligence untuk pasar kerja Indonesia.",
};

const partners = ["Bluebird", "Oppo", "A&W", "Ruangguru", "Tokopedia"];

const categories = [
  { label: "Admin & HR", icon: UserRound, tone: "indigo" },
  { label: "Marketing", icon: Megaphone, tone: "indigo" },
  { label: "Operasional", icon: Settings, tone: "indigo" },
  { label: "Aktif Merekrut", icon: Flame, tone: "red" },
  { label: "IT & Tech", icon: Terminal, tone: "indigo" },
  { label: "Desain", icon: Palette, tone: "indigo" },
  { label: "Keuangan", icon: Banknote, tone: "indigo" },
  { label: "WFH / Remote", icon: Globe2, tone: "emerald" },
];

const urgentRoles = [
  "Data Analyst",
  "Digital Marketing",
  "Customer Service",
  "Web Developer",
  "UI/UX Designer",
  "DevOps Engineer",
];

const testimonials = [
  {
    body: "Proses pencarian kandidat menjadi jauh lebih cepat, terutama untuk kebutuhan talenta tech yang spesifik.",
    name: "PT Growing Rich",
    role: "Startup Talent Partner",
  },
  {
    body: "SkillBridge membantu kami membaca kecocokan kandidat dengan lebih objektif lewat metrik kompetensi yang jelas.",
    name: "CV Herba Bumi Pertiwi",
    role: "Operation Manager",
  },
  {
    body: "Arahan AI-nya membuat tim HR lebih mudah menyusun prioritas skill dan memahami gap kandidat.",
    name: "PT Komo Estetika Indonesia",
    role: "Human Resources",
  },
];

const technologyCards = [
  {
    icon: Layers3,
    title: "SBERT Semantic Matching",
    description:
      "Memahami makna kontekstual di balik resume dan deskripsi pekerjaan, melampaui pencocokan kata kunci biasa.",
    token: "MULTILINGUAL-L12-V2",
    accent: "var(--sb-indigo)",
    surface: "var(--sb-indigo-dim)",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Hybrid ML Scoring",
    description:
      "Fusion ML dengan heuristic scoring untuk prediksi akurat.",
    token: "60% Heuristic + 40% ML",
    accent: "var(--sb-emerald)",
    surface: "var(--sb-emerald-dim)",
  },
  {
    icon: Sparkles,
    title: "Gemini AI Career Advisor",
    description:
      "Narasi karir, roadmap skill, dan draft cover letter yang dipersonalisasi secara real-time oleh Gemini AI.",
    token: "gemini-2.5-flash",
    accent: "var(--sb-amber)",
    surface: "var(--sb-amber-dim)",
  },
];

function toneStyles(tone: string) {
  if (tone === "emerald") {
    return {
      color: "var(--sb-emerald)",
      background: "var(--sb-emerald-dim)",
      border: "rgba(16,185,129,0.28)",
    };
  }

  if (tone === "red") {
    return {
      color: "var(--sb-red)",
      background: "var(--sb-red-dim)",
      border: "rgba(239,68,68,0.28)",
    };
  }

  return {
    color: "var(--sb-indigo)",
    background: "var(--sb-indigo-dim)",
    border: "rgba(94,106,210,0.28)",
  };
}

function CategoryCard({
  label,
  icon: Icon,
  tone,
}: {
  label: string;
  icon: React.ElementType;
  tone: string;
}) {
  const style = toneStyles(tone);

  return (
    <Card
      size="sm"
      className="rounded-xl border transition-colors hover:border-[var(--sb-hairline-strong)]"
      style={{
        background: "var(--sb-surface-1)",
        borderColor: style.border,
      }}
    >
      <CardContent className="flex items-center gap-3 px-4 py-4">
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ background: style.background, color: style.color }}
        >
          <Icon size={17} />
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function Marker({
  city,
  count,
  className,
  tone = "indigo",
  large = false,
}: {
  city: string;
  count: string;
  className: string;
  tone?: "indigo" | "emerald" | "amber";
  large?: boolean;
}) {
  const color =
    tone === "emerald"
      ? "var(--sb-emerald)"
      : tone === "amber"
        ? "var(--sb-amber)"
        : "var(--sb-indigo)";

  return (
    <div className={`absolute flex flex-col items-center ${className}`}>
      <div
        className={`${large ? "size-12" : "size-8"} flex items-center justify-center rounded-full border`}
        style={{ background: `${color}22`, borderColor: color }}
      >
        <div
          className={`${large ? "size-4" : "size-2.5"} rounded-full`}
          style={{ background: color }}
        />
      </div>
      <div className="mt-2 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-3 py-1 shadow-lg">
        <p className="text-[10px] font-bold uppercase" style={{ color }}>
          {city}
        </p>
        <p className="font-metric text-sm text-foreground">{count}</p>
      </div>
    </div>
  );
}

  export default function LandingPage() {
    return (
      <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl space-y-24 px-4 py-10 sm:px-6 lg:px-8">
        <section className="px-4 py-16 text-center sm:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <Badge
              className="mb-5 rounded-full border px-3 py-1 normal-case tracking-normal"
              style={{
                background: "var(--sb-indigo-dim)",
                color: "var(--sb-indigo)",
                borderColor: "var(--sb-indigo-glow)",
              }}
            >
              <Sparkles size={12} />
              Semantic Career Intelligence
            </Badge>

            <div className="flex flex-col gap-4">
              <TextType
                text={[
                  "Bridging Talents to Industry Standards via Semantic Intelligence",
                  "Temukan pekerjaan impianmu dengan pencocokan berbasis AI yang akurat",
                ]}
                className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl"
              />
            </div>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Temukan pekerjaan impianmu dengan pencocokan berbasis AI yang
              menganalisis kedalaman skill terhadap standar industri secara
              presisi.
            </p>

            <div className="mx-auto mt-10 w-full max-w-4xl">
              <SemanticSearchBar />
            </div>

            <div className="mt-12">
              <p className="font-metric text-xs uppercase text-muted-foreground">
                Trusted By Industry Leaders
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                {partners.map((partner) => (
                  <div
                    key={partner}
                    className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-4 py-2 text-sm font-semibold text-muted-foreground opacity-70"
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto mt-20 max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--sb-hairline-strong)] bg-gradient-to-b from-[var(--sb-surface-2)] to-[var(--sb-surface-1)] p-10 text-center shadow-[0_10px_40px_-10px_rgba(94,106,210,0.15)]">
              <div className="absolute left-1/2 top-0 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--sb-indigo)] to-transparent opacity-50"></div>
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[50px] w-[50px] rounded-full bg-[var(--sb-indigo)] blur-[50px] opacity-20"></div>
              
              <div className="relative z-10">
                <Sparkles className="mx-auto mb-4 text-[var(--sb-indigo)]" size={28} strokeWidth={1.5} />
                <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Belum tahu karir apa yang cocok untukmu?
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-muted-foreground leading-relaxed">
                  Cari tahu potensi karir terbaikmu berdasarkan background pendidikan, skill, dan pengalaman menggunakan AI cerdas kami.
                </p>
                
                <Button asChild className="group relative h-14 overflow-hidden rounded-full px-8 text-base font-medium shadow-[0_0_20px_-5px_rgba(94,106,210,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(94,106,210,0.6)]" style={{ background: "var(--sb-indigo)", color: "#fff" }}>
                  <Link href="/predict" className="flex items-center gap-2">
                    <span className="relative z-10 flex items-center gap-2">
                      Mulai Prediksi <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                Categories
              </Badge>
              <h2 className="text-2xl font-semibold text-foreground">
                Kategori pekerjaan populer
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-fit normal-case tracking-normal"
            >
              <Link href="/search">Lihat semua kategori</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.label} {...category} />
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-2xl border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-1)] p-6 md:grid-cols-[1fr_auto_1fr] md:p-8">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Dibutuhkan segera
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {urgentRoles.map((role, index) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-[var(--sb-indigo)] hover:text-foreground"
                >
                  {role}
                  {index === 0 && (
                    <span className="size-1.5 rounded-full bg-[var(--sb-indigo)] animate-pulse-dot" />
                  )}
                </span>
              ))}
            </div>
          </div>
          <Separator
            orientation="vertical"
            className="hidden h-full md:block"
          />
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Metrik real-time
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="font-metric text-xs uppercase text-muted-foreground">
                  Total loker
                </p>
                <p className="font-metric text-2xl text-[var(--sb-indigo)]">
                  4,911
                </p>
              </div>
              <div>
                <p className="font-metric text-xs uppercase text-muted-foreground">
                  Ter-index AI
                </p>
                <p className="font-metric text-2xl text-[var(--sb-emerald)]">
                  756
                </p>
              </div>
              <div>
                <p className="font-metric text-xs uppercase text-muted-foreground">
                  ML Models
                </p>
                <p className="font-metric text-2xl text-[var(--sb-amber)]">
                  3
                </p>
              </div>
              <div>
                <p className="font-metric text-xs uppercase text-muted-foreground">
                  AI Advisor
                </p>
                <p className="font-metric text-2xl text-foreground">
                  Gemini
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">
              Success Stories
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground">
              Cerita dari bisnis seperti Anda
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Bergabunglah dengan profesional dan tim rekrutmen yang telah
              menemukan kecocokan karir melalui SkillBridge AI.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="relative overflow-hidden rounded-[1.5rem] border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] text-foreground transition-transform hover:-translate-y-1 shadow-[0_0_20px_-10px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--sb-indigo)] to-transparent opacity-30"></div>
                <CardContent className="flex h-full flex-col gap-6 p-8">
                  <Quote
                    size={34}
                    color="var(--sb-hairline-strong)"
                    fill="currentColor"
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  <div className="mt-auto">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Distribution
              </Badge>
              <h2 className="text-2xl font-semibold text-foreground">
                Peta distribusi lowongan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Visualisasi volume pekerjaan aktif di seluruh Indonesia.
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-3 py-1.5">
              <span className="size-2 rounded-full bg-[var(--sb-emerald)] animate-pulse-dot" />
              <span className="font-metric text-xs uppercase text-foreground">
                Live updates
              </span>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-1)] p-0 md:min-h-[500px]">
            <JobDistributionMap />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Categories
              </Badge>
              <h2 className="text-2xl font-semibold text-foreground">
                Sebaran Kategori Pekerjaan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Persentase dan volume lowongan pekerjaan aktif berdasarkan
                kategori bidang industri.
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-3 py-1.5">
              <span className="size-2 rounded-full bg-[var(--sb-indigo)] animate-pulse-dot" />
              <span className="font-metric text-xs uppercase text-foreground">
                Category Insights
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-1)] p-6 md:p-8">
            <JobCategoryChart />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {technologyCards.map((card) => (
            <Card
              key={card.title}
              className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]"
            >
              <CardHeader>
                <div
                  className="mb-4 flex size-12 items-center justify-center rounded-lg"
                  style={{ background: card.surface, color: card.accent }}
                >
                  <card.icon size={21} />
                </div>
                <CardTitle className="normal-case tracking-normal">
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span
                  className="font-metric rounded border px-2 py-1 text-xs"
                  style={{
                    color: card.accent,
                    background: card.surface,
                    borderColor: `${card.accent}44`,
                  }}
                >
                  {card.token}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      <footer className="border-t border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness size={18} color="var(--sb-indigo)" />
            <span className="text-sm font-bold text-foreground">
              SkillBridge AI
            </span>
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <span className="font-metric text-xs text-muted-foreground">
              2026 v3.0.0 — Gemini AI Ready
            </span>
          </div>
          <div className="flex gap-4">
            {["System Status", "API Docs", "Privacy"].map((item) => (
              <Link
                key={item}
                href="#"
                className="font-metric text-xs text-muted-foreground underline-offset-4 hover:text-[var(--sb-indigo)] hover:underline"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}
