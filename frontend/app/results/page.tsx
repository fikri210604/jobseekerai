"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResultsStore } from "@/lib/store";
import { MOCK_DIAGNOSTIC, MOCK_RESULTS } from "@/lib/mock-data";

import { DiagnosticStrip } from "@/components/features/results/DiagnosticStrip";
import { JobMatchCard } from "@/components/features/results/JobMatchCard";
import { UserProfilePanel } from "@/components/features/results/UserProfilePanel";

export default function ResultsPage() {
  const { results, diagnostic, hasResults } = useResultsStore();

  const displayResults = hasResults ? results : MOCK_RESULTS;
  const displayDiagnostic = diagnostic ?? MOCK_DIAGNOSTIC;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--sb-canvas)]">
      <div className="border-b border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Button
            variant="ghost"
            size="xs"
            asChild
            className="w-fit gap-1.5 px-0 font-medium normal-case tracking-normal text-muted-foreground hover:text-foreground"
          >
            <Link href="/predict">
              <ArrowLeft size={13} />
              Back to Analysis
            </Link>
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-3 focus-within:border-[var(--sb-indigo)]">
              <Search size={16} className="text-muted-foreground" />
              <Input
                className="h-8 w-full min-w-0 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 sm:w-56"
                placeholder="Search parameters..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg font-medium normal-case tracking-normal"
            >
              <Download size={14} />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Prediction Results
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Algorithm confidence threshold set to &gt;65.0%
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] px-3 py-1.5">
            <span className="size-2 rounded-full bg-[var(--sb-emerald)]" />
            <span className="font-metric text-xs text-muted-foreground">
              {displayResults.length} recommendations generated
            </span>
          </div>
        </div>

        <DiagnosticStrip diagnostic={displayDiagnostic} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <UserProfilePanel />

          <section className="flex min-w-0 flex-1 flex-col gap-3 lg:w-[65%]">
            <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <span className="size-2 rounded-full bg-[var(--sb-emerald)]" />
                Suggested For You
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg font-medium normal-case tracking-normal"
                >
                  Match Score
                  <ChevronDown size={16} />
                </Button>
              </div>
            </div>

            {displayResults.slice(0, 6).map((result, i) => (
              <div
                key={`${result.company_name}-${result.title}-${i}`}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <JobMatchCard result={result} rank={i + 1} />
              </div>
            ))}

            {displayResults.length > 6 && (
              <Button
                variant="outline"
                className="mt-2 h-14 rounded-xl border-dashed font-medium normal-case tracking-normal text-muted-foreground hover:text-foreground"
              >
                <ChevronDown size={18} />
                Load Remaining {displayResults.length - 6} Recommendations
              </Button>
            )}

            {!hasResults && (
              <div className="rounded-xl border border-[var(--sb-indigo-glow)] bg-[var(--sb-indigo-dim)] p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles size={16} color="var(--sb-indigo)" />
                  Preview mode
                </div>
                <p className="mt-1">
                  Data yang tampil adalah mock result. Jalankan analisis dari
                  halaman Predict untuk melihat rekomendasi dari backend.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
