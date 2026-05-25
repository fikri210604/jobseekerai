"""
retrieval_router.py — Legacy Router (Deprecated)
=================================================
Router ini dipertahankan hanya untuk backward compatibility sementara.
Gunakan endpoint baru: GET /api/v1/search

Prefix : /api/v1/retrieval
Tag    : Retrieval Search (Legacy)
"""

from fastapi import APIRouter, HTTPException, Query

from backend.api.v1.schemas.search import SearchResponse, SearchResult, StatsResponse
from backend.services.vector_store import vector_store

router = APIRouter(prefix="/api/v1/retrieval", tags=["Retrieval Search (Legacy)"])


@router.get(
    "/search",
    response_model=SearchResponse,
    summary="[Legacy] Semantic Search — Gunakan GET /api/v1/search",
    deprecated=True,
)
async def search_jobs(
    q: str   = Query(..., min_length=2),
    limit: int = Query(default=10, ge=1, le=50),
    threshold: float = Query(default=0.3, ge=0.0, le=1.0),
) -> SearchResponse:
    try:
        raw_results = vector_store.search(query_text=q, top_k=limit, threshold=threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = [SearchResult(**r) for r in raw_results]
    return SearchResponse(success=True, total=len(results), query=q, threshold=threshold, data=results)


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="[Legacy] FAISS Stats — Gunakan GET /api/v1/search/stats",
    deprecated=True,
)
async def retrieval_stats() -> StatsResponse:
    stats = vector_store.get_index_stats()
    if stats.get("status") == "not_loaded":
        raise HTTPException(status_code=503, detail="FAISS index belum tersedia.")
    return StatsResponse(success=True, **stats)
