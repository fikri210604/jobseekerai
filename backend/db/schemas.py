# agent/models/schemas.py
"""
Pydantic schemas — type safety untuk semua input/output pipeline JobSeeker AI.
Digunakan oleh FastAPI untuk validasi request/response otomatis.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class EducationLevel(str, Enum):
    SMA = "SMA"; SMK = "SMK"
    D1 = "D1";   D2 = "D2";   D3 = "D3"
    S1 = "S1";   S2 = "S2";   S3 = "S3"
    Profesi = "Profesi"

class ProficiencyLevel(str, Enum):
    NONE         = "none"
    BEGINNER     = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED     = "advanced"

class SkillStatus(str, Enum):
    MATCHED = "matched"
    MISSING = "missing"
    PARTIAL = "partial"

class Priority(str, Enum):
    HIGH   = "high"
    MEDIUM = "medium"
    LOW    = "low"

class ReadinessLabel(str, Enum):
    NOT_READY       = "Not Ready"
    PARTIALLY_READY = "Partially Ready"
    ALMOST_READY    = "Almost Ready"
    READY           = "Ready"

class RecommendationTag(str, Enum):
    STRONG_MATCH = "Strong Match"
    GOOD_MATCH   = "Good Match"
    STRETCH_GOAL = "Stretch Goal"

class JobType(str, Enum):
    FULL_TIME  = "Full Time"
    PART_TIME  = "Part Time"
    FREELANCE  = "Freelance"
    INTERNSHIP = "Internship"
    CONTRACT   = "Contract"


# ── CV Parser Schemas ──────────────────────────────────────────────────────────

class PersonalInfo(BaseModel):
    full_name:      Optional[str] = None
    email:          Optional[str] = None
    phone:          Optional[str] = None
    location:       Optional[str] = None
    linkedin_url:   Optional[str] = None
    portfolio_url:  Optional[str] = None

class Education(BaseModel):
    degree:           EducationLevel
    major:            str
    institution:      str
    graduation_year:  Optional[int]  = None
    gpa:              Optional[float] = None

class WorkExperience(BaseModel):
    job_title:         str
    company:           str
    start_date:        Optional[str] = None
    end_date:          Optional[str] = None
    duration_months:   Optional[int] = None
    responsibilities:  list[str]     = []

class Certification(BaseModel):
    name:   str
    issuer: Optional[str] = None
    year:   Optional[int] = None

class Language(BaseModel):
    language:    str
    proficiency: str

class Organization(BaseModel):
    name:   str
    role:   str
    period: Optional[str] = None

class ParsedCV(BaseModel):
    personal_info:          PersonalInfo
    education:              list[Education]        = []
    work_experience:        list[WorkExperience]   = []
    hard_skills:            list[str]              = []
    soft_skills:            list[str]              = []
    tools:                  list[str]              = []
    certifications:         list[Certification]    = []
    languages:              list[Language]         = []
    organizations:          list[Organization]     = []
    total_experience_years: float                  = 0.0
    suggested_job_titles:   list[str]              = []
    ocr_confidence_notes:   Optional[str]          = None


# ── Job Listing Schemas ────────────────────────────────────────────────────────

class RequiredSkill(BaseModel):
    name:             str
    importance_level: str = "preferred"   # mandatory | preferred | nice_to_have
    is_mandatory:     bool = False

class JobListing(BaseModel):
    id:                      str
    title:                   str
    company_name:            str
    location:                str
    is_remote:               bool           = False
    job_type:                JobType        = JobType.FULL_TIME
    experience_level:        str            = "Mid"
    education_requirement:   Optional[str]  = None
    min_experience_years:    int            = 0
    salary_min:              Optional[int]  = None
    salary_max:              Optional[int]  = None
    description:             str            = ""
    required_skills:         list[RequiredSkill] = []
    required_certifications: list[str]      = []
    source_platform:         str            = "manual"
    posted_at:               Optional[str]  = None


# ── Match Result Schemas ───────────────────────────────────────────────────────

class MatchResult(BaseModel):
    job_id:              str
    job_title:           str
    company:             str
    location:            str
    match_score:         float
    rule_based_score:    float
    semantic_score:      float
    ml_score:            float
    final_score:         float
    matched_skills:      list[str]
    missing_skills:      list[str]
    bonus_skills:        list[str]         = []
    match_summary:       str
    recommendation_tag:  RecommendationTag
    success_probability: float             = 0.0
    score_breakdown:     dict              = {}


# ── Skill Gap Schemas ──────────────────────────────────────────────────────────

class SkillBreakdown(BaseModel):
    skill:          str
    status:         SkillStatus
    user_level:     ProficiencyLevel
    required_level: ProficiencyLevel
    gap_score:      float              = Field(ge=0, le=100)
    priority:       Priority
    note:           Optional[str]      = None

class QuickWin(BaseModel):
    action:          str
    resource:        str
    estimated_days:  Optional[int] = None

class SkillGapReport(BaseModel):
    overall_readiness_score:   float = Field(ge=0, le=100)
    readiness_label:           ReadinessLabel
    summary:                   str
    skill_breakdown:           list[SkillBreakdown]
    strengths:                 list[str]
    critical_gaps:             list[str]
    quick_wins:                list[QuickWin]
    estimated_ready_in_months: Optional[float] = None


# ── Career Prediction Schemas ──────────────────────────────────────────────────

class CareerStep(BaseModel):
    role:             str
    timeframe:        str
    key_requirement:  str

class TrendingSkill(BaseModel):
    skill:               str
    demand_growth:       str
    relevance_to_user:   str
    urgency:             Priority

class UpskillingResource(BaseModel):
    name:           str
    platform:       str
    url:            Optional[str] = None
    is_free:        bool          = True
    duration_hours: Optional[int] = None

class UpskillingPhase(BaseModel):
    phase:          int
    title:          str
    duration_weeks: int
    focus_skills:   list[str]
    resources:      list[UpskillingResource]

class CareerPrediction(BaseModel):
    career_narrative:        str
    current_level:           str
    predicted_next_role:     str
    predicted_roles_ladder:  list[CareerStep]
    trending_skills_to_learn: list[TrendingSkill]
    upskilling_roadmap:      list[UpskillingPhase]
    industry_insight:        str
    confidence_score:        float = Field(ge=0, le=1)


# ── API Request/Response Schemas ───────────────────────────────────────────────

class CVUploadResponse(BaseModel):
    upload_id:           str
    file_type_detected:  str
    parsed_data:         ParsedCV
    raw_text_preview:    str

class MatchRequest(BaseModel):
    user_profile: ParsedCV
    top_n:        int = Field(default=5, ge=1, le=20)

class MatchResponse(BaseModel):
    results:      list[MatchResult]
    total_jobs_evaluated: int

class SkillGapRequest(BaseModel):
    user_profile: ParsedCV
    target_job:   JobListing

class CareerPredictRequest(BaseModel):
    user_profile: ParsedCV
