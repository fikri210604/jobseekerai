import { AlertTriangle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_MISSING_UNITS } from "@/lib/mock-data";

function RadarMock() {
  const labels = [
    { label: "Data Eng", className: "left-1/2 top-0" },
    { label: "MLOps", className: "left-[96%] top-1/4" },
    { label: "Deep Lrng", className: "left-[96%] top-3/4" },
    { label: "Sys Arch", className: "left-1/2 top-full" },
    { label: "NLP", className: "left-[4%] top-3/4" },
    { label: "Python", className: "left-[4%] top-1/4" },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      <div className="absolute inset-0 rounded-full border border-[var(--sb-hairline)]">
        <div className="absolute inset-[20%] rounded-full border border-[var(--sb-hairline)]" />
        <div className="absolute inset-[40%] rounded-full border border-[var(--sb-hairline)]" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--sb-hairline)]" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[var(--sb-hairline)]" />
        <div className="absolute inset-0 rotate-45 border-l border-[var(--sb-hairline)]" />
        <div className="absolute inset-0 -rotate-45 border-l border-[var(--sb-hairline)]" />
      </div>

      <div
        className="absolute inset-[10%] border border-[var(--sb-emerald)] bg-[rgba(16,185,129,0.12)]"
        style={{
          clipPath:
            "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
        }}
      />
      <div
        className="absolute inset-[10%] z-10 border-2 border-[var(--sb-sky)] bg-[rgba(56,189,248,0.18)]"
        style={{
          clipPath:
            "polygon(50% 15%, 80% 35%, 70% 80%, 50% 85%, 20% 60%, 30% 25%)",
        }}
      />

      {labels.map((item) => (
        <span
          key={item.label}
          className={`absolute -translate-x-1/2 -translate-y-1/2 font-metric text-[10px] text-muted-foreground ${item.className}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-foreground">
      <span>{label}</span>
      <span className="font-metric font-semibold">{value}</span>
    </div>
  );
}

export function SkillGapPanel({
  jobId,
  from = "search",
  score = "0",
}: {
  jobId: string;
  from?: string;
  score?: string;
}) {
  const isMatch = from === "match";
  const displayScore = score !== "0" ? score : isMatch ? "95" : "75";
  const title = isMatch ? "Competency Gap Analysis" : "Semantic Vector Alignment";
  const subtitle = isMatch
    ? "Comparing Candidate ID #8472 vs Requirement Vector"
    : "Comparing Search Query vs Document Embedding";
  const scoreLabel = isMatch ? "Strong Match" : "Relevance Score";
  const scoreColor = isMatch ? "var(--sb-emerald)" : "var(--sb-sky)";
  const badgeColor = isMatch ? "var(--sb-emerald-dim)" : "var(--sb-sky-dim)";
  const badgeBorder = isMatch ? "rgba(16,185,129,0.28)" : "rgba(56,189,248,0.28)";

  return (
    <aside className="flex flex-col gap-6">
      <Card className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)]">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--sb-hairline)] pb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold leading-none" style={{ color: scoreColor }}>
                {displayScore}
              </span>
              <span className="text-2xl font-semibold" style={{ color: scoreColor }}>
                %
              </span>
            </div>
            <div className="font-metric text-xs font-bold uppercase tracking-wider" style={{ color: scoreColor }}>
              {scoreLabel}
            </div>
          </div>
          <div className="space-y-3">
            {isMatch ? (
              <>
                <ScoreRow label="Experience Level" value="100%" />
                <ScoreRow label="Skill" value="87%" />
                <ScoreRow label="Industry Exp." value="62%" />
              </>
            ) : (
              <>
                <ScoreRow label="Keyword Overlap" value="High" />
                <ScoreRow label="Contextual Match" value="Good" />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]">
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl normal-case tracking-normal">
                {title}
              </CardTitle>
              <CardDescription className="mt-1">
                {subtitle}
              </CardDescription>
            </div>
            <Badge
              className="rounded border px-2 py-1 font-mono text-[10px] normal-case tracking-normal"
              style={{
                background: badgeColor,
                borderColor: badgeBorder,
                color: scoreColor,
              }}
            >
              {jobId.slice(0, 10)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="flex min-h-[300px] items-center justify-center">
            <RadarMock />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm border border-[var(--sb-emerald)] bg-[rgba(16,185,129,0.18)]" />
              <span className="font-metric text-xs text-muted-foreground">
                Required Units
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm border border-[var(--sb-sky)] bg-[rgba(56,189,248,0.18)]" />
              <span className="font-metric text-xs text-muted-foreground">
                Candidate Vector
              </span>
            </div>
          </div>

          {isMatch && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle size={18} className="text-[var(--sb-red)]" />
                Critical Competency Gaps
              </h3>
              <div className="space-y-2">
                {MOCK_MISSING_UNITS.slice(0, 2).map((code, index) => (
                  <div
                    key={code}
                    className="flex items-start gap-3 rounded-lg border border-[rgba(239,68,68,0.28)] bg-[var(--sb-red-dim)] p-3"
                  >
                    <X size={16} className="mt-0.5 shrink-0 text-[var(--sb-red)]" />
                    <div>
                      <div className="font-metric mb-1 text-xs font-bold text-[var(--sb-red)]">
                        {index === 0 ? "UNIT-MLO-401" : "UNIT-NLP-205"}
                      </div>
                      <div className="text-sm text-red-100/90">
                        {index === 0
                          ? "Deploy distributed models across Kubernetes clusters with automated fallback."
                          : "Implement transformer-based semantic search with latency under 50ms."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
