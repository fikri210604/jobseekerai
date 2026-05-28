"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

import { useUserStore, useResultsStore } from "@/lib/store";
import { matchJobs } from "@/lib/api";
import type { MatchRequest } from "@/types";

import { ProfileForm } from "@/components/features/predict/ProfileForm";
import { SkillTagInput } from "@/components/features/predict/SkillTagInput";
import { CVTextarea } from "@/components/features/predict/CVTextarea";
import { AlgoConfigPanel } from "@/components/features/predict/AlgoConfigPanel";

export default function PredictPage() {
  const router = useRouter();

  const {
    rawCvText,
    skills,
    softSkills,
    education,
    experienceYears,
    expectedSalary,
    preferredCategory,
    certificationsCount,
    location,
    workArrangement,
    algorithmConfig,
  } = useUserStore();

  const { setResults, setLoading, setError } = useResultsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (skills.length === 0) {
      setSubmitError("Tambahkan minimal 1 hard skill untuk menjalankan analisis.");
      return; 
    }
    try {
      setIsSubmitting(true); 
      setSubmitError(null); 
      setLoading(true);
      
      const payload: MatchRequest = {
        parsed_cv: { 
          raw_text: rawCvText, 
          skills, 
          soft_skills: softSkills,
          education, 
          experience_years: experienceYears, 
          expected_salary: expectedSalary,
          preferred_category: preferredCategory || null,
          certifications_count: certificationsCount,
          location,
          work_arrangement: workArrangement,
        },
        category_filter: preferredCategory || null,
        top_k: 10, 
        algorithm: algorithmConfig.algorithm, 
        hybrid_weight: algorithmConfig.hybrid_weight,
      };
      
      const response = await matchJobs(payload);
      setResults(response); 
      router.push("/results");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal terhubung ke server.";
      setSubmitError(msg); 
      setError(msg);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Badge
          className="mb-3 rounded px-2 py-0.5 normal-case tracking-normal font-medium text-[10px]"
          style={{
            background: "var(--sb-indigo-dim)",
            color: "var(--sb-indigo)",
            border: "1px solid var(--sb-indigo-glow)",
          }}
        >
          Career Analysis
        </Badge>
        <h1
          className="text-3xl font-semibold text-foreground"
          style={{ letterSpacing: "-0.04em" }}
        >
          Profile &amp; CV Input
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Isi profil terstruktur untuk mendapatkan rekomendasi kerja dari API matching.
        </p>
      </div>

      {/* ── Two-column layout ──────────────────────────────────── */}
      <div className="space-y-6">
        <ProfileForm />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <SkillTagInput />
        <CVTextarea />
        </div>
      </div>

      {/* ── Error + Submit ──────────────────────────────────────── */}
      {submitError && (
        <div
          className="mt-4 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "var(--sb-red-dim)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--sb-red)",
          }}
        >
          {submitError}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || skills.length === 0}
          size="sm"
          className="gap-2 rounded-md normal-case tracking-normal font-semibold"
          style={{ background: "var(--sb-indigo)", color: "#fff" }}
        >
          {isSubmitting ? (
            <><Spinner className="size-3.5" /> Analyzing...</>
          ) : (
            <><Send size={13} /> Run Analysis</>
          )}
        </Button>
      </div>
    </div>
  );
}
