# api/v1/schemas/search.py
"""
Pydantic schemas untuk endpoint /api/v1/search.
"""

from pydantic import BaseModel
from typing import Optional


# ── Response Schemas ───────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    """
    Satu item hasil pencarian semantik FAISS.
    Field mengikuti struktur asli google_jobs_results.json,
    ditambah field 'similarity_score' yang ditambahkan oleh VectorStore.search().
    """
    similarity_score: float

    # ── Field utama dari google_jobs_results.json ──────────────────────────
    title:         Optional[str] = None
    company_name:  Optional[str] = None
    location:      Optional[str] = None
    via:           Optional[str] = None
    source_link:   Optional[str] = None
    share_link:    Optional[str] = None
    description:   Optional[str] = None
    job_id:        Optional[str] = None

    # ── Field dari detected_extensions (di-flatten saat indexing) ─────────
    salary:        Optional[str] = None   # detected_extensions.salary
    posted_at:     Optional[str] = None   # detected_extensions.posted_at
    schedule_type: Optional[str] = None   # detected_extensions.schedule_type

    model_config = {"extra": "allow"}  # Izinkan field tambahan dari metadata FAISS


class SearchResponse(BaseModel):
    """Response untuk GET /api/v1/search."""
    success:        bool
    total:          int
    query:          str
    threshold:      float
    province_filter: Optional[str] = None  # Filter wilayah yang digunakan (None = semua wilayah)
    data:           list[SearchResult]




