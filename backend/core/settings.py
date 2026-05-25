# backend/core/settings.py
"""
Konfigurasi global SkillBridge AI menggunakan Pydantic BaseSettings.
Validasi tipe otomatis saat startup.
"""

from typing import Dict, Tuple
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Google Cloud (GCP) ────────────────────────────────────────────────────
    gcp_project_id: str = "your-gcp-project-id"
    gcp_location: str = "us-central1"
    google_application_credentials: str = ""

    # ── Gemini (Vertex AI) ────────────────────────────────────────────────────
    gemini_model: str = "gemini-1.5-flash"
    gemini_embedding_model: str = "text-embedding-004"
    sbert_model: str = "paraphrase-multilingual-MiniLM-L12-v2"
    max_tokens: int = 2000
    temperature: float = 0.1

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
