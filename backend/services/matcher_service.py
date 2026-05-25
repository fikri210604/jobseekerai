"""
matcher_service.py — Core ML Job Matching Service
===================================================
Memuat data lowongan dari refined_jobs.json dan model ML (.pkl)
untuk menghitung compatibility score antara user dan lowongan kerja.

Dipanggil dari: routes/predictor_router.py

Penggunaan:
    from services.matcher_service import matcher
    matcher.load_resources()
    result = matcher.recommend_jobs(user_profile, top_k=10)
"""

import json
import logging
from pathlib import Path
from typing import Any, ClassVar

import joblib
import numpy as np

logger = logging.getLogger(__name__)

# ── Konstanta ─────────────────────────────────────────────────────────────────

_ROOT_DIR = Path(__file__).resolve().parent.parent

# Batas wajar gaji di Indonesia: Rp 100 juta/bulan.
# Nilai di atas ini dianggap anomali dari scraping dan direset ke 0.
_MAX_REASONABLE_SALARY = 100_000_000

EDU_RANK: dict[str, int] = {
    "SD": 0, "SMP": 1, "SMA": 2, "SMK": 2,
    "D3": 3, "S1": 4, "S2": 5, "S3": 6, "Unknown": 2,
}

# Bobot heuristic scoring (total harus = 1.0)
# category & skill diprioritaskan, salary dikecilkan karena data sering kosong.
_HEURISTIC_WEIGHTS: dict[str, float] = {
    "category": 0.35,
    "skill":    0.40,
    "exp":      0.15,
    "edu":      0.05,
    "salary":   0.05,
}

# Bobot hybrid: ML score vs Heuristic score
_HYBRID_WEIGHTS: dict[str, float] = {
    "ml":        0.40,
    "heuristic": 0.60,
}


# ==============================================================================
# MatcherService — Class Utama
# ==============================================================================

