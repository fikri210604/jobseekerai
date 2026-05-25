import apiClient from "./client";
import type { SkillGapReport, TrendingSkill } from "@/types";

type SkillGapResponse = {
  success: boolean;
  data: SkillGapReport;
};

type TrendingResponse = {
  success: boolean;
  data: TrendingSkill[];
};

export async function analyzeSkillGap(params: { job_id: string; user_skills: string[] }): Promise<SkillGapReport> {
  const res = await apiClient.post<SkillGapResponse>("/api/v1/skills/gap", params);
  return res.data.data;
}

export async function getTrendingSkills(): Promise<TrendingSkill[]> {
  const res = await apiClient.get<TrendingResponse>("/api/v1/skills/trending");
  return res.data.data;
}
