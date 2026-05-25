import apiClient from "./client";
import type { JobListing } from "@/types";

type BackendJob = {
  id?: string;
  job_id?: string;
  title?: string;
  cleaned_title?: string;
  company_name?: string;
  location?: string;
  job_category?: string | null;
  job_subcategory?: string | null;
  employment_type?: string | null;
  work_arrangement?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  posted_at?: string | null;
  source_link?: string | null;
  apply_link?: string | null;
  hard_skills?: string[];
  description?: string | null;
};

type JobDetailResponse = {
  success: boolean;
  data: BackendJob;
};

type JobListResponse = {
  success: boolean;
  total_in_system: number;
  limit: number;
  offset: number;
  data: BackendJob[];
};

function toJobListing(job: BackendJob): JobListing {
  const sourceUrl = job.apply_link || job.source_link || null;

  return {
    id: job.id || job.job_id || sourceUrl || `${job.company_name ?? "job"}-${job.title ?? ""}`,
    job_id: job.job_id ?? null,
    title: job.cleaned_title || job.title || "Untitled Job",
    company: job.company_name || "Unknown Company",
    location: job.location || "Unknown Location",
    job_type: job.employment_type ?? null,
    work_arrangement: job.work_arrangement ?? null,
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    posted_at: job.posted_at ?? null,
    source_url: sourceUrl,
    required_skills: job.hard_skills ?? [],
    description: job.description || "Deskripsi lowongan belum tersedia.",
  };
}

export async function getJobById(id: string): Promise<JobListing> {
  const res = await apiClient.get<JobDetailResponse>(
    `/api/v1/jobs/${encodeURIComponent(id)}`
  );
  return toJobListing(res.data.data);
}

export type JobDistributionItem = {
  province: string;
  count: number;
};

export type JobDistributionResponse = {
  success: boolean;
  data: JobDistributionItem[];
};

export async function getJobDistribution(): Promise<JobDistributionItem[]> {
  const res = await apiClient.get<JobDistributionResponse>(
    "/api/v1/search/distribution"
  );
  return res.data.data;
}

export type SubCategoryItem = {
  subcategory: string;
  count: number;
};

export type JobCategoryDistributionItem = {
  category: string;
  count: number;
  subcategories: SubCategoryItem[];
};

export type JobCategoryDistributionResponse = {
  success: boolean;
  data: JobCategoryDistributionItem[];
};

export async function getJobCategoryDistribution(): Promise<JobCategoryDistributionItem[]> {
  const res = await apiClient.get<JobCategoryDistributionResponse>(
    "/api/v1/search/jobs_category"
  );
  return res.data.data;
}
