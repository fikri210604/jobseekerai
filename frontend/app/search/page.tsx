"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchStore } from "@/lib/store";
import { MOCK_SEARCH_RESULTS } from "@/lib/mock-data";

import { SemanticSearchBar } from "@/components/features/search/SemanticSearchBar";
import { SearchResultRow } from "@/components/features/search/SearchResultRow";
import DotGrid from "@/components/ui/DotGrid";
export default function SearchPage() {
  const { query, results, total, hasSearched } = useSearchStore();

  const displayResults = hasSearched ? results : MOCK_SEARCH_RESULTS;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="fixed inset-0 z-0">
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
      <div className="mb-10 text-center">
        <Badge
          className="mb-3 gap-2 rounded-full px-3 py-1 normal-case tracking-normal font-medium"
          style={{
            background: "var(--sb-sky-dim)",
            color: "var(--sb-sky)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <Zap size={11} />
          SBERT Vector Space · 768-dim
        </Badge>
        <h1
          className="text-3xl font-semibold text-foreground mb-2"
          style={{ letterSpacing: "-0.04em" }}
        >
          Semantic Search Engine
        </h1>
        <p className="text-sm text-muted-foreground">
          Cari pekerjaan berdasarkan makna semantik, bukan keyword matching biasa.
        </p>
      </div>

      <SemanticSearchBar />

      {/* ── Results ───────────────────────────────────────────── */}
      <div>
        {hasSearched ? (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {total} results for{" "}
              <span className="font-mono" style={{ color: "var(--sb-sky)" }}>
                "{query}"
              </span>
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              sorted by similarity score ↓
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground">
              Sample results — run a search to see your personalized results
            </p>
          </div>
        )}

        <div className="space-y-2">
          {displayResults.map((result, i) => (
            <div
              key={`${result.company_name ?? ""}-${result.title}-${i}`}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <SearchResultRow result={result} rank={i + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
