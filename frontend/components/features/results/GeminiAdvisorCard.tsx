"use client";

// components/features/results/GeminiAdvisorCard.tsx
// Komponen AI Career Advisor yang menggunakan Gemini API
// Auto-trigger saat results tersedia, menampilkan narasi advisor + skill roadmap + cover letter

import { useEffect, useRef, useState, useCallback } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGeminiAdvisorStore, useResultsStore, useUserStore } from "@/lib/store";
import { fetchGeminiAdvice } from "@/lib/api";
import type { SkillGapRecommendation, JobListing, MatchResult } from "@/types";

// ── Typewriter Hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

// ── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: SkillGapRecommendation["priority"] }) {
  const styles = {
    High: {
      bg: "var(--sb-red-dim)",
      color: "var(--sb-red)",
      border: "rgba(239,68,68,0.25)",
    },
    Medium: {
      bg: "var(--sb-amber-dim)",
      color: "var(--sb-amber)",
      border: "rgba(245,158,11,0.25)",
    },
    Low: {
      bg: "var(--sb-emerald-dim)",
      color: "var(--sb-emerald)",
      border: "rgba(16,185,129,0.25)",
    },
  };
  const s = styles[priority];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {priority.toUpperCase()}
    </span>
  );
}

// ── Skill Gap Card ────────────────────────────────────────────────────────────

function SkillGapCard({
  item,
  index,
}: {
  item: SkillGapRecommendation;
  index: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] p-4 transition-all duration-200 hover:border-[var(--sb-indigo-glow)] hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Accent line kiri */}
      <div
        className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl"
        style={{
          background:
            item.priority === "High"
              ? "var(--sb-red)"
              : item.priority === "Medium"
                ? "var(--sb-amber)"
                : "var(--sb-emerald)",
        }}
      />

      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <span className="truncate text-sm font-semibold text-foreground">
              {item.skill}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
        </div>
        <span className="font-metric shrink-0 text-[10px] font-bold text-muted-foreground opacity-40">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 pl-3">
        <BookOpen size={12} className="shrink-0 text-[var(--sb-indigo)]" />
        <p className="text-[11px] text-[var(--sb-indigo)]">{item.resource}</p>
      </div>
    </div>
  );
}

// ── Tab Types ─────────────────────────────────────────────────────────────────

type Tab = "narrative" | "roadmap" | "cover";

// ── Main Component ────────────────────────────────────────────────────────────

