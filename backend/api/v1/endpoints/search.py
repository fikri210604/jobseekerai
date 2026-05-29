# api/v1/endpoints/search.py
"""
Controller untuk /api/v1/search.
Hanya bertanggung jawab: menerima request, memanggil service, dan mengembalikan response.
Semua Pydantic schema ada di api/v1/schemas/search.py.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.api.dependencies import get_vector_store
from backend.api.v1.schemas.search import (
    SearchResponse,
    SearchResult,
)
from backend.services.vector_store import VectorStore

router = APIRouter()


@router.get(
    "",
    response_model=SearchResponse,
    summary="Pencarian Semantik Lowongan (FAISS)",
    description=(
        "Cari lowongan kerja menggunakan Semantic Search berbasis FAISS + SBERT. "
        "Gunakan parameter `province` untuk memfilter hasil berdasarkan wilayah/provinsi. "
        "Jika tidak ada lowongan yang cocok untuk wilayah tersebut, `data` akan kosong."
    ),
)
async def search_jobs(
    q:         str            = Query(..., min_length=2, description="Kata kunci pencarian bebas."),
    limit:     int            = Query(default=10, ge=1, le=50),
    threshold: float          = Query(default=0.3, ge=0.0, le=1.0),
    province:  Optional[str]  = Query(
        default=None,
        description=(
            "Filter wilayah/provinsi (opsional). "
            "Contoh: 'Jawa Barat', 'DKI Jakarta', 'Bali'. "
            "Pencocokan bersifat case-insensitive dan substring match pada field `location`. "
            "Jika diisi namun tidak ada lowongan yang cocok, response `data` akan kosong."
        )
    ),
    vs: VectorStore  = Depends(get_vector_store),
) -> SearchResponse:
    try:
        raw_results = vs.search(
            query_text=q,
            top_k=limit,
            threshold=threshold,
            province=province,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan semantic search: {str(e)}")

    results = [SearchResult(**r) for r in raw_results]
    return SearchResponse(
        success=True,
        total=len(results),
        query=q,
        threshold=threshold,
        province_filter=province,
        data=results,
    )
