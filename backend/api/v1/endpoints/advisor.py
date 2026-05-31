# api/v1/endpoints/advisor.py
"""
Controller untuk /api/v1/advisor.
Menerima profil user + hasil matching, memanggil GeminiService,
dan mengembalikan saran karir terstruktur.

Sesuai AGENTS.md: endpoint hanya routing, semua logika ada di services/.
"""

from fastapi import APIRouter, HTTPException

from backend.api.v1.schemas.advisor import AdvisorRequest, AdvisorResponse, CareerAdvice
from backend.services.gemini_service import generate_career_advice
from backend.core.settings import settings
from backend.utils.logger import logger
router = APIRouter()


@router.post(
    "/career",
    response_model=AdvisorResponse,
    summary="AI Career Advisor (Gemini)",
    description=(
        "Hasilkan narasi karir, roadmap skill gap, dan draft cover letter "
        "yang dipersonalisasi berdasarkan profil kandidat dan hasil job matching. "
        "Powered by Google Gemini AI."
    ),
)
async def get_career_advice(request: AdvisorRequest) -> AdvisorResponse:
    """
    POST /api/v1/advisor/career

    - Menerima profil kandidat dan list hasil matching dari /api/v1/match.
    - Memanggil GeminiService untuk menganalisis dan menghasilkan saran.
    - Mengembalikan: career_narrative, skill_gaps (3 item), cover_letter_opening.
    """
    logger.info(
        f"[AdvisorEndpoint] Request diterima: "
        f"{len(request.match_results)} hasil matching."
    )

    try:
        raw_advice = generate_career_advice(
            user_profile=request.user_profile,
            match_results=request.match_results,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error(f"[AdvisorEndpoint] GeminiService error: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini AI tidak dapat memproses permintaan: {str(e)}",
        )
    except Exception as e:
        logger.error(f"[AdvisorEndpoint] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal.")

    return AdvisorResponse(
        success=True,
        model=settings.gemini_model,
        advice=CareerAdvice(**raw_advice),
    )