export function GeminiAdvisorCard({ job }: { job?: JobListing }) {
  const { results, hasResults } = useResultsStore();
  const { skills, softSkills, education, experienceYears, location, expectedSalary, preferredCategory, workArrangement } =
    useUserStore();
  const { advice, isLoading, error, hasAdvice, setAdvice, setLoading, setError } =
    useGeminiAdvisorStore();

  const [activeTab, setActiveTab] = useState<Tab>("narrative");
  const [copied, setCopied] = useState(false);
  const fetchedRef = useRef(false);

  const effectiveResults: MatchResult[] = job
    ? [
        {
          ...job,
          rank: 1,
          confidence_score: 1.0,
          confidence_pct: "100%",
          score_method: "Direct Analysis",
          match_details: {
            semantic_score: 1.0,
            ml_prediction_score: 1.0,
            fusion_score: 1.0,
            semantic_sim_score: 1.0,
            extracted_keywords_sim: 1.0,
            hybrid_score: 1.0,
          },
        } as unknown as MatchResult,
      ]
    : results;
  const isReady = job ? true : hasResults;

  const { displayed: narrativeDisplay, done: narrativeDone } = useTypewriter(
    advice?.career_narrative ?? "",
    14
  );

  const runAnalysis = useCallback(async () => {
    if (!isReady || effectiveResults.length === 0) return;

    setLoading(true);
    fetchedRef.current = true;

    try {
      const data = await fetchGeminiAdvice({
        skills,
        softSkills,
        education,
        experienceYears,
        location,
        expectedSalary,
        preferredCategory,
        workArrangement,
        results: effectiveResults,
      });
      setAdvice(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungi Gemini.";
      setError(msg);
    }
  }, [isReady, effectiveResults, skills, softSkills, education, experienceYears, location, expectedSalary, preferredCategory, workArrangement, setLoading, setAdvice, setError]);

  // Auto-trigger saat results tersedia (hanya sekali)
  useEffect(() => {
    if (isReady && !hasAdvice && !isLoading && !fetchedRef.current) {
      runAnalysis();
    }
  }, [isReady, hasAdvice, isLoading, runAnalysis]);

  const handleCopy = () => {
    if (advice?.cover_letter_opening) {
      navigator.clipboard.writeText(advice.cover_letter_opening);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "narrative", label: "Career Narrative", icon: Sparkles },
    { id: "roadmap", label: "Skill Roadmap", icon: TrendingUp },
    { id: "cover", label: "Cover Letter", icon: Lightbulb },
  ];

  // ── Skeleton Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[var(--sb-indigo-glow)] bg-[var(--sb-surface-1)]">
        {/* Glowing top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sb-indigo)] to-transparent" />
        {/* Ambient glow */}
        <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[var(--sb-indigo)] opacity-[0.06] blur-3xl" />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--sb-indigo-dim)]">
              <Sparkles size={16} className="text-[var(--sb-indigo)] animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-40 rounded bg-[var(--sb-surface-2)] animate-pulse mb-1.5" />
              <div className="h-3 w-56 rounded bg-[var(--sb-surface-2)] animate-pulse opacity-60" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-[var(--sb-surface-2)] animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-[var(--sb-surface-2)] animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-[var(--sb-surface-2)] animate-pulse" />
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground animate-pulse">
            Gemini sedang menganalisis profil dan hasil matching kamu...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[var(--sb-surface-1)] p-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-[var(--sb-red)]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Gemini AI tidak tersedia</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            className="shrink-0 rounded-lg normal-case tracking-normal"
          >
            <RefreshCw size={13} /> Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty / Not triggered ────────────────────────────────────────────────
  if (!hasAdvice || !advice) {
    return null;
  }

  // ── Main Card ────────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--sb-indigo-glow)] bg-[var(--sb-surface-1)]">
      {/* Glowing top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sb-indigo)] to-transparent" />
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-[var(--sb-indigo)] opacity-[0.05] blur-3xl pointer-events-none" />

      <div className="relative">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[var(--sb-hairline)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ background: "var(--sb-indigo-dim)" }}
            >
              <Sparkles size={16} style={{ color: "var(--sb-indigo)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Gemini AI Career Advisor
                </span>
                <Badge
                  className="rounded px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal"
                  style={{
                    background: "var(--sb-indigo-dim)",
                    color: "var(--sb-indigo)",
                    border: "1px solid var(--sb-indigo-glow)",
                  }}
                >
                  gemini-2.0-flash
                </Badge>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Analisis karir dipersonalisasi berdasarkan hasil matching AI kamu
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={runAnalysis}
            className="shrink-0 gap-1.5 rounded-lg normal-case tracking-normal text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div className="flex border-b border-[var(--sb-hairline)] px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 pt-3 text-xs font-semibold transition-colors mr-6 ${
                  isActive
                    ? "border-[var(--sb-indigo)] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────── */}
        <div className="p-6">

          {/* Career Narrative Tab */}
          {activeTab === "narrative" && (
            <div>
              <div className="relative min-h-[5rem]">
                <p className="text-sm leading-relaxed text-foreground">
                  {narrativeDisplay}
                  {!narrativeDone && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--sb-indigo)]" />
                  )}
                </p>
              </div>

              {narrativeDone && (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-4 py-3">
                  <CheckCircle2 size={15} className="shrink-0 text-[var(--sb-emerald)]" />
                  <span className="text-xs text-muted-foreground">
                    Analisis selesai · Berdasarkan{" "}
                    <span className="font-semibold text-foreground">
                      {job ? "1 lowongan spesifik" : `${effectiveResults.length} lowongan`}
                    </span>{" "}
                    yang dievaluasi oleh pipeline SkillBridge AI
                  </span>
                </div>
              )}

              {narrativeDone && (
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--sb-indigo)] hover:underline"
                >
                  Lihat Skill Roadmap <ChevronRight size={13} />
                </button>
              )}
            </div>
          )}

          {/* Skill Roadmap Tab */}
          {activeTab === "roadmap" && (
            <div>
              <p className="mb-4 text-xs text-muted-foreground">
                3 skill prioritas yang perlu dikuasai untuk meningkatkan peluang keberhasilan kamu:
              </p>
              <div className="grid gap-3 sm:grid-cols-1">
                {advice.skill_gaps.map((item, i) => (
                  <SkillGapCard key={item.skill} item={item} index={i} />
                ))}
              </div>

              <button
                onClick={() => setActiveTab("cover")}
                className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[var(--sb-indigo)] hover:underline"
              >
                Buat Cover Letter <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Cover Letter Tab */}
          {activeTab === "cover" && (
            <div>
              <p className="mb-4 text-xs text-muted-foreground">
                Draft kalimat pembuka cover letter yang dipersonalisasi untuk posisi terbaik kamu:
              </p>

              <div className="relative rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] p-5">
                {/* Decorative quote mark */}
                <div
                  className="absolute left-4 top-3 text-5xl leading-none font-serif opacity-10 select-none"
                  style={{ color: "var(--sb-indigo)" }}
                >
                  "
                </div>
                <p className="relative z-10 pt-4 text-sm leading-relaxed text-foreground">
                  {advice.cover_letter_opening}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2 rounded-lg normal-case tracking-normal font-semibold"
                  style={{ background: "var(--sb-indigo)", color: "#fff" }}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} /> Tersalin!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy size={13} /> Salin ke Clipboard
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Sesuaikan dengan nama perusahaan dan detail posisi sebelum dikirim
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
