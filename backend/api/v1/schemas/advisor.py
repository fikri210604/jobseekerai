# api/v1/schemas/advisor.py
"""
Pydantic schemas untuk endpoint /api/v1/advisor.
Mendefinisikan kontrak request/response untuk Gemini AI Career Advisor.
"""

from pydantic import BaseModel, Field
from typing import Any


# ── Request Schemas ────────────────────────────────────────────────────────────

class AdvisorRequest(BaseModel):
    """Body request untuk POST /api/v1/advisor/career."""

    user_profile: dict[str, Any] = Field(
        ...,
        description="Profil kandidat (kompatibel dengan MatchProfileInput).",
        examples=[{
            "hard_skills": ["Python", "Machine Learning", "SQL"],
            "soft_skills": ["komunikasi", "problem solving"],
            "education_level": "S1",
            "total_experience_years": 2,
            "preferred_category": "Technology",
            "preferred_salary": 8000000,
            "location": "Jakarta",
            "work_arrangement": "Hybrid",
        }],
    )
    match_results: list[dict[str, Any]] = Field(
        ...,
        min_length=1,
        description=(
            "Daftar hasil rekomendasi lowongan dari endpoint /api/v1/match. "
            "Minimal 1 item, maksimal 10 item pertama yang akan digunakan."
        ),
    )


# ── Response Schemas ───────────────────────────────────────────────────────────

class SkillGapItem(BaseModel):
    """Satu item rekomendasi skill yang perlu dikuasai."""
    skill:    str = Field(..., description="Nama skill yang direkomendasikan.")
    priority: str = Field(..., description="Prioritas: High | Medium | Low.")
    reason:   str = Field(..., description="Alasan mengapa skill ini dibutuhkan.")
    resource: str = Field(..., description="Sumber atau platform untuk mempelajari skill ini.")


class CareerAdvice(BaseModel):
    """Hasil analisis karir dari Gemini AI Career Advisor."""
    career_narrative:    str              = Field(..., description="Narasi advisor karir yang dipersonalisasi.")
    skill_gaps:          list[SkillGapItem] = Field(..., description="Daftar 3 skill gap prioritas.")
    cover_letter_opening: str             = Field(..., description="Draft kalimat pembuka cover letter.")


class AdvisorResponse(BaseModel):
    """Response untuk POST /api/v1/advisor/career."""
    success: bool
    model:   str = Field(..., description="Model Gemini yang digunakan.")
    advice:  CareerAdvice
