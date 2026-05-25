# main.py — FastAPI Entry Point untuk SkillBridge AI Backend
"""
Jalankan server:
    uvicorn main:app --reload --port 8000

Akses Swagger UI (OpenAPI):
    http://localhost:8000/docs

Akses ReDoc:
    http://localhost:8000/redoc
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Routers ───────────────────────────────────────────────────────────────────
from backend.api.v1.api_router import api_router           # Clean Architecture endpoints
from backend.routes.predictor_router import router as predictor_router  # Legacy (deprecated)
from backend.routes.retrieval_router import router as retrieval_router  # Legacy (deprecated)
from backend.routes.web import router as web_router                     # Internal tools

# ── Services ──────────────────────────────────────────────────────────────────
from backend.services.matcher_service import matcher
from backend.services.vector_store import vector_store

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# ── Startup / Shutdown Lifecycle ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Muat semua resource berat (model, FAISS index) sekali saat startup."""
    logger.info("🚀 SkillBridge AI Backend sedang starting up...")

    # 1. Muat data lowongan + model ML
    match_stats = matcher.load_resources()
    logger.info(
        f"📊 Matcher: {match_stats['jobs_loaded']:,} jobs | "
        f"ML model: {'✅' if match_stats['model_loaded'] else '⚠️ Heuristic fallback'}"
    )

    # 2. Muat FAISS index
    faiss_ok = vector_store.load_index()
    logger.info(f"🔍 FAISS index: {'✅ loaded' if faiss_ok else '⚠️ not found (semantic search unavailable)'}")

    yield  # Server berjalan di sini

    logger.info("⛔ SkillBridge AI Backend shutting down...")


# ── App Instance ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SkillBridge AI — Backend API",
    description=(
        "**Career Advisor API** berbasis multi-layer scoring untuk pasar kerja Indonesia.\n\n"
        "### Endpoint Groups\n"
        "| Grup | Path | Deskripsi |\n"
        "|---|---|---|\n"
        "| **Matching** | `/api/v1/match` | Rekomendasi lowongan Hybrid AI |\n"
        "| **Search** | `/api/v1/search` | Pencarian semantik FAISS + SBERT |\n"
        "| **Jobs** | `/api/v1/jobs` | Daftar & detail lowongan |\n"
        "| **Skills** | `/api/v1/skills` | Skill gap & trending skills |\n"
        "| **Internal** | `/api/v1/internal` | Tools pipeline (admin) |\n"
        "| **Legacy** | `/api/v1/recommend`, `/api/v1/retrieval` | Deprecated |\n\n"
        "> **Data**: Lowongan kerja dari Google Jobs yang telah diproses via ETL pipeline."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS — Izinkan request dari frontend Next.js ───────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:8000",    # Swagger UI self-request
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routers ───────────────────────────────────────────────────────────

# Clean Architecture (primary)
app.include_router(api_router, prefix="/api/v1")

# Internal tools
app.include_router(web_router)

# Legacy (deprecated — dipertahankan untuk backward compatibility)
app.include_router(predictor_router)
app.include_router(retrieval_router)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Root — Status Server")
async def root():
    return {
        "status":  "ok",
        "message": "SkillBridge AI Backend is running 🚀",
        "docs":    "http://localhost:8000/docs",
    }


@app.get("/health", tags=["Health"], summary="Health Check")
async def health_check():
    faiss_stats = vector_store.get_index_stats()
    return {
        "status":        "healthy",
        "jobs_loaded":   len(matcher._jobs),
        "ml_model":      "loaded" if matcher._ml_model is not None else "not_loaded (heuristic fallback)",
        "faiss_index":   faiss_stats.get("status", "unknown"),
        "faiss_vectors": faiss_stats.get("total_vectors", 0),
    }
