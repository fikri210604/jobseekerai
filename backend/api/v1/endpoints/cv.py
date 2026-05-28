# api/v1/endpoints/cv.py
"""
Controller untuk /api/v1/cv.
Bertanggung jawab untuk Profile Auditor.
"""

import re
from fastapi import APIRouter

from backend.api.v1.schemas.cv import CVAuditRequest, CVAuditResponse, CVAuditSuggestion
from backend.utils.skill_normalizer import SKILL_ALIASES, normalize_skill

router = APIRouter()

@router.post(
    "/audit",
    response_model=CVAuditResponse,
    summary="AI Profile Auditor",
    description="Memeriksa teks CV dan profil untuk memberikan saran perbaikan (Rule-based).",
)
async def audit_cv(request: CVAuditRequest) -> CVAuditResponse:
    suggestions = []
    cv_text = request.cv_text.lower() if request.cv_text else ""
    user_skills = [normalize_skill(s) for s in request.user_skills]
    
    # 1. Missing Links Check
    has_github = "github.com" in cv_text or "gitlab.com" in cv_text
    has_linkedin = "linkedin.com" in cv_text
    
    if not has_github and not has_linkedin:
        suggestions.append(
            CVAuditSuggestion(
                type="missing_link",
                icon="⚠️",
                title="Missing Professional Links",
                description="Kami tidak mendeteksi tautan repositori (GitHub/GitLab) atau LinkedIn di CV Anda. Menambahkan tautan portofolio dapat meningkatkan kredibilitas Anda hingga 40%.",
            )
        )
    elif not has_github:
        # Jika role-nya berbau tech (punya skill tech), sarankan github
        tech_skills = ["python", "javascript", "react", "golang", "java", "sql", "php", "c++", "c#"]
        if any(ts in user_skills for ts in tech_skills):
            suggestions.append(
                CVAuditSuggestion(
                    type="missing_link",
                    icon="⚠️",
                    title="Missing GitHub/GitLab Repository",
                    description="Sebagai profesional di bidang teknologi, mencantumkan tautan GitHub/GitLab sangat disarankan untuk menunjukkan kualitas kode Anda."
                )
            )

    # 2. Text Length Check
    if len(request.cv_text) > 0 and len(request.cv_text) < 200:
        suggestions.append(
            CVAuditSuggestion(
                type="too_short",
                icon="📝",
                title="CV Terlalu Singkat",
                description="Teks deskripsi pengalaman Anda kurang dari 200 karakter. ATS (Applicant Tracking System) biasanya lebih menyukai deskripsi yang mendetail dengan poin-poin pencapaian kuantitatif."
            )
        )

    # 3. Skill Ingestion Check
    # Ekstrak kata-kata dari CV untuk dicocokkan dengan alias
    words_in_cv = set(re.findall(r'\b[a-z0-9+#.-]+\b', cv_text))
    
    found_skills = set()
    for alias, normalized in SKILL_ALIASES.items():
        # Cek exact match jika alias punya spasi, jika satu kata cek di words_in_cv
        if " " in alias:
            if alias in cv_text:
                found_skills.add(normalized)
        else:
            if alias in words_in_cv:
                found_skills.add(normalized)
                
    # Filter skill yang ditemukan tapi belum ada di list user
    missing_in_profile = [s for s in found_skills if s not in user_skills]
    
    # Ambil maksimal 5 skill baru untuk disarankan
    new_skills = missing_in_profile[:5]
    
    if new_skills:
        skill_list_str = ", ".join([s.title() for s in new_skills])
        suggestions.append(
            CVAuditSuggestion(
                type="skill_ingestion",
                icon="💡",
                title="Unlisted Skills Detected",
                description=f"Berdasarkan teks CV Anda, Anda tampaknya memiliki pengalaman dengan '{skill_list_str}' namun belum menambahkannya ke tag keahlian profil Anda.",
                action_data=new_skills
            )
        )
        
    # 4. Impact Verification Check
    # Cek apakah ada angka/persentase di CV (menunjukkan metrik pencapaian)
    has_metrics = bool(re.search(r'\d+%|\d+\s*(juta|ribu|k|m|b)\b', cv_text))
    if len(request.cv_text) > 300 and not has_metrics:
        suggestions.append(
            CVAuditSuggestion(
                type="missing_metrics",
                icon="📈",
                title="Kurang Metrik Kuantitatif",
                description="Pengalaman kerja Anda akan terlihat jauh lebih meyakinkan jika Anda menyertakan hasil yang dapat diukur (misal: 'Meningkatkan konversi sebesar 20%' atau 'Memimpin tim berisi 5 orang')."
            )
        )

    return CVAuditResponse(success=True, suggestions=suggestions)
