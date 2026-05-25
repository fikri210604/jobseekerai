# api/v1/endpoints/skills.py
"""
Controller untuk /api/v1/skills.
Hanya bertanggung jawab: menerima request, memanggil service, dan mengembalikan response.
Semua Pydantic schema ada di api/v1/schemas/skills.py.

NOTE: Endpoint ini menggunakan MVP mock response sementara menunggu
      integrasi penuh dengan Ollama/Gemma 2B di services/skill_gap.py.
"""

from fastapi import APIRouter, Depends, HTTPException

from backend.api.v1.schemas.skills import (
    SkillGapRequest,
    SkillGapData,
    SkillGapItem,
    SkillGapResponse,
    TrendingSkillItem,
    TrendingResponse,
)

router = APIRouter()

# Daftar skill trending yang dikurasi secara manual (akan diganti dengan analisis dinamis)
_TRENDING_SKILLS: list[TrendingSkillItem] = [
    TrendingSkillItem(skill="Python",         demand_score=95.0, growth_rate=0.15),
    TrendingSkillItem(skill="SQL",            demand_score=90.0, growth_rate=0.05),
    TrendingSkillItem(skill="Machine Learning", demand_score=88.0, growth_rate=0.22),
    TrendingSkillItem(skill="Power BI",       demand_score=82.0, growth_rate=0.18),
    TrendingSkillItem(skill="TensorFlow",     demand_score=78.0, growth_rate=0.12),
]


@router.post(
    "/gap",
    response_model=SkillGapResponse,
    summary="Analisis Skill Gap",
    description="Menghitung kesenjangan antara skill user dan requirement lowongan.",
)
async def analyze_skill_gap(request: SkillGapRequest) -> SkillGapResponse:
    # TODO: Ganti dengan integrasi ke services/skill_gap.py setelah migrasi ke Gemma 2B
    matched = request.user_skills[:3]
    missing = ["Data Visualization", "Cloud Computing", "Statistics"]

    gap_data = SkillGapData(
        job_id=request.job_id,
        readiness_score=75.0,
        readiness_label="Almost Ready",
        matched_skills=matched,
        missing_skills=missing,
        skill_items=[
            SkillGapItem(skill=sk, user_has=True, weight=0.8)
            for sk in request.user_skills
        ],
        gap_summary="Analisis MVP sementara — integrasi Ollama/Gemma 2B segera hadir.",
    )
    return SkillGapResponse(success=True, data=gap_data)


@router.get(
    "/trending",
    response_model=TrendingResponse,
    summary="Skill Trending",
    description="Daftar skill yang sedang tren berdasarkan analisis dataset lowongan.",
)
async def get_trending_skills() -> TrendingResponse:
    # TODO: Ganti dengan analisis frekuensi hard_skills dari refined_jobs.json
    return TrendingResponse(success=True, data=_TRENDING_SKILLS)
