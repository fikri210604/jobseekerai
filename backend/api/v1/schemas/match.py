# api/v1/schemas/match.py
"""
Pydantic schemas untuk endpoint /api/v1/match.
Mendefinisikan kontrak request/response secara eksplisit.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ── Request Schemas ────────────────────────────────────────────────────────────

class MatchProfileInput(BaseModel):
    """Profil kandidat yang dikirim oleh frontend."""
    hard_skills:             list[str] = Field(..., min_length=1, description="Daftar hard skill kandidat.")
    soft_skills:             list[str] = Field(default=[], description="Daftar soft skill (opsional).")
    education_level:         str       = Field(..., description="Tingkat pendidikan, contoh: S1, D3, SMA.")
    total_experience_years:  float     = Field(..., ge=0, description="Total pengalaman kerja dalam tahun.")
    preferred_category:      Optional[str] = Field(default=None, description="Kategori pekerjaan yang diinginkan.")
    preferred_salary:        Optional[int] = Field(default=0, ge=0, description="Ekspektasi gaji per bulan (Rp).")
    certifications_count:    int           = Field(default=0, ge=0, description="Jumlah sertifikasi yang dimiliki.")
    location:                Optional[str] = Field(default=None, description="Lokasi domisili atau preferensi lokasi kerja kandidat.")
    work_arrangement:        Optional[str] = Field(default="Full-time", description="Preferensi tipe pekerjaan (contoh: Full-time, Part-time, Remote, Internship).")

    model_config = {
        "json_schema_extra": {
            "example": {
                "hard_skills": ["Microsoft Excel", "Accounting", "Taxation", "Financial Auditing", "Accurate Software"],
                "soft_skills": ["ketelitian", "integritas", "komunikasi"],
                "education_level": "S1",
                "total_experience_years": 2,
                "preferred_category": "Finance",
                "location": "Jakarta",
                "work_arrangement": "Full-time",
                "preferred_salary": 6000000,
                "certifications_count": 1,
            }
        }
    }


class MatchRequest(BaseModel):
    """Body request untuk POST /api/v1/match."""
    parsed_cv:       MatchProfileInput
    category_filter: Optional[str] = Field(default=None, description="Override filter kategori (opsional).")

    model_config = {
        "json_schema_extra": {
            "example": {
                "parsed_cv": {
                    "hard_skills": ["Microsoft Excel", "Accounting", "Taxation", "Financial Auditing", "Accurate Software"],
                    "soft_skills": ["ketelitian", "integritas", "komunikasi"],
                    "education_level": "S1",
                    "total_experience_years": 2,
                    "preferred_category": "Finance",
                    "location": "Jakarta",
                    "preferred_salary": 6000000,
                    "certifications_count": 1,
                },
                "category_filter": None,
            }
        }
    }


# ── Response Schemas ───────────────────────────────────────────────────────────

class MatchDetails(BaseModel):
    """Detail breakdown scoring untuk transparansi ML."""
    skill_match_pct: str
    skills_matched:  list[str]
    category_match:  bool
    exp_gap_years:   float
    edu_sufficient:  bool
    salary_feasible: bool


class MatchResult(BaseModel):
    """Satu item rekomendasi lowongan."""
    # Metadata skor
    rank:             int
    confidence_score: float
    confidence_pct:   str
    score_method:     str

    # Info lowongan
    title:               str
    company_name:        str
    location:            str
    via:                 Optional[str] = None
    posted_at:           Optional[str] = None
    salary_display:      Optional[str] = None
    salary_min:          Optional[int] = 0
    salary_max:          Optional[int] = 0
    employment_type:     Optional[str] = None
    work_arrangement:    Optional[str] = None
    seniority_level:     Optional[str] = None
    job_category:        Optional[str] = None
    job_subcategory:     Optional[str] = None
    min_experience_years: Optional[int] = 0
    hard_skills:         list[str]     = []
    description:         Optional[str] = ""
    apply_link:          Optional[str] = ""
    source_link:         Optional[str] = ""

    # Detail fitur
    match_details: MatchDetails


class MatchResponse(BaseModel):
    """Response untuk POST /api/v1/match."""
    success:               bool
    total_jobs_evaluated:  int
    recommendations_count: int
    score_method:          str
    category_filter_used:  Optional[str] = None
    category_relaxed:      bool          = False
    recommendations:       list[MatchResult]


class CategoriesResponse(BaseModel):
    """Response untuk GET /api/v1/match/categories."""
    success:    bool
    total:      int
    categories: list[str]
