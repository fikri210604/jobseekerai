# agent/rules/skkni_weights.py
"""
Bobot skill berbasis SKKNI (Standar Kompetensi Kerja Nasional Indonesia).

Nilai multiplier menunjukkan tingkat pentingnya suatu skill di pasar kerja Indonesia.
Sumber: skkni.kemnaker.go.id + analisis demand dari job listing Karirhub & Glints.

Skala multiplier:
  2.0 → skill kritis, sangat tinggi demand
  1.5 → skill penting, demand tinggi
  1.0 → skill standar (default jika tidak terdaftar)
  0.7 → skill pendukung, demand sedang
"""

SKKNI_SKILL_WEIGHTS: dict[str, float] = {

    # ── Programming Languages ──────────────────────────────────────────────────
    "python":          2.0,
    "javascript":      2.0,
    "typescript":      1.8,
    "java":            1.7,
    "kotlin":          1.7,
    "swift":           1.5,
    "go":              1.8,
    "rust":            1.6,
    "php":             1.4,
    "c++":             1.5,
    "c#":              1.5,
    "r":               1.4,
    "sql":             1.9,

    # ── Web & Mobile Development ───────────────────────────────────────────────
    "react":           1.9,
    "next.js":         1.8,
    "vue.js":          1.6,
    "angular":         1.5,
    "react native":    1.7,
    "flutter":         1.8,
    "android":         1.6,
    "ios":             1.5,
    "node.js":         1.7,
    "fastapi":         1.7,
    "django":          1.5,
    "laravel":         1.5,
    "spring boot":     1.6,

    # ── Data & AI/ML ──────────────────────────────────────────────────────────
    "machine learning":      2.0,
    "deep learning":         1.9,
    "natural language processing": 1.9,
    "computer vision":       1.8,
    "tensorflow":            1.7,
    "pytorch":               1.8,
    "scikit-learn":          1.7,
    "pandas":                1.8,
    "numpy":                 1.7,
    "data analysis":         1.9,
    "data visualization":    1.7,
    "tableau":               1.6,
    "power bi":              1.7,
    "apache spark":          1.6,
    "hadoop":                1.4,
    "etl":                   1.6,

    # ── Cloud & DevOps ─────────────────────────────────────────────────────────
    "microsoft azure":       2.0,
    "aws":                   1.9,
    "google cloud":          1.8,
    "docker":                1.9,
    "kubernetes":            1.8,
    "ci/cd":                 1.7,
    "github actions":        1.7,
    "terraform":             1.6,
    "linux":                 1.7,
    "nginx":                 1.5,

    # ── Database ──────────────────────────────────────────────────────────────
    "postgresql":      1.8,
    "mysql":           1.7,
    "mongodb":         1.7,
    "redis":           1.6,
    "elasticsearch":   1.6,
    "supabase":        1.5,
    "firebase":        1.5,

    # ── Design & UX ───────────────────────────────────────────────────────────
    "figma":           1.9,
    "ui/ux design":    1.8,
    "user research":   1.6,
    "prototyping":     1.6,
    "adobe xd":        1.4,
    "canva":           1.2,

    # ── Soft Skills ───────────────────────────────────────────────────────────
    "komunikasi":      1.5,
    "teamwork":        1.4,
    "problem solving": 1.7,
    "critical thinking": 1.6,
    "project management": 1.7,
    "agile":           1.6,
    "scrum":           1.5,
    "kepemimpinan":    1.5,
    "presentasi":      1.4,
    "negosiasi":       1.3,

    # ── Bahasa ────────────────────────────────────────────────────────────────
    "bahasa inggris":  1.8,
    "english":         1.8,
    "bahasa mandarin": 1.4,
    "japanese":        1.3,

    # ── Sertifikasi ───────────────────────────────────────────────────────────
    "aws certified":             2.0,
    "azure certified":           2.0,
    "google professional":       1.9,
    "tensorflow developer":      1.8,
    "pmp":                       1.7,
    "comptia security+":         1.7,
    "bnsp":                      1.6,
    "oracle certified":          1.5,
}


def get_skill_weight(skill_name: str) -> float:
    """
    Ambil bobot SKKNI untuk sebuah skill.
    Normalisasi ke lowercase sebelum lookup.
    Default 1.0 jika skill tidak ditemukan di tabel.
    """
    return SKKNI_SKILL_WEIGHTS.get(skill_name.lower().strip(), 1.0)


def get_top_skills_by_weight(n: int = 20) -> list[dict]:
    """Kembalikan N skill dengan bobot tertinggi — berguna untuk dashboard trend."""
    sorted_skills = sorted(
        SKKNI_SKILL_WEIGHTS.items(),
        key=lambda x: x[1],
        reverse=True
    )
    return [{"skill": k, "weight": v} for k, v in sorted_skills[:n]]
