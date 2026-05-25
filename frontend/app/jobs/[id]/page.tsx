"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Flag, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillGapStore, useUserStore } from "@/lib/store";
import { analyzeSkillGap, getJobById } from "@/lib/api";
import { MOCK_JOB } from "@/lib/mock-data";
import type { JobListing } from "@/types";

import { JobInfoPanel } from "@/components/features/job-detail/JobInfoPanel";
import { SkillGapPanel } from "@/components/features/job-detail/SkillGapPanel";

export default function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = use(params);
  const resolvedSearchParams = use(searchParams);
  const from = (resolvedSearchParams.from as string) || "search";
  const score = (resolvedSearchParams.score as string) || "0";

  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  const { setReport, setLoading, setError } = useSkillGapStore();
  const { skills } = useUserStore();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch {
        setJob(MOCK_JOB);
      } finally {
        setIsLoadingJob(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!job) return;

    const runGap = async () => {
      setLoading(true);
      try {
        const data = await analyzeSkillGap({
          job_id: job.id,
          user_skills: skills,
        });
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat skill gap.");
        setLoading(false);
      }
    };

    runGap();
  }, [job, skills, setError, setLoading, setReport]);

  const displayJob = job ?? MOCK_JOB;

  if (isLoadingJob) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <div className="space-y-5">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--sb-canvas)]">
      <div className="sticky top-14 z-30 border-b border-[var(--sb-hairline)] bg-[rgba(13,17,23,0.78)] px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="xs"
              asChild
              className="gap-1.5 px-0 font-medium normal-case tracking-normal text-muted-foreground hover:text-foreground"
            >
              <Link href="/results">
                <ArrowLeft size={13} />
                Results
              </Link>
            </Button>
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <div className="flex items-center gap-4">
              <button className="border-b-2 border-[var(--sb-indigo)] pb-1 text-sm font-medium text-[var(--sb-indigo)]">
                Overview
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Company
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Share2 size={16} />
              Share
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Flag size={16} />
              Report Issue
            </button>
            {displayJob.source_url && (
              <a
                href={displayJob.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink size={16} />
                Original Job Post
              </a>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <JobInfoPanel job={displayJob} />
          <SkillGapPanel jobId={displayJob.id} from={from} score={score} />
        </div>
      </main>
    </div>
  );
}
