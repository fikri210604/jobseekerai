import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Group,
  Home,
  MapPin,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { JobListing } from "@/types";

function formatRupiah(val?: number | null) {
  if (!val) return null;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(val);
}

function formatPostedAt(postedAt?: string | null) {
  if (!postedAt) return "3 minutes ago";

  const parsed = new Date(postedAt);
  if (Number.isNaN(parsed.getTime())) return postedAt;

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DescriptionBlock({ description }: { description: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {description.split("\n").map((line, index) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="pt-3 text-base font-semibold text-foreground">
              {line.replace("## ", "")}
            </h3>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="text-[var(--sb-indigo)]">•</span>
              <span>{line.replace("- ", "").replace(/\*\*/g, "")}</span>
            </div>
          );
        }

        return line ? <p key={index}>{line.replace(/\*\*/g, "")}</p> : null;
      })}
    </div>
  );
}

function ConnectionCard({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "emerald" | "indigo" | "amber";
  children: React.ReactNode;
}) {
  const color =
    tone === "emerald"
      ? "var(--sb-emerald)"
      : tone === "amber"
        ? "var(--sb-amber)"
        : "var(--sb-indigo)";

  return (
    <Card className="relative min-h-36 overflow-hidden rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-2)] transition-colors hover:border-[var(--sb-hairline-strong)]">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `${color}55` }} />
      <CardContent className="flex h-full flex-col p-4">
        <div className="font-metric text-xs" style={{ color }}>
          {label}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function JobInfoPanel({ job }: { job: JobListing }) {
  const salaryMin = formatRupiah(job.salary_min);
  const salaryMax = formatRupiah(job.salary_max);
  const salary =
    salaryMin && salaryMax
      ? `${salaryMin} - ${salaryMax}`
      : salaryMin || salaryMax || "Salary undisclosed";

  return (
    <section className="flex flex-col gap-8">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]">
            <Building2 size={20} className="text-muted-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{job.company}</span>
            <span className="mx-2">•</span>
            {formatPostedAt(job.posted_at)}
          </div>
        </div>

        <h1 className="mb-5 text-3xl font-bold leading-tight text-foreground">
          {job.title}
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            {job.location}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={18} />
            {job.job_type ?? "Full-time"}
          </div>
          <div className="flex items-center gap-2">
            <Home size={18} />
            {job.work_arrangement ?? "Hybrid"}
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={18} />
            Mid-Senior level
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Wallet size={18} />
            {salary}
          </div>
        </div>

        <Separator className="mb-8" />

        <DescriptionBlock description={job.description} />

        <div className="mt-5 flex flex-wrap gap-2">
          {job.required_skills.slice(0, 8).map((skill) => (
            <Badge
              key={skill}
              className="rounded-lg bg-[var(--sb-surface-2)] px-3 py-1 font-mono text-xs normal-case tracking-normal text-[var(--sb-emerald)]"
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            className="rounded-lg border px-3 py-1 font-mono text-xs normal-case tracking-normal"
            style={{
              background: "var(--sb-emerald-dim)",
              borderColor: "rgba(16,185,129,0.28)",
              color: "var(--sb-emerald)",
            }}
          >
            <CheckCircle2 size={14} />
            H1B Sponsor Likely
          </Badge>
          {job.source_url && (
            <Button
              size="xs"
              asChild
              className="rounded-lg font-semibold normal-case tracking-normal"
              style={{ background: "var(--sb-indigo)", color: "#fff" }}
            >
              <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                Apply Now
                <ExternalLink size={12} />
              </a>
            </Button>
          )}
        </div>
      </div>

      <section className="border-t border-[var(--sb-hairline)] pt-8">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Group size={23} color="var(--sb-emerald)" />
            Insider Connection @{job.company}
          </h2>
          <div className="w-fit rounded-full border border-[rgba(16,185,129,0.28)] bg-[var(--sb-emerald-dim)] px-3 py-1 font-metric text-xs text-[var(--sb-emerald)]">
            2 email credits available today
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Discover valuable connections within the company who might provide
          insights and potential referrals.
          <br />
          <a
            href="#"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--sb-indigo)]"
          >
            Get 3x more responses when you reach out via email instead of
            LinkedIn.
          </a>
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ConnectionCard label="Beyond Your Network" tone="emerald">
            <div className="mt-auto">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {["F", "S", "B"].map((initial, index) => (
                    <div
                      key={initial}
                      className="flex size-8 items-center justify-center rounded-full border border-[var(--sb-surface-2)] bg-[rgba(16,185,129,0.28)] text-sm font-bold text-[var(--sb-emerald)]"
                      style={{ zIndex: 30 - index }}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  className="rounded-full normal-case tracking-normal"
                >
                  View
                </Button>
              </div>
              <p className="text-sm text-foreground">Farrukh Anwar & 2 connections</p>
            </div>
          </ConnectionCard>

          <ConnectionCard label="From Your Previous Company" tone="indigo">
            <div className="mt-12 flex items-center justify-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-[var(--sb-indigo)]">
              Find More Connections
              <ArrowUpRight size={16} />
            </div>
          </ConnectionCard>

          <ConnectionCard label="From Your School" tone="amber">
            <div className="mt-12 flex items-center justify-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-[var(--sb-amber)]">
              Find More Connections
              <ArrowUpRight size={16} />
            </div>
          </ConnectionCard>
        </div>
      </section>
    </section>
  );
}
