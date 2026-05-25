"""
predictor_router.py — Legacy Router (Deprecated)
=================================================
Router ini dipertahankan hanya untuk backward compatibility sementara.
Gunakan endpoint baru: POST /api/v1/match

Prefix : /api/v1/recommend
Tag    : Recommendation (Legacy)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from backend.api.dependencies import get_matcher
from backend.api.v1.schemas.match import MatchProfileInput, MatchResponse, CategoriesResponse
from backend.services.matcher_service import matcher

router = APIRouter(prefix="/api/v1/recommend", tags=["Recommendation (Legacy)"])


@router.post(
    "/jobs",
    response_model=MatchResponse,
    summary="[Legacy] Rekomendasi Lowongan — Gunakan POST /api/v1/match",
    deprecated=True,
)
async def get_job_recommendations(
    profile: MatchProfileInput,
    top_k: int = Query(default=10, ge=1, le=50),
    category_filter: Optional[str] = Query(default=None),
) -> MatchResponse:
    try:
        result = matcher.recommend_jobs(
            user_profile=profile.model_dump(),
            top_k=top_k,
            category_filter=category_filter or profile.preferred_category,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])

    return MatchResponse(success=True, **result)


@router.get(
    "/categories",
    response_model=CategoriesResponse,
    summary="[Legacy] Kategori — Gunakan GET /api/v1/match/categories",
    deprecated=True,
)
async def list_job_categories() -> CategoriesResponse:
    cats = matcher.get_available_categories()
    if not cats:
        raise HTTPException(status_code=503, detail="Data lowongan belum dimuat.")
    return CategoriesResponse(success=True, total=len(cats), categories=cats)