class MatcherService:
    """
    Service untuk mencocokkan profil user dengan lowongan kerja.

    Alur kerja:
        1. load_resources()           → muat data & model ke memori (sekali saat startup)
        2. recommend_jobs()           → entry point rekomendasi utama
        3. get_available_categories() → utilitas eksplorasi dataset
    """

    # ── Default Paths (override via constructor jika perlu) ───────────────────
    DEFAULT_DATA_PATH:  ClassVar[Path] = _ROOT_DIR / "data" / "cleaned" / "refined_jobs.json"
    DEFAULT_MODEL_PATH: ClassVar[Path] = _ROOT_DIR / "models" / "logistic_regression.pkl"

    def __init__(
        self,
        data_path:  Path | str | None = None,
        model_path: Path | str | None = None,
    ) -> None:
        """
        Args:
            data_path:  Path ke refined_jobs.json. Default: DEFAULT_DATA_PATH.
            model_path: Path ke model ML (.pkl). Default: DEFAULT_MODEL_PATH.
                        Set ke None untuk menonaktifkan ML layer (pure heuristic).
        """
        self.data_path:  Path          = Path(data_path)  if data_path  else self.DEFAULT_DATA_PATH
        self.model_path: Path          = Path(model_path) if model_path else self.DEFAULT_MODEL_PATH
        self._jobs:      list[dict]    = []
        self._ml_model:  Any | None    = None

    # ──────────────────────────────────────────────────────────────────────────
    # 1. INISIALISASI & PEMUATAN RESOURCE
    # ──────────────────────────────────────────────────────────────────────────

    def load_resources(self) -> dict:
        """
        Muat data lowongan & model ML dari disk ke memori.
        Dipanggil sekali saat FastAPI startup via lifespan event.

        Returns:
            dict: { jobs_loaded: int, model_loaded: bool }
        """
        self._load_jobs()
        self._load_model()
        return {
            "jobs_loaded":  len(self._jobs),
            "model_loaded": self._ml_model is not None,
        }

    def _load_jobs(self) -> None:
        """Muat data lowongan dari refined_jobs.json ke memori."""
        if not self.data_path.exists():
            logger.error(f"refined_jobs.json tidak ditemukan di: {self.data_path}")
            return

        with open(self.data_path, "r", encoding="utf-8") as f:
            self._jobs = json.load(f)

        logger.info(f"✅ Berhasil memuat {len(self._jobs):,} lowongan dari refined_jobs.json")

    def _load_model(self) -> None:
        """Muat model ML (.pkl) dari disk. Fallback ke heuristic jika gagal."""
        if not self.model_path.exists():
            logger.warning("Model .pkl tidak ditemukan. Menggunakan heuristic scoring.")
            return

        try:
            self._ml_model = joblib.load(self.model_path)
            logger.info("✅ Model ML berhasil dimuat.")
        except Exception as e:
            logger.warning(f"Gagal memuat model ML: {e}. Fallback ke heuristic scoring.")
            self._ml_model = None

    # ──────────────────────────────────────────────────────────────────────────
    # 2. UTILITAS PUBLIK
    # ──────────────────────────────────────────────────────────────────────────

    def get_available_categories(self) -> list[str]:
        """
        Kembalikan daftar unik job_category yang ada di dataset.
        Berguna untuk eksplorasi dan validasi input preferred_category.
        """
        return sorted(
            {j.get("job_category") for j in self._jobs if j.get("job_category")}
        )

    # ──────────────────────────────────────────────────────────────────────────
    # 3. FEATURE ENGINEERING (PRIVATE)
    # ──────────────────────────────────────────────────────────────────────────

    def _calculate_features(self, user: dict, job: dict) -> tuple[float, dict]:
        """
        Hitung fitur numerik kompatibilitas antara satu user dan satu lowongan.

        Returns:
            (heuristic_score: float, features: dict)
        """
        skill_coverage, soft_coverage, skill_overlap, matched_skills = self._score_skills(user, job)
        category_match                              = self._score_category(user, job)
        exp_gap, exp_score                          = self._score_experience(user, job)
        edu_gap, edu_score                          = self._score_education(user, job)
        salary_ratio, salary_score, salary_feasible = self._score_salary(user, job)

        w = _HEURISTIC_WEIGHTS
        heuristic_score = (
            w["category"] * category_match +
            w["skill"]    * skill_coverage  +
            w["exp"]      * exp_score       +
            w["edu"]      * edu_score       +
            w["salary"]   * salary_score
        )

        features = {
            "skill_overlap":        skill_overlap,
            "matched_skills":       matched_skills,           # list[str] nama skill yang cocok
            "skill_coverage":       skill_coverage,
            "soft_skill_coverage":  soft_coverage,
            "n_user_skills":        len([s for s in user.get("hard_skills", []) if s]),
            "category_match":       category_match,
            "exp_gap_raw":          exp_gap,
            "exp_gap_normalized":   float(np.clip(exp_gap / 5.0, -1.0, 1.0)),
            "user_exp_years":       user.get("total_experience_years", 0),
            "edu_gap":              edu_gap,
            "edu_sufficient":       int(edu_gap <= 0),
            "salary_feasible":      int(salary_feasible),
            "salary_ratio":         salary_ratio,
            "is_remote":            int(job.get("work_arrangement", "") == "Remote"),
            "is_junior":            int(job.get("seniority_level", "") in ["Junior", "Entry"]),
            "certifications_count": min(user.get("certifications_count", 0) / 5.0, 1.0),
        }

        return heuristic_score, features

    def _score_skills(self, user: dict, job: dict) -> tuple[float, float, int, list[str]]:
        """Hitung hard skill coverage dan soft skill coverage."""
        user_skills = {s.lower().strip() for s in user.get("hard_skills", []) if s}
        user_soft   = {s.lower().strip() for s in user.get("soft_skills",  []) if s}
        job_skills  = {str(s).lower().strip() for s in job.get("hard_skills", []) if s}
        job_soft    = {str(s).lower().strip() for s in job.get("soft_skills",  []) if s}

        matched_skills = sorted(user_skills & job_skills)
        skill_overlap  = len(matched_skills)
        skill_coverage = skill_overlap / max(len(job_skills), 1)
        soft_coverage  = len(user_soft & job_soft) / max(len(job_soft), 1)

        return skill_coverage, soft_coverage, skill_overlap, matched_skills

    def _score_category(self, user: dict, job: dict) -> int:
        """
        Fuzzy category matching (case-insensitive, partial).
        Contoh: 'Finance' cocok dengan 'Finance & Accounting'.
        """
        u_cat = str(user.get("preferred_category", "")).lower().strip()
        j_cat = str(job.get("job_category",        "")).lower().strip()

        if not u_cat:
            return 1  # Netral jika user tidak memiliki preferensi kategori
        if u_cat == j_cat or u_cat in j_cat or j_cat in u_cat:
            return 1
        return 0

    def _score_experience(self, user: dict, job: dict) -> tuple[float, float]:
        """Hitung exp gap dan exp score menggunakan fungsi eksponensial peluruhan."""
        required_exp = job.get("min_experience_years") or 0
        exp_gap      = user.get("total_experience_years", 0) - required_exp
        exp_score    = float(np.exp(-abs(exp_gap) / 3.0))
        return exp_gap, exp_score

    def _score_education(self, user: dict, job: dict) -> tuple[int, float]:
        """Hitung education gap dan edu score berdasarkan EDU_RANK mapping."""
        user_edu_rank = EDU_RANK.get(user.get("education_level", "SMA"),     2)
        job_edu_rank  = EDU_RANK.get(job.get("education_level",  "Unknown"), 2)
        edu_gap       = job_edu_rank - user_edu_rank
        edu_score     = 1.0 if edu_gap <= 0 else (0.5 if edu_gap == 1 else 0.0)
        return edu_gap, edu_score

    def _score_salary(self, user: dict, job: dict) -> tuple[float, float, bool]:
        """
        Hitung salary ratio dan salary score.
        Outlier gaji (> MAX_REASONABLE_SALARY) direset ke 0 sebelum kalkulasi.
        """
        s_min = min(job.get("salary_min") or 0, _MAX_REASONABLE_SALARY)
        s_max = min(job.get("salary_max") or 0, _MAX_REASONABLE_SALARY)

        job_avg_salary   = (s_min + s_max) / 2 if s_max > 0 else s_min
        preferred_salary = user.get("preferred_salary", 0)

        if job_avg_salary > 0 and preferred_salary > 0:
            salary_ratio    = preferred_salary / job_avg_salary
            salary_score    = float(np.clip(1.0 - abs(1.0 - salary_ratio), 0.0, 1.0))
            salary_feasible = (preferred_salary <= s_max) if s_max > 0 else True
        else:
            salary_ratio    = 1.0
            salary_score    = 0.5   # Netral jika data gaji tidak tersedia
            salary_feasible = True

        return salary_ratio, salary_score, salary_feasible

    # ──────────────────────────────────────────────────────────────────────────
    # 4. ML SCORING (PRIVATE)
    # ──────────────────────────────────────────────────────────────────────────

    def _score_with_ml(self, features: dict) -> float | None:
        """
        Hitung skor menggunakan model ML jika tersedia.
        Fallback ke None jika model tidak ada atau prediksi gagal.
        """
        if self._ml_model is None:
            return None

        try:
            import pandas as pd
            feature_names = (
                list(self._ml_model.feature_names_in_)
                if hasattr(self._ml_model, "feature_names_in_")
                else list(features.keys())
            )
            df = pd.DataFrame([features])[feature_names]
            return float(self._ml_model.predict_proba(df)[0, 1])
        except Exception as e:
            logger.warning(f"ML scoring gagal: {e}. Fallback ke heuristic.")
            return None

    def _compute_final_score(self, heuristic: float, ml_score: float | None) -> tuple[float, str]:
        """
        Gabungkan skor heuristic dan ML menjadi final confidence score.

        Returns:
            (final_score: float, score_method: str)
        """
        if ml_score is not None:
            w      = _HYBRID_WEIGHTS
            score  = w["ml"] * ml_score + w["heuristic"] * heuristic
            method = f"Hybrid ({int(w['ml']*100)}% ML + {int(w['heuristic']*100)}% Heuristic)"
        else:
            score  = heuristic
            method = "Heuristic"

        return score, method

    # ──────────────────────────────────────────────────────────────────────────
    # 5. FORMATTING OUTPUT (PRIVATE)
    # ──────────────────────────────────────────────────────────────────────────

    def _format_salary_display(self, job: dict) -> str | None:
        """
        Bangun string tampilan gaji.
        Prioritas: original_salary_str (string asli Google) → kalkulasi dari min/max.
        """
        if job.get("original_salary_str"):
            return job["original_salary_str"]

        s_min = job.get("salary_min") or 0
        s_max = job.get("salary_max") or 0

        if s_min > 0 and s_max > 0:
            return f"Rp {s_min / 1_000_000:.1f} jt–Rp {s_max / 1_000_000:.1f} jt per bulan"
        if s_min > 0:
            return f"Rp {s_min / 1_000_000:.1f} jt per bulan"

        return None  # Tidak ditampilkan jika tidak ada data gaji

    def _format_job_card(
        self, job: dict, score: float, score_type: str, features: dict, rank: int
    ) -> dict:
        """Format data lowongan menjadi Google Jobs-style card untuk API response."""
        det_ext    = job.get("detected_extensions", {}) or {}
        apply_opts = job.get("apply_options",       []) or []

        return {
            # Metadata skor
            "rank":             rank,
            "confidence_score": round(score, 4),
            "confidence_pct":   f"{score * 100:.1f}%",
            "score_method":     score_type,

            # Info lowongan (Google Jobs format)
            "job_id":           job.get("job_id") or job.get("id") or job.get("source_link", ""),
            "title":            job.get("cleaned_title") or job.get("title", ""),
            "company_name":     job.get("company_name", ""),
            "location":         job.get("location", ""),
            "via":              job.get("via", ""),
            "posted_at":        det_ext.get("posted_at"),
            "salary_display":   self._format_salary_display(job),
            "salary_min":       job.get("salary_min") or 0,
            "salary_max":       job.get("salary_max") or 0,
            "employment_type":  job.get("employment_type") or det_ext.get("schedule_type"),
            "work_arrangement": job.get("work_arrangement"),
            "seniority_level":  job.get("seniority_level"),
            "job_category":     job.get("job_category"),
            "job_subcategory":  job.get("job_subcategory"),
            "min_experience_years": job.get("min_experience_years") or 0,
            "hard_skills":      job.get("hard_skills", []),
            "description":      job.get("description", ""),
            "apply_link":       apply_opts[0].get("link", "") if apply_opts else job.get("source_link", ""),
            "source_link":      job.get("source_link", ""),

            # Detail fitur untuk transparansi/debug
            "match_details": {
                "skill_match_pct": f"{features['skill_coverage'] * 100:.0f}%",
                "skills_matched":  features["matched_skills"],
                "category_match":  bool(features["category_match"]),
                "exp_gap_years":   features["exp_gap_raw"],
                "edu_sufficient":  bool(features["edu_sufficient"]),
                "salary_feasible": bool(features["salary_feasible"]),
            },
        }

    # ──────────────────────────────────────────────────────────────────────────
    # 6. CATEGORY FILTERING (PRIVATE)
    # ──────────────────────────────────────────────────────────────────────────

    def _filter_jobs_by_category(self, target_category: str) -> tuple[list[dict], bool]:
        """
        Filter pool lowongan berdasarkan kategori dengan 3 tahap fallback:
            1. Exact match   → "Technology" == "Technology"
            2. Partial match → "Finance" ⊂ "Finance & Accounting"
            3. No filter     → fallback ke seluruh dataset jika tidak ditemukan

        Returns:
            (jobs_pool: list[dict], category_relaxed: bool)
        """
        tc = target_category.lower().strip()

        # Tahap 1: Exact match
        pool = [j for j in self._jobs if str(j.get("job_category", "")).lower() == tc]
        if pool:
            logger.info(f"Exact match '{target_category}': {len(pool):,} lowongan.")
            return pool, False

        # Tahap 2: Partial match
        pool = [
            j for j in self._jobs
            if tc in str(j.get("job_category", "")).lower()
            or str(j.get("job_category", "")).lower() in tc
        ]
        if pool:
            matched = sorted({j.get("job_category") for j in pool})
            logger.info(f"Partial match '{target_category}' → {matched}: {len(pool):,} lowongan.")
            return pool, False

        # Tahap 3: Fallback ke seluruh dataset
        logger.warning(
            f"Kategori '{target_category}' tidak ditemukan (exact/partial). "
            f"Gunakan GET /api/v1/recommend/categories untuk melihat nama yang valid. "
            f"Fallback ke seluruh {len(self._jobs):,} lowongan."
        )
        return self._jobs, True

    # ──────────────────────────────────────────────────────────────────────────
    # 7. ENTRY POINT UTAMA (PUBLIC)
    # ──────────────────────────────────────────────────────────────────────────

    def recommend_jobs(
        self,
        user_profile:    dict,
        top_k:           int = 10,
        category_filter: str | None = None,
    ) -> dict:
        """
        Rekomendasikan lowongan terbaik untuk profil user.

        Args:
            user_profile:    Profil user (hard_skills, exp, education, salary, dll.)
            top_k:           Jumlah rekomendasi yang dikembalikan (default: 10)
            category_filter: Override filter kategori (opsional)

        Returns:
            dict: { total_jobs_evaluated, recommendations_count, recommendations, ... }
        """
        if not self._jobs:
            return {"error": "Data lowongan belum dimuat. Pastikan load_resources() dipanggil saat startup."}

        # Tentukan pool lowongan (dengan atau tanpa filter kategori)
        target_category = category_filter or user_profile.get("preferred_category")
        if target_category:
            jobs_pool, category_relaxed = self._filter_jobs_by_category(target_category)
        else:
            jobs_pool, category_relaxed = self._jobs, False

        # Scoring semua lowongan dalam pool
        scored: list[tuple[dict, float, str, dict]] = []
        for job in jobs_pool:
            heuristic, features = self._calculate_features(user_profile, job)
            ml_score            = self._score_with_ml(features)
            score, method       = self._compute_final_score(heuristic, ml_score)
            scored.append((job, score, method, features))

        # Sorting dan pengambilan top-K
        scored.sort(key=lambda x: x[1], reverse=True)
        top_results = scored[:top_k]

        recommendations = [
            self._format_job_card(job, score, method, features, rank=i + 1)
            for i, (job, score, method, features) in enumerate(top_results)
        ]

        return {
            "total_jobs_evaluated":  len(jobs_pool),
            "recommendations_count": len(recommendations),
            "score_method":          top_results[0][2] if top_results else "N/A",
            "category_filter_used":  target_category or None,
            "category_relaxed":      category_relaxed,
            "recommendations":       recommendations,
        }


# ==============================================================================
# Singleton & Backward-Compatible Module-Level Functions
# ==============================================================================

#: Instance tunggal yang digunakan seluruh aplikasi.
#: Import ini, bukan class-nya langsung:
#:     from services.matcher_service import matcher
matcher = MatcherService()


def load_resources() -> dict:
    return matcher.load_resources()


def recommend_jobs(user_profile: dict, top_k: int = 10, category_filter: str | None = None) -> dict:
    return matcher.recommend_jobs(user_profile, top_k, category_filter)


def get_available_categories() -> list[str]:
    return matcher.get_available_categories()
