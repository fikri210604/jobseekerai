// lib/api/gemini.ts
// Client untuk endpoint backend POST /api/v1/advisor/career
// Gemini logic sepenuhnya di backend Python — frontend hanya mengirim data dan menerima hasil.

import apiClient from "./client";
import type { GeminiAdvisorResponse, MatchResult } from "@/types";

interface GeminiAdvisorPayload {
  user_profile: {
    hard_skills: string[];
    soft_skills: string[];
    education_level: string;
    total_experience_years: number | string;
    location?: string | null;
    preferred_salary?: number;
    preferred_category?: string;
    work_arrangement?: string;
  };
  match_results: MatchResult[];
}

// Map dari frontend education format ke format yang dimengerti backend
const EDUCATION_MAP: Record<string, string> = {
  sma_smk: "SMA",
  diploma: "D3",
  s1: "S1",
  s2: "S2",
  s3: "S3",
  tidak_ada: "Unknown",
};

export interface FetchGeminiAdviceArgs {
  skills: string[];
  softSkills: string[];
  education: string;
  experienceYears: number | string;
  location: string;
  expectedSalary: number;
  preferredCategory: string;
  workArrangement: string;
  results: MatchResult[];
}

export async function fetchGeminiAdvice(
  args: FetchGeminiAdviceArgs
): Promise<GeminiAdvisorResponse> {
  const payload: GeminiAdvisorPayload = {
    user_profile: {
      hard_skills: args.skills,
      soft_skills: args.softSkills,
      education_level: EDUCATION_MAP[args.education] ?? args.education.toUpperCase(),
      total_experience_years: args.experienceYears,
      location: args.location || null,
      preferred_salary: args.expectedSalary,
      preferred_category: args.preferredCategory || undefined,
      work_arrangement: args.workArrangement || "Full-time",
    },
    match_results: args.results,
  };

  const res = await apiClient.post<{
    success: boolean;
    model: string;
    advice: GeminiAdvisorResponse;
  }>("/api/v1/advisor/career", payload, {
    timeout: 60_000, // Gemini bisa butuh lebih lama — override ke 60s
  });

  return res.data.advice;
}
