# api/v1/endpoints/jobs.py
"""
Controller untuk /api/v1/jobs.
Hanya bertanggung jawab: menerima request, memanggil service, dan mengembalikan response.
Semua Pydantic schema ada di api/v1/schemas/jobs.py.
"""

from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.api.dependencies import get_matcher
from backend.api.v1.schemas.jobs import JobItem, JobListResponse, JobDetailResponse
from backend.services.matcher_service import MatcherService

router = APIRouter()


def _decode_job_identifier(value: str) -> str:
    decoded = value
    for _ in range(2):
        next_value = unquote(decoded)
        if next_value == decoded:
            break
        decoded = next_value
    return decoded


@router.get(
    "",
    response_model=JobListResponse,
    summary="Daftar Lowongan Pekerjaan",
    description="Kembalikan daftar lowongan dari dataset dengan pagination.",
)
async def list_jobs(
    limit:   int = Query(default=10, ge=1, le=100),
    offset:  int = Query(default=0, ge=0),
    matcher: MatcherService = Depends(get_matcher),
) -> JobListResponse:
    try:
        jobs_slice = matcher._jobs[offset: offset + limit]
        job_items  = [JobItem(**j) for j in jobs_slice]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat lowongan: {str(e)}")

    return JobListResponse(
        success=True,
        total_in_system=len(matcher._jobs),
        limit=limit,
        offset=offset,
        data=job_items,
    )


@router.get(
    "/{job_id}",
    response_model=JobDetailResponse,
    summary="Detail Lowongan Pekerjaan",
    description="Kembalikan detail lengkap satu lowongan berdasarkan ID atau source_link.",
)
async def get_job(
    job_id:  str,
    matcher: MatcherService = Depends(get_matcher),
) -> JobDetailResponse:
    normalized_id = _decode_job_identifier(job_id)
    job = next(
        (
            j
            for j in matcher._jobs
            if j.get("id") == normalized_id
            or j.get("job_id") == normalized_id
            or j.get("source_link") == normalized_id
            or any(opt.get("link") == normalized_id for opt in (j.get("apply_options") or []))
        ),
        None,
    )
    if not job:
        raise HTTPException(status_code=404, detail=f"Lowongan '{normalized_id}' tidak ditemukan.")

    return JobDetailResponse(success=True, data=JobItem(**job))
