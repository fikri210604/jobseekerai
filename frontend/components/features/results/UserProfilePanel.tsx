"use client";

import {
  CalendarClock,
  Circle,
  Info,
  MapPin,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useResultsStore, useUserStore } from "@/lib/store";
import { MOCK_RESULTS } from "@/lib/mock-data";

export function UserProfilePanel() {
  const { skills, education, experienceYears, expectedSalary } = useUserStore();
  const { results, hasResults } = useResultsStore();

  const displayResults = hasResults ? results : MOCK_RESULTS;
  const inferredSkills =
    skills.length > 0
      ? skills
      : ["Python", "Apache Kafka", "Snowflake", "dbt", "SQL"];

  const readyCount = displayResults.filter((r) => r.confidence_score >= 0.8).length;
  const readinessPct = Math.round((readyCount / Math.max(displayResults.length, 1)) * 100);

  return (
    <aside className="w-full lg:w-[35%]">
      <Card className="sticky top-20 rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)]">
              <UserRound size={28} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-foreground">
                SkillBridge Candidate
              </h3>
              <p className="text-sm text-muted-foreground">
                {education.replace("_", " ").toUpperCase()} / {experienceYears} tahun
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={13} />
                <span>Indonesia / Remote Ready</span>
              </div>
            </div>
          </div>

          <Separator />

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Inferred Hard Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {inferredSkills.slice(0, 8).map((skill) => (
                <Badge
                  key={skill}
                  className="rounded border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)] px-2 py-1 font-mono text-[11px] normal-case tracking-normal text-foreground"
                >
                  {skill}
                  <X size={11} className="text-muted-foreground" />
                </Badge>
              ))}
              <Badge
                className="rounded border border-dashed px-2 py-1 font-mono text-[11px] normal-case tracking-normal"
                style={{
                  borderColor: "var(--sb-indigo-glow)",
                  color: "var(--sb-indigo)",
                }}
              >
                <Plus size={11} />
                Add Skill
              </Badge>
            </div>
          </section>

          <Separator />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                SKKNI Gap Analysis
              </h4>
              <Info size={14} className="text-muted-foreground" />
            </div>
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded border border-[var(--sb-hairline)] bg-[var(--sb-canvas)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_62%)]" />
              <div className="flex size-28 items-center justify-center rounded-full border border-[var(--sb-hairline-strong)]">
                <div className="flex size-20 items-center justify-center rounded-full border border-[var(--sb-hairline-strong)]">
                  <div className="size-10 rounded-full border border-[var(--sb-indigo-glow)] bg-[var(--sb-indigo-dim)]" />
                </div>
              </div>
              <svg
                className="absolute size-24 fill-[rgba(16,185,129,0.18)] stroke-[var(--sb-emerald)]"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <polygon points="50,10 85,35 75,80 25,80 15,35" />
              </svg>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Readiness coverage</span>
                  <span className="font-metric">{readinessPct}%</span>
                </div>
                <Progress value={readinessPct} className="h-1" />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Hybrid", `Rp ${(expectedSalary / 1_000_000).toFixed(0)}jt+`, "Data"].map(
                (filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)] px-3 py-1 text-xs text-muted-foreground"
                  >
                    {filter}
                    <X size={12} />
                  </span>
                )
              )}
            </div>
          </section>

          <div className="rounded-xl border border-[var(--sb-indigo-glow)] bg-[var(--sb-indigo-dim)] p-4">
            <h4 className="text-sm font-bold text-foreground">
              Complete to unlock coaching
            </h4>
            <Progress value={0} className="mt-3 h-2" />
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Circle size={14} />
                Complete 2 application reviews
              </li>
              <li className="flex items-center gap-2">
                <Circle size={14} />
                Book 1 coaching call
              </li>
            </ul>
          </div>

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Up Next
            </h4>
            <div className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded bg-[var(--sb-amber-dim)] text-[var(--sb-amber)]">
                  <CalendarClock size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-foreground">
                    Resume & LinkedIn Coaching
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Next: Tomorrow at 10:00
                  </p>
                </div>
              </div>
              <Button
                className="h-9 w-full rounded-lg font-semibold normal-case tracking-normal"
                style={{ background: "var(--sb-indigo)", color: "#fff" }}
              >
                Save My Spot
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </aside>
  );
}
