# CLAUDE.md — SkillBridge AI

Baca `AGENTS.md` di root project untuk panduan lengkap arsitektur, rules, dan konvensi.

## Quick Context

- Monorepo: `agent/` (Python AI pipeline) + `backend/` (FastAPI) + `frontend/` (Next.js 16)
- Core logic ada di `agent/services/` — 3 orchestrator: job_matcher, skill_gap, career_predictor
- Scoring: fusion 3-layer (SBERT 0.45 + Expert System 0.30 + ML 0.25)
- Semua schema di `agent/models/schemas.py` — Pydantic v2
- Semua config di `agent/config/settings.py` — jangan hardcode
- Semua prompt LLM di `agent/prompts/` — builder pattern
- Normalisasi skill wajib via `agent/utils/skill_normalizer.py`

## Do NOT

- Jangan edit schema tanpa update TypeScript types di frontend
- Jangan skip Pydantic validation
- Jangan hardcode API keys atau bobot scoring
- Jangan buat HTTP response di `agent/services/` — itu tugas backend
