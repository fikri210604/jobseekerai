// ============================================================
// SkillBridge AI — TypeScript Type Definitions
// Sinkron dengan respons aktual backend FastAPI
// ============================================================

// -----------------------------------------------------------
// Algorithm & Config Types
// -----------------------------------------------------------

export type AlgorithmType =
  | "xgboost_tuned"
  | "random_forest"
  | "logistic_regression";

export interface AlgorithmConfig {
  algorithm: AlgorithmType;
  hybrid_weight: number; // 0.0 – 1.0 (ML weight, remainder = heuristic)
}

// -----------------------------------------------------------
// Input Types (untuk request ke backend)
// -----------------------------------------------------------

export type EducationLevel =
  | "sma_smk"
  | "diploma"
  | "s1"
  | "s2"
  | "s3"
  | "tidak_ada";

export interface ParsedCV {
  raw_text: string;
  skills: string[];
  soft_skills: string[];
  education: EducationLevel;
  experience_years: number;
  expected_salary: number;
  preferred_category: string | null;
  certifications_count: number;
  location?: string | null;
  work_arrangement?: string | null;
}

export interface MatchRequest {
  parsed_cv: ParsedCV;
  top_k?: number;
  algorithm?: AlgorithmType;
  hybrid_weight?: number;
  category_filter?: string | null;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  province?: string | null;   // Filter wilayah/provinsi (opsional)
}

export interface CareerPredictRequest {
  parsed_cv: ParsedCV;
}

/** Detail match score, hadir dalam nested "match_details" pada response backend */
export interface MatchDetails {
  skill_match_pct: string;      // e.g. "75%"
  skills_matched: string[];
  category_match: boolean;
  exp_gap_years: number;
  edu_sufficient: boolean;
  salary_feasible: boolean;
}

/**
 * Satu item rekomendasi lowongan dari backend.
 * Format: flat dict dari matcher_service._format_job_card()
 */
export interface MatchResult {
  // Ranking & Score
  rank: number;
  confidence_score: number;     // 0.0 – 1.0 (final hybrid score)
  confidence_pct: string;       // e.g. "87.3%"
  score_method: string;         // "Hybrid (40% ML + 60% Heuristic)" | "Heuristic"

  // Info Lowongan (Google Jobs format)
  job_id?: string;
  title: string;
  company_name: string;
  location: string;
  via: string;                  // platform sumber (LinkedIn, Indeed, dll.)
  posted_at: string | null;
  salary_display: string | null; // "Rp 15.0 jt–Rp 25.0 jt per bulan"
  salary_min: number;
  salary_max: number;
  employment_type: string | null;
  work_arrangement: string | null; // "Remote" | "Hybrid" | "Onsite"
  seniority_level: string | null;
  job_category: string | null;
  job_subcategory: string | null;
  min_experience_years: number;
  hard_skills: string[];
  description: string;
  apply_link: string;
  source_link: string;

  // Transparansi scoring
  match_details: MatchDetails;
}

export type ReadinessLabel = "Ready" | "Almost Ready" | "Partially Ready" | "Not Ready";

/** Wrapper response dari /api/v1/recommend/jobs */
export interface MatchResponse {
  success: boolean;
  total_jobs_evaluated: number;
  recommendations_count: number;
  score_method: string;
  category_filter_used: string | null;
  category_relaxed: boolean;
  recommendations: MatchResult[];
}

// -----------------------------------------------------------
// Search Types
// Maps ke response aktual dari vector_store.search()
// wrapped oleh retrieval_router
// -----------------------------------------------------------

/**
 * Satu item hasil pencarian semantik dari FAISS.
 * Format: flat dict dari vector_store._collect_results() + wrapper retrieval_router
 */
export interface SearchResult {
  // Similarity score dari FAISS
  similarity_score: number;     // 0.0 – 1.0 (cosine similarity)

  // Field lowongan (dari metadata FAISS — sama dengan refined_jobs.json)
  title: string;
  company_name: string;
  location: string;
  via?: string;
  description?: string;
  hard_skills?: string[];
  job_category?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  work_arrangement?: string;
  seniority_level?: string;
  job_id?: string;
  apply_link?: string;
  source_link?: string;
  posted_at?: string;
}

/** Wrapper response dari /api/v1/search */
export interface SearchResponse {
  success: boolean;
  total: number;
  query: string;
  threshold: number;
  province_filter: string | null;   // Filter wilayah yang digunakan
  data: SearchResult[];
}

// -----------------------------------------------------------
// Job Detail Types
// -----------------------------------------------------------

export interface JobListing {
  id: string;
  job_id?: string | null;
  title: string;
  company: string;
  location: string;
  job_type?: string | null;
  work_arrangement?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  posted_at?: string | null;
  source_url?: string | null;
  required_skills: string[];
  description: string;
}

// -----------------------------------------------------------
// Skill Gap Types
// -----------------------------------------------------------

export interface SkillGapItem {
  skill: string;
  user_has: boolean;
  weight: number;               // SKKNI importance weight
  skkni_unit?: string;
}

export interface SkillGapReport {
  job_id: string;
  readiness_score: number;      // 0 – 100
  readiness_label: ReadinessLabel;
  matched_skills: string[];
  missing_skills: string[];
  skill_items: SkillGapItem[];
  gap_summary: string;          // LLM-generated narrative
}

// -----------------------------------------------------------
// Career Prediction Types
// -----------------------------------------------------------

export interface CareerPath {
  title: string;
  probability: number;
  growth_trend: number;         // percentage
  avg_salary: number;
}

export interface CareerPrediction {
  recommended_paths: CareerPath[];
  current_level: string;
  next_level: string;
  narrative: string;
  trending_skills: TrendingSkill[];
}

export interface TrendingSkill {
  skill: string;
  demand_score: number;
  growth_rate: number;
}

// -----------------------------------------------------------
// API Response Wrappers
// -----------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  latency_ms?: number;
}

export interface CVUploadResponse {
  parsed_cv: ParsedCV;
  upload_id: string;
}

// -----------------------------------------------------------
// Diagnostic / Metadata Types (untuk DiagnosticStrip di UI)
// Dikonstruksi dari field MatchResponse di store
// -----------------------------------------------------------

export interface DiagnosticMeta {
  total_jobs_evaluated: number;
  recommendations_count: number;
  score_method: string;
}

// -----------------------------------------------------------
// SKKNI Radar Chart Types (for recharts)
// -----------------------------------------------------------

export interface RadarDataPoint {
  subject: string;              // SKKNI unit code / skill name
  user_score: number;           // 0 – 100
  required_score: number;       // 0 – 100
  fullMark: number;             // always 100
}

// -----------------------------------------------------------
// Gemini AI Advisor Types
// -----------------------------------------------------------

export interface SkillGapRecommendation {
  skill: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  resource: string;
}

export interface GeminiAdvisorResponse {
  career_narrative: string;
  skill_gaps: SkillGapRecommendation[];
  cover_letter_opening: string;
}
