# api/v1/schemas/jobs.py
"""
Pydantic schemas untuk endpoint /api/v1/jobs.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any


# ── Response Schemas ───────────────────────────────────────────────────────────

class JobItem(BaseModel):
    """
    Representasi satu lowongan dari refined_jobs.json.
    Field bersifat Optional karena data scraping bisa tidak lengkap.
    """
    id:                   Optional[str] = None
    job_id:               Optional[str] = None
    title:                Optional[str] = None
    cleaned_title:        Optional[str] = None
    company_name:         Optional[str] = None
    location:             Optional[str] = None
    via:                  Optional[str] = None
    job_category:         Optional[str] = None
    job_subcategory:      Optional[str] = None
    employment_type:      Optional[str] = None
    work_arrangement:     Optional[str] = None
    seniority_level:      Optional[str] = None
    min_experience_years: Optional[int] = None
    salary_min:           Optional[int] = None
    salary_max:           Optional[int] = None
    hard_skills:          list[str]     = []
    description:          Optional[str] = None
    source_link:          Optional[str] = None

    model_config = {"extra": "allow"}  # Data scraping bisa punya field yang tidak terduga

    @field_validator("job_subcategory", mode="before")
    @classmethod
    def parse_job_subcategory(cls, v):
        if isinstance(v, list):
            return ", ".join(str(i) for i in v) if v else None
        return v


class JobListResponse(BaseModel):
    """Response untuk GET /api/v1/jobs."""
    success:          bool
    total_in_system:  int
    limit:            int
    offset:           int
    data:             list[JobItem]


class JobDetailResponse(BaseModel):
    """Response untuk GET /api/v1/jobs/{job_id}."""
    success: bool
    data:    JobItem
