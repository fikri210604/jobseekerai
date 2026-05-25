import Link from "next/link";
import {
  Ban,
  Building2,
  Check,
  Heart,
  Home,
  MapPin,
  MoreHorizontal,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/types";

function confidenceLabel(pct: number) {
  if (pct >= 85) return "STRONG MATCH";
  if (pct >= 70) return "GOOD MATCH";
  if (pct >= 55) return "FAIR MATCH";
  return "LOW MATCH";
}

function Gauge({ pct }: { pct: number }) {
  return (
    <div className="relative mb-4 size-24">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-[var(--sb-surface-1)]"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="text-[var(--sb-emerald)]"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-metric text-2xl font-bold leading-none text-foreground">
          {pct}
          <span className="text-sm">%</span>
        </span>
      </div>
    </div>
  );
}

export function JobMatchCard({
  result,
  rank,
}: {
  result: MatchResult;
  rank: number;
}) {
  const pct = Math.round(result.confidence_score * 100);
  const jobIdentifier =
    result.job_id ||
    result.source_link ||
    `${result.company_name}-${result.title}`;
  const jobSlug = encodeURIComponent(jobIdentifier);
  const postedAt = result.posted_at ?? (rank === 1 ? "3 minutes ago" : "1 hour ago");
  const salary =
    result.salary_display ??
    (result.salary_min && result.salary_max
      ? `Rp ${(result.salary_min / 1_000_000).toFixed(0)}jt - Rp ${(result.salary_max / 1_000_000).toFixed(0)}jt`
      : "Salary undisclosed");

  return (
    <article className="group overflow-hidden rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] transition-colors hover:border-[var(--sb-indigo)]">
      <div className="flex flex-col md:flex-row">
        <Link href={`/jobs/${jobSlug}?from=match&score=${pct}`} className="flex-1 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)]">
              <Building2 size={28} className="text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge
                  className="rounded px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal"
                  style={{
                    background: "var(--sb-emerald-dim)",
                    color: "var(--sb-emerald)",
                  }}
                >
                  {postedAt}
                </Badge>
                {rank <= 2 && (
                  <Badge
                    className="rounded px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal"
                    style={{
                      background: "var(--sb-indigo-dim)",
                      color: "var(--sb-indigo)",
                    }}
                  >
                    Be an early applicant
                  </Badge>
                )}
              </div>

              <h4 className="text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-[var(--sb-indigo)]">
                {result.title}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.company_name} / {result.job_category ?? "General"}{" "}
                {result.job_subcategory ? `- ${result.job_subcategory}` : ""}
              </p>
            </div>

            <button
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-[var(--sb-surface-2)] hover:text-foreground"
              aria-label="More job actions"
              type="button"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <MapPin size={17} />
              <span>{result.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={17} />
              <span>{result.employment_type ?? "Full-time"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home size={17} />
              <span>{result.work_arrangement ?? "Hybrid"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet size={17} />
              <span>{salary}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {result.hard_skills.slice(0, 5).map((skill) => (
              <Badge
                key={skill}
                className="rounded border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] px-2 py-1 text-[11px] normal-case tracking-normal text-muted-foreground"
              >
                {skill}
              </Badge>
            ))}
            <Badge
              className="rounded px-2 py-1 text-[11px] normal-case tracking-normal"
              style={{
                background: "var(--sb-indigo-dim)",
                color: "var(--sb-indigo)",
              }}
            >
              {result.match_details.skill_match_pct} skill match
            </Badge>
          </div>
        </Link>

        <div className="flex flex-col justify-between border-t border-[var(--sb-hairline)] p-5 md:w-56 md:border-l md:border-t-0 md:p-6">
          <div className="flex flex-col items-center">
            <Gauge pct={pct} />
            <h5 className="mb-4 text-center text-xs font-bold tracking-wider text-foreground">
              {confidenceLabel(pct)}
            </h5>
            <div className="w-full space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check size={15} className="shrink-0 text-[var(--sb-emerald)]" />
                <span>
                  {result.match_details.category_match
                    ? "Category alignment"
                    : "Transferable skill fit"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={15} className="shrink-0 text-[var(--sb-emerald)]" />
                <span>
                  {result.match_details.salary_feasible
                    ? "Salary feasible"
                    : "Growth opportunity"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <Ban size={15} />
            </Button>
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <Heart size={15} />
            </Button>
            <Button
              size="sm"
              className="rounded-full font-semibold normal-case tracking-normal"
              style={{
                background: "var(--sb-emerald)",
                color: "#003824",
              }}
            >
              <Sparkles size={14} />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
