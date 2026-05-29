import apiClient from "./client";
import type {
  EducationLevel,
  MatchRequest,
  MatchResponse,
  SearchRequest,
  SearchResponse,
} from "@/types";

const EDUCATION_TO_API: Record<EducationLevel, string> = {
  sma_smk: "SMA",
  diploma: "D3",
  s1: "S1",
  s2: "S2",
  s3: "S3",
  tidak_ada: "Unknown",
};

export async function matchJobs(payload: MatchRequest): Promise<MatchResponse> {
  const body = {
    parsed_cv: {
      hard_skills: payload.parsed_cv.skills,
      soft_skills: payload.parsed_cv.soft_skills,
      education_level: EDUCATION_TO_API[payload.parsed_cv.education],
      total_experience_years: payload.parsed_cv.experience_years,
      preferred_category: payload.parsed_cv.preferred_category,
      preferred_salary: payload.parsed_cv.expected_salary,
      certifications_count: payload.parsed_cv.certifications_count,
      location: payload.parsed_cv.location || null,
      work_arrangement: payload.parsed_cv.work_arrangement || "Full-time",
    },
    category_filter: payload.category_filter ?? null,
  };

  const res = await apiClient.post<MatchResponse>("/api/v1/match", body, {
    params: { limit: payload.top_k ?? 10 },
  });
  return res.data;
}

export async function semanticSearch(
  payload: SearchRequest
): Promise<SearchResponse> {
  const params: Record<string, string | number> = {
    q: payload.query,
    limit: payload.top_k ?? 10,
  };

  // Hanya kirim province jika ada dan bukan "all"
  if (payload.province && payload.province !== "all") {
    params.province = payload.province;
  }

  const res = await apiClient.get<SearchResponse>("/api/v1/search", { params });
  return res.data;
}

export async function getJobCategories(): Promise<string[]> {
  const res = await apiClient.get<{ success: boolean; categories: string[] }>(
    "/api/v1/match/categories"
  );
  return res.data.categories;
}
