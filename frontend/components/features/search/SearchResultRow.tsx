import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types";

export function SearchResultRow({
  result,
  rank,
}: {
  result: SearchResult;
  rank: number;
}) {
  const jobIdentifier =
    result.job_id ||
    result.source_link ||
    `${result.company_name ?? ""}-${result.title}`;
  const jobSlug = encodeURIComponent(jobIdentifier);

  return (
    <a href={`/jobs/${jobSlug}?from=search&score=${(result.similarity_score * 100).toFixed(1)}`}>
      <Card
        className="group cursor-pointer rounded-xl border-[var(--sb-hairline)] transition-all duration-150 hover:border-[var(--sb-hairline-strong)]"
        style={{ background: "var(--sb-surface-1)" }}
      >
        <CardContent className="flex items-center gap-4 px-5 py-4">
          {/* Rank */}
          <div
            className="hidden sm:flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[10px] font-semibold font-mono"
            style={{ background: "var(--sb-surface-2)", color: "var(--sb-ink-faint)" }}
          >
            {rank}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h3 className="text-sm font-medium text-foreground truncate">
                {result.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                {result.company_name && (
                  <span className="flex items-center gap-1">
                    <Building2 size={10} /> {result.company_name}
                  </span>
                )}
                {result.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {result.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {/* Cosine similarity badge */}
              <Badge
                className="gap-1.5 rounded px-2.5 py-1 normal-case tracking-normal font-mono text-xs"
                style={{
                  background: "var(--sb-sky-dim)",
                  color: "var(--sb-sky)",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              >
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sb-sky)" }} />
                Similarity: {result.similarity_score.toFixed(4)}
              </Badge>
              {result.work_arrangement && (
                <Badge
                  className="rounded px-2 py-1 text-[10px] normal-case tracking-normal"
                  style={{ background: "var(--sb-surface-2)", color: "var(--sb-ink-faint)" }}
                >
                  {result.work_arrangement}
                </Badge>
              )}
              {result.job_category && (
                <Badge
                  className="rounded px-2 py-1 text-[10px] normal-case tracking-normal"
                  style={{ background: "var(--sb-indigo-dim)", color: "var(--sb-indigo)" }}
                >
                  {result.job_category}
                </Badge>
              )}
            </div>
          </div>

          <ArrowRight
            size={13}
            className="hidden sm:block flex-shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1"
          />
        </CardContent>
      </Card>
    </a>
  );
}
