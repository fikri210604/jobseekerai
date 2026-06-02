# backend/services/gemini_service.py
"""
Gemini AI Career Advisor Service.
Bertanggung jawab menghasilkan narasi karir, roadmap skill, dan draft cover letter
berdasarkan hasil job matching dari pipeline JobSeeker AI.

Sesuai aturan AGENTS.md:
- Service mengembalikan dict/Pydantic model, BUKAN HTTP response.
- Semua logging menggunakan backend/utils/logger.py.
- Semua secrets dibaca dari backend/core/settings.py.
"""

import json
import urllib.request
import urllib.error
from typing import Any

from backend.core.settings import settings
from backend.utils.logger import logger

# ── Konstanta ─────────────────────────────────────────────────────────────────

GEMINI_ENDPOINT_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent?key={api_key}"
)


# ── Helper: call Gemini REST API ──────────────────────────────────────────────

def _call_gemini(prompt: str) -> dict[str, Any]:
    """
    Memanggil Gemini REST API dan mengembalikan parsed JSON dari teks output.
    Menggunakan urllib bawaan Python agar tidak butuh dependensi tambahan.

    Returns:
        dict hasil JSON yang di-parse dari respons Gemini.

    Raises:
        RuntimeError: jika API key tidak ada, request gagal, atau JSON tidak valid.
    """
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY belum dikonfigurasi di environment.")

    endpoint = GEMINI_ENDPOINT_TEMPLATE.format(
        model=settings.gemini_model,
        api_key=settings.gemini_api_key,
    )

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": settings.temperature,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        logger.error(f"[GeminiService] HTTP {e.code} dari Gemini API: {body}")
        raise RuntimeError(f"Gemini API error {e.code}: {body}") from e
    except urllib.error.URLError as e:
        logger.error(f"[GeminiService] Koneksi ke Gemini gagal: {e.reason}")
        raise RuntimeError(f"Koneksi ke Gemini gagal: {e.reason}") from e

    gemini_data = json.loads(raw)
    raw_text: str = (
        gemini_data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )

    if not raw_text:
        logger.error("[GeminiService] Gemini mengembalikan teks kosong.")
        raise RuntimeError("Gemini mengembalikan respons kosong.")

    # Safety net: strip markdown fences jika ada
    cleaned = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError as e:
        logger.error(f"[GeminiService] Gagal parse JSON dari Gemini: {cleaned[:300]}")
        raise RuntimeError(f"Gagal memparse respons Gemini sebagai JSON: {e}") from e


# ── Helper: build prompt ──────────────────────────────────────────────────────

def _build_advisor_prompt(user_profile: dict, top_results: list[dict]) -> str:
    """
    Membangun prompt lengkap untuk Gemini Career Advisor.
    """
    top2 = top_results[:2]
    top_job = top2[0] if top2 else {}

    jobs_context_lines = []
    for i, r in enumerate(top2, start=1):
        md = r.get("match_details", {})
        skills_needed = r.get("hard_skills", [])[:4]  # Pangkas jadi 4 skill saja
        line = (
            f"{i}. {r.get('title', 'N/A')} di {r.get('company_name', 'N/A')} "
            f"({r.get('confidence_pct', 'N/A')})\n"
            f"   Butuh: {', '.join(skills_needed)}"
        )
        jobs_context_lines.append(line)

    jobs_context = "\n".join(jobs_context_lines)

    # Hitung skill gap ringan
    all_required: set[str] = set()
    all_matched: set[str] = set()
    for r in top2:
        all_required.update(r.get("hard_skills", [])[:4])
        all_matched.update(r.get("match_details", {}).get("skills_matched", []))

    missing_skills = [
        s for s in all_required
        if s.lower() not in {m.lower() for m in all_matched}
    ]

    exp_years = user_profile.get("total_experience_years", user_profile.get("experience_years", 0))
    user_skills = ", ".join(user_profile.get("hard_skills", user_profile.get("skills", [])))
    top_title = top_job.get("title", "posisi target")

    prompt = f"""Kamu adalah AI Career Advisor. Berikan insight singkat & padat.
    
PROFIL: Pengalaman {exp_years} thn, Skills: {user_skills}
TARGET (Top 2 Matching):
{jobs_context}

Output HANYA JSON valid dengan struktur ini:
{{
  "career_narrative": "Narasi profesional maksimal 2 kalimat menjelaskan kenapa kandidat cocok untuk {top_title}.",
  "skill_gaps": [
    {{
      "skill": "nama skill 1 yang kurang",
      "priority": "High",
      "reason": "Alasan singkat (1 kalimat)",
      "resource": "Referensi belajar (misal: Udemy)"
    }}
  ],
  "cover_letter_opening": "1 kalimat pembuka cover letter yang kuat."
}}

ATURAN: Maksimal 2 skill_gaps. Jangan gunakan markdown ` ```json `."""

    return prompt

# ── Public Service Function ───────────────────────────────────────────────────

def generate_career_advice(
    user_profile: dict,
    match_results: list[dict],
) -> dict[str, Any]:
    """
    Entry point utama GeminiService.
    Menerima profil user dan hasil matching, mengembalikan saran karir terstruktur.
    """
    if not match_results:
        raise ValueError("Tidak ada hasil matching untuk dianalisis.")

    logger.info(
        f"[GeminiService] Memulai analisis karir untuk "
        f"{len(match_results)} hasil matching."
    )

    prompt = _build_advisor_prompt(user_profile, match_results)
    advice = _call_gemini(prompt)

    # Validasi struktur minimal
    required_keys = {"career_narrative", "skill_gaps", "cover_letter_opening"}
    if not required_keys.issubset(advice.keys()):
        missing = required_keys - advice.keys()
        raise RuntimeError(f"Respons Gemini tidak lengkap, key yang hilang: {missing}")

    logger.info("[GeminiService] Analisis karir berhasil dihasilkan.")
    return advice
