# api/v1/endpoints/match.py
"""
Controller untuk /api/v1/match.
Hanya bertanggung jawab: menerima request, memanggil service, dan mengembalikan response.
Semua Pydantic schema ada di api/v1/schemas/match.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.api.dependencies import get_matcher
from backend.api.v1.schemas.match import MatchRequest, MatchResponse, CategoriesResponse
from backend.services.matcher_service import MatcherService

router = APIRouter()


@router.post(
    "",
    response_model=MatchResponse,
    summary="Rekomendasi Lowongan (Hybrid AI)",
    description="Cocokkan profil kandidat dengan lowongan kerja menggunakan Hybrid AI (Heuristic + ML).",
)
async def match_jobs(
    request: MatchRequest,
    limit: int = Query(10, ge=1, le=50, description="Jumlah rekomendasi yang dikembalikan (Paginasi)"),
    matcher: MatcherService = Depends(get_matcher),
) -> MatchResponse:
    try:
        result = matcher.recommend_jobs(
            user_profile=request.parsed_cv.model_dump(),
            top_k=limit,
            category_filter=request.category_filter,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses rekomendasi: {str(e)}")

    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])

    return MatchResponse(success=True, **result)


@router.get(
    "/categories",
    response_model=CategoriesResponse,
    summary="Daftar Kategori Pekerjaan",
    description="Kembalikan daftar unik kategori pekerjaan yang tersedia di dataset.",
)
async def list_job_categories(
    matcher: MatcherService = Depends(get_matcher),
) -> CategoriesResponse:
    cats = matcher.get_available_categories()
    if not cats:
        raise HTTPException(status_code=503, detail="Data lowongan belum dimuat.")
    return CategoriesResponse(success=True, total=len(cats), categories=cats)
