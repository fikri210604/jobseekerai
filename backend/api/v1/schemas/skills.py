# api/v1/schemas/skills.py
"""
Pydantic schemas untuk endpoint /api/v1/skills.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ── Request Schemas ────────────────────────────────────────────────────────────

class SkillGapRequest(BaseModel):
    """Body request untuk POST /api/v1/skills/gap."""
    job_id:      str           = Field(..., description="ID atau source_link lowongan target.")
    user_skills: list[str]    = Field(default=[], description="Daftar skill yang dimiliki user.")


# ── Response Schemas ───────────────────────────────────────────────────────────

class SkillGapItem(BaseModel):
    """Detail satu skill dalam analisis gap."""
    skill:    str
    user_has: bool
    weight:   float


class SkillGapData(BaseModel):
    """Data utama hasil analisis skill gap."""
    job_id:          str
    readiness_score: float
    readiness_label: str
    matched_skills:  list[str]
    missing_skills:  list[str]
    skill_items:     list[SkillGapItem]
    gap_summary:     str


class SkillGapResponse(BaseModel):
    """Response untuk POST /api/v1/skills/gap."""
    success: bool
    data:    SkillGapData


class TrendingSkillItem(BaseModel):
    """Satu item skill trending."""
    skill:       str
    demand_score: float
    growth_rate: float


class TrendingResponse(BaseModel):
    """Response untuk GET /api/v1/skills/trending."""
    success: bool
    data:    list[TrendingSkillItem]
