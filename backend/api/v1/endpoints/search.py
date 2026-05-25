# api/v1/endpoints/search.py
"""
Controller untuk /api/v1/search.
Hanya bertanggung jawab: menerima request, memanggil service, dan mengembalikan response.
Semua Pydantic schema ada di api/v1/schemas/search.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.api.dependencies import get_vector_store
from backend.api.v1.schemas.search import (
    SearchResponse,
    StatsResponse,
    SearchResult,
    JobDistributionResponse,
    JobCategoryDistributionResponse,
)
from backend.services.vector_store import VectorStore

router = APIRouter()


@router.get(
    "",
    response_model=SearchResponse,
    summary="Pencarian Semantik Lowongan (FAISS)",
    description="Cari lowongan kerja menggunakan Semantic Search berbasis FAISS + SBERT.",
)
async def search_jobs(
    q:         str   = Query(..., min_length=2, description="Kata kunci pencarian bebas."),
    limit:     int   = Query(default=10, ge=1, le=50),
    threshold: float = Query(default=0.3, ge=0.0, le=1.0),
    vs: VectorStore  = Depends(get_vector_store),
) -> SearchResponse:
    try:
        raw_results = vs.search(query_text=q, top_k=limit, threshold=threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan semantic search: {str(e)}")

    results = [SearchResult(**r) for r in raw_results]
    return SearchResponse(
        success=True,
        total=len(results),
        query=q,
        threshold=threshold,
        data=results,
    )


@router.get(
    "/distribution",
    response_model=JobDistributionResponse,
    summary="Sebaran Wilayah Pekerjaan",
    description="Mengembalikan agregasi jumlah lowongan kerja berdasarkan provinsi di Indonesia.",
)
async def get_distribution(
    vs: VectorStore = Depends(get_vector_store),
) -> JobDistributionResponse:
    try:
        dist_data = vs.get_job_distribution()
        return JobDistributionResponse(success=True, data=dist_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data sebaran: {str(e)}")


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Statistik FAISS Index",
    description="Informasi jumlah vektor dan dimensi index yang sedang berjalan.",
)
async def retrieval_stats(
    vs: VectorStore = Depends(get_vector_store),
) -> StatsResponse:
    stats = vs.get_index_stats()
    if stats.get("status") == "not_loaded":
        raise HTTPException(status_code=503, detail="FAISS index belum tersedia.")
    return StatsResponse(success=True, **stats)


@router.get(
    "/jobs_category",
    response_model=JobCategoryDistributionResponse,
    summary="Sebaran Kategori Pekerjaan",
    description="Mengembalikan agregasi jumlah lowongan kerja berdasarkan kategori utama dan sub-kategori.",
)
async def get_jobs_category_distribution(
    vs: VectorStore = Depends(get_vector_store),
) -> JobCategoryDistributionResponse:
    try:
        category_data = vs.get_job_category_distribution()
        return JobCategoryDistributionResponse(success=True, data=category_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data sebaran kategori: {str(e)}")

