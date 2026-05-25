# backend/routes/web.py
"""
FastAPI router untuk monitoring internal pipeline dan manajemen data (ETL & Vector Store).
Endpoint ini ditujukan untuk admin/developer agar bisa memantau kesehatan data di Swagger.
"""

import os
import json
from fastapi import APIRouter, BackgroundTasks, HTTPException
from backend.services.vector_store import get_index_stats
from backend.services.etl_pipeline import run_etl

router = APIRouter(prefix="/api/v1/internal", tags=["Internal Pipeline"])

# Path Data (untuk statistik file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data", "scrap")
RAW_JOBS_PATH = os.path.join(DATA_DIR, "google_jobs_results.json")
CLEANED_JOBS_PATH = os.path.join(DATA_DIR, "google_jobs_cleaned.json")

@router.get("/stats")
async def get_pipeline_stats():
    """
    Mengambil statistik kesehatan data di dalam pipeline.
    Memberikan informasi jumlah data mentah vs data bersih.
    """
    stats = {
        "raw_data": {"count": 0, "size_mb": 0, "path": RAW_JOBS_PATH},
        "cleaned_data": {"count": 0, "size_mb": 0, "path": CLEANED_JOBS_PATH},
        "vector_store": get_index_stats()
    }

    # Hitung data mentah
    if os.path.exists(RAW_JOBS_PATH):
        stats["raw_data"]["size_mb"] = round(os.path.getsize(RAW_JOBS_PATH) / (1024 * 1024), 2)
        with open(RAW_JOBS_PATH, "r", encoding="utf-8") as f:
            try:
                stats["raw_data"]["count"] = len(json.load(f))
            except: pass

    # Hitung data bersih
    if os.path.exists(CLEANED_JOBS_PATH):
        stats["cleaned_data"]["size_mb"] = round(os.path.getsize(CLEANED_JOBS_PATH) / (1024 * 1024), 2)
        with open(CLEANED_JOBS_PATH, "r", encoding="utf-8") as f:
            try:
                stats["cleaned_data"]["count"] = len(json.load(f))
            except: pass

    return stats

@router.post("/rebuild-index")
async def trigger_rebuild_index(background_tasks: BackgroundTasks):
    """
    Memicu pembangunan ulang index FAISS dari data yang sudah dibersihkan.
    Proses ini berjalan asinkron di background.
    """
    if not os.path.exists(CLEANED_JOBS_PATH):
        raise HTTPException(status_code=400, detail="Data bersih tidak ditemukan. Jalankan ETL terlebih dahulu.")
    
    # Jalankan build_index di background agar API tidak timeout
    # background_tasks.add_task(build_index)
    
    return {
        "success": False,
        "message": "Fungsi pembangunan ulang index belum diimplementasikan di backend. Gunakan notebook retrieval_pipeline.ipynb."
    }

@router.post("/run-etl")
async def trigger_etl_pipeline(background_tasks: BackgroundTasks):
    """
    Memicu proses ETL (Data Denoising via Gemini) secara asinkron.
    """
    if not os.path.exists(RAW_JOBS_PATH):
        raise HTTPException(status_code=400, detail="File data mentah (raw data) tidak ditemukan.")
    
    # Jalankan ETL di background
    background_tasks.add_task(run_etl)
    
    return {
        "success": True,
        "message": "Proses ETL (Gemini) telah dimulai di background. Pantau log terminal untuk progres."
    }
