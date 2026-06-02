# backend/core/settings.py
"""
Konfigurasi global JobSeeker AI menggunakan Pydantic BaseSettings.
Validasi tipe otomatis saat startup.
"""

from typing import Dict, Tuple
from pathlib import Path
# pyright: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

# ── Env file resolution — kompatibel lokal & Cloud Run ────────────────────────
# Di Cloud Run, WORKDIR=/app dan source code ada di /app/backend/
# Di lokal, kita biasanya jalankan dari folder backend/
_THIS_DIR = Path(__file__).resolve().parent.parent  # → /app/backend atau D:\...\backend
_ENV_CANDIDATES = [
    _THIS_DIR / ".env",           # /app/backend/.env (Cloud Run)
    Path.cwd() / ".env",          # ./env dari working dir saat ini
    Path("/app/backend/.env"),    # Fallback absolut Cloud Run
]
_ENV_FILE = next((str(p) for p in _ENV_CANDIDATES if p.exists()), None)

# Paksa muat environment variabel dari file .env
import os
try:
    from dotenv import load_dotenv
    if _ENV_FILE:
        load_dotenv(_ENV_FILE, override=True)
except ImportError:
    pass


# ── Readiness Label Thresholds ────────────────────────────────────────────────
READINESS_LABELS = {
    (80, 100): "Ready",
    (60, 79):  "Almost Ready",
    (40, 59):  "Partially Ready",
    (0,  39):  "Not Ready",
}

def get_readiness_label(score: float) -> str:
    for (low, high), label in READINESS_LABELS.items():
        if low <= score <= high:
            return label
    return "Not Ready"


class Settings(BaseSettings):
    """
    Kelas konfigurasi utama. Pydantic otomatis memuat dari env vars.
    """
    model_config = SettingsConfigDict(env_file=_ENV_FILE, env_file_encoding="utf-8", extra="ignore")

    # ── Security & CORS ───────────────────────────────────────────────────────
    # Masukkan origin yang diizinkan, pisahkan dengan koma (contoh: "http://localhost:3000,https://domain.com")
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
    api_key: str = "default_api_key_change_me"


    # ── Google Cloud (GCP) ────────────────────────────────────────────────────
    gcp_project_id: str = "your-gcp-project-id"
    gcp_location: str = "us-central1"
    google_application_credentials: str = ""

    # ── Gemini API ────────────────────────────────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "text-embedding-004"
    sbert_model: str = "paraphrase-multilingual-MiniLM-L12-v2"
    max_tokens: int = 2000
    temperature: float = 0.7

    # ── Fusion Scoring Weights ────────────────────────────────────────────────
    fusion_weights: Dict[str, float] = {
        "rule_based": 0.30,
        "semantic":   0.45,
        "ml_predict": 0.25,
    }

    # ── SKKNI Skill Category Weights ──────────────────────────────────────────
    skill_category_weights: Dict[str, float] = {
        "hard_skill":    0.40,
        "tool":          0.25,
        "soft_skill":    0.15,
        "certification": 0.15,
        "language":      0.05,
    }

    # ── OCR Settings ──────────────────────────────────────────────────────────
    ocr_min_text_length: int = 50
    max_file_size_mb: int = 10
    pdf_render_zoom: float = 2.0
    tesseract_lang: str = "ind+eng"
    tesseract_config: str = "--psm 6"

    # ── ML Model Settings ─────────────────────────────────────────────────────
    rf_n_estimators: int = 100
    rf_random_state: int = 42
    prophet_forecast_months: int = 6


# Singleton instance
settings = Settings()
