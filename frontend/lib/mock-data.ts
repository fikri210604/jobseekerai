import type {
  DiagnosticMeta,
  JobListing,
  MatchResult,
  RadarDataPoint,
  SearchResult,
} from "@/types";

// -----------------------------------------------------------
// Mock Results (MatchResult[] — flat format dari backend)
// -----------------------------------------------------------

export const MOCK_RESULTS: MatchResult[] = Array.from({ length: 8 }, (_, i) => ({
  rank: i + 1,
  confidence_score: 0.95 - i * 0.06,
  confidence_pct: `${Math.round((0.95 - i * 0.06) * 100)}.0%`,
  score_method: "Hybrid (40% ML + 60% Heuristic)",

  title: [
    "Senior Data Scientist",
    "Machine Learning Engineer",
    "Backend Engineer (Python)",
    "AI Research Analyst",
    "Data Engineer",
    "NLP Engineer",
    "Cloud ML Engineer",
    "Analytics Engineer",
  ][i],
  company_name: ["Tokopedia", "Gojek", "Traveloka", "Shopee", "OVO", "Dana", "BRI", "Mandiri"][i],
  location: ["Jakarta Selatan", "Jakarta Pusat", "Bandung", "Jakarta Barat", "Surabaya", "Jakarta", "Bali", "Depok"][i],
  via: ["LinkedIn", "Indeed", "Glints", "LinkedIn", "Kalibrr", "Jobstreet", "LinkedIn", "Indeed"][i],
  posted_at: "2 days ago",
  salary_display: ["Rp 20.0 jt–Rp 35.0 jt per bulan", null, "Rp 15.0 jt–Rp 25.0 jt per bulan", null, null, "Rp 18.0 jt–Rp 30.0 jt per bulan", null, null][i],
  salary_min: [20_000_000, 0, 15_000_000, 0, 0, 18_000_000, 0, 0][i],
  salary_max: [35_000_000, 0, 25_000_000, 0, 0, 30_000_000, 0, 0][i],
  employment_type: "Full-time",
  work_arrangement: ["Hybrid", "Remote", "Onsite", "Hybrid", "Onsite", "Remote", "Hybrid", "Onsite"][i],
  seniority_level: ["Senior", "Mid", "Mid", "Senior", "Mid", "Mid", "Senior", "Junior"][i],
  job_category: "Technology",
  job_subcategory: ["Data Science", "ML Engineering", "Backend Dev", "AI Research", "Data Engineering", "NLP", "Cloud ML", "Analytics"][i],
  min_experience_years: [4, 3, 3, 5, 3, 3, 5, 1][i],
  hard_skills: ["Python", "TensorFlow", "SQL", "Docker"],
  description: "",
  apply_link: "https://example.com/apply",
  source_link: `https://example.com/jobs/${i + 1}`,

  match_details: {
    skill_match_pct: `${70 - i * 5}%`,
    skills_matched: ["python", "sql", "docker", "tensorflow"].slice(
      0,
      4 - Math.min(i, 3)
    ),
    category_match: true,
    exp_gap_years: -1.5 + i * 0.5,
    edu_sufficient: true,
    salary_feasible: i < 4,
  },
}));

// -----------------------------------------------------------
// Mock Diagnostic (DiagnosticMeta — dari MatchResponse)
// -----------------------------------------------------------

export const MOCK_DIAGNOSTIC: DiagnosticMeta = {
  total_jobs_evaluated: 1322,
  recommendations_count: 8,
  score_method: "Hybrid (40% ML + 60% Heuristic)",
};

// -----------------------------------------------------------
// Mock Search Results (SearchResult[] — flat format dari vector_store)
// -----------------------------------------------------------

export const MOCK_SEARCH_RESULTS: SearchResult[] = Array.from({ length: 8 }, (_, i) => ({
  similarity_score: 0.9658 - i * 0.045,
  title: [
    "Data Scientist - NLP & Language Model",
    "Machine Learning Engineer (Recommendation)",
    "Senior Backend Engineer - Python/FastAPI",
    "AI Research Scientist",
    "Data Engineer - Spark & Kafka",
    "Computer Vision Engineer",
    "MLOps Engineer",
    "Business Intelligence Analyst",
  ][i],
  company_name: ["Tokopedia", "Gojek", "Traveloka", "Shopee", "Dana", "Bukalapak", "OVO", "BCA"][i],
  location: ["Jakarta", "Jakarta", "Bandung", "Jakarta", "Surabaya", "Jakarta", "Jakarta", "Jakarta Selatan"][i],
  job_category: "Technology",
  work_arrangement: ["Hybrid", "Remote", "Onsite", "Hybrid", "Onsite", "Remote", "Hybrid", "Onsite"][i],
  hard_skills: ["Python", "SQL"],
  description: "",
  source_link: `https://example.com/search-jobs/${i + 1}`,
}));

// -----------------------------------------------------------
// Mock Job Detail
// -----------------------------------------------------------

export const MOCK_JOB: JobListing = {
  id: "mock-job-1",
  title: "Staff Data Engineer, Pipeline",
  company: "JobSeeker Labs",
  location: "Jakarta / Remote",
  job_type: "Full-time",
  work_arrangement: "Hybrid",
  salary_min: 18_000_000,
  salary_max: 32_000_000,
  posted_at: new Date().toISOString(),
  source_url: "https://example.com/apply",
  required_skills: [
    "Python",
    "SQL",
    "Apache Kafka",
    "Data Pipeline",
    "Cloud Computing",
  ],
  description: `## Role Overview
Kami mencari Data Engineer yang mampu membangun pipeline data andal untuk mendukung produk AI career intelligence.

## Responsibilities
- Mendesain dan mengelola **ETL pipeline** untuk data lowongan kerja.
- Mengoptimalkan query, data model, dan workflow analitik.
- Berkolaborasi dengan tim ML untuk memastikan data siap digunakan dalam training dan inference.

## Requirements
- Pengalaman kuat dengan **Python**, **SQL**, dan workflow data processing.
- Familiar dengan cloud deployment, observability, dan versioning data.
- Memahami prinsip data quality dan dokumentasi teknis.`,
};

// -----------------------------------------------------------
// Mock Radar Chart Data (untuk SkillGapPanel)
// -----------------------------------------------------------

export const MOCK_RADAR_DATA: RadarDataPoint[] = [
  { subject: "Python/ML", user_score: 85, required_score: 95, fullMark: 100 },
  { subject: "NLP/LLM",   user_score: 70, required_score: 90, fullMark: 100 },
  { subject: "Data Eng.", user_score: 55, required_score: 80, fullMark: 100 },
  { subject: "Cloud/Infra", user_score: 40, required_score: 75, fullMark: 100 },
  { subject: "Statistics", user_score: 75, required_score: 85, fullMark: 100 },
  { subject: "SQL/DB",    user_score: 80, required_score: 85, fullMark: 100 },
];

export const MOCK_MISSING_UNITS = ["J.620100.005.01", "J.620100.007.02", "J.620100.009.01"];
export const MOCK_MATCHED_UNITS = ["J.620100.001.01", "J.620100.002.03"];
