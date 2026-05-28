from fastapi import APIRouter, Depends, HTTPException
from backend.api.v1.schemas.stats import StatsResponse
from backend.api.dependencies import get_vector_store
from backend.services.statistic_service import statistic_service, StatisticService

router = APIRouter()

def get_statistic_service() -> StatisticService:
    return statistic_service

@router.get(
    "",
    response_model=StatsResponse,
    summary="Unified Market Insights & Statistics",
    description="Mengembalikan semua statistik, insight pasar, dan distribusi lowongan dalam satu endpoint."
)
async def get_all_stats(
    stat_svc: StatisticService = Depends(get_statistic_service)
) -> StatsResponse:
    try:
        data = stat_svc.get_unified_stats()
        if data["status"] != "loaded":
            raise HTTPException(status_code=503, detail="FAISS index belum tersedia.")
            
        return StatsResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data statistik: {str(e)}")
