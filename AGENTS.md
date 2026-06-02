# AGENTS.md — JobSeeker AI

> File ini ditujukan untuk AI coding agents agar dapat memahami dan bekerja dengan codebase ini secara optimal.
> **Sumber kebenaran arsitektur ada di `README.md`** — baca README sebelum membuat perubahan besar.

---

## 🏗️ Project Overview

JobSeeker AI adalah platform career advisor berbasis AI multi-layer scoring untuk pasar kerja Indonesia.
Stack: **Python 3.11+ (backend)** + **Next.js 16 (frontend)** + **Supabase (database)**.

---

## 📂 Struktur Monorepo (Aktual)

```text
project-akhir/
├── README.md          ← Dokumentasi utama & arsitektur (sumber kebenaran)
├── AGENTS.md          ← File ini
├── Dockerfile         ← Root Dockerfile (belum diisi)
├── docker-compose.yml ← Root Compose (belum diisi)
│
├── backend/           ← ★ CORE AI PIPELINE — seluruh logika kecerdasan
│   ├── api/           ← FastAPI routes & schemas
│   │   ├── dependencies.py
│   │   └── v1/
│   │       ├── api_router.py
│   │       ├── endpoints/     ← API controllers (match, search, jobs, skills)
│   │       └── schemas/       ← Pydantic v2 schemas (kontrak data API)
│   ├── config/        ← Konfigurasi eksternal (Azure client, dll)
│   ├── core/          
│   │   └── settings.py        ← Env vars, model config, bobot scoring
│   ├── prompts/       ← LLM prompt templates
│   ├── rules/         ← Rule-based system & weights (SKKNI)
│   ├── services/      ← Business logic utama
│   │   ├── matcher_service.py ← Hybrid recommendation (ML + Heuristic)
│   │   ├── vector_store.py    ← FAISS + SBERT Semantic Search
│   │   ├── etl_pipeline.py    ← Ekstraksi & normalisasi data pekerjaan
│   │   └── data_indexing.py   ← Build & load index untuk pencarian
│   ├── models/        ← Model ML / Embedder
│   │   ├── embedder.py        ← SBERT singleton wrapper
│   │   └── *.pkl              ← Model machine learning (XGBoost, RF, LogReg)
│   ├── routes/        ← Internal & Legacy routes (deprecated)
│   ├── utils/         ← Helper functions & logging
│   ├── data/          ← Dataset & raw data
│   ├── main.py        ← Entry point FastAPI server
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env           ← Environment variables (JANGAN commit)
│
└── frontend/          ← Next.js 16 (App Router + Tailwind + Sera UI)
    ├── AGENTS.md      ← Instruksi agent khusus frontend
    ├── app/           ← Pages & layouts (App Router)
    ├── components/    ← ui/, shared/, features/
    ├── lib/           ← utils.ts, store.ts (Zustand), api.ts
    └── types/         ← TypeScript interfaces (mirror Pydantic schemas)
```

> ⚠️ **Catatan Penting:** README mendeskripsikan folder `agent/` sebagai core pipeline,
> tetapi implementasi aktual ada di `backend/`. Semua import menggunakan prefix `backend.*`
> (bukan `agent.*`). Jika ada file baru di pipeline, taruh di `backend/`, bukan folder baru.

---

## ⚠️ Critical Rules

1. **NEVER modify `backend/api/v1/schemas/` tanpa update `frontend/types/`** — harus selalu sinkron.
2. **NEVER hardcode API keys** — semua secrets ada di `backend/.env`, dimuat via `backend/core/settings.py`.
3. **NEVER bypass Pydantic validation** — semua data antar modul harus pakai schema dari `backend/api/v1/schemas/`.
4. **ALWAYS normalize skills** via `backend/utils/skill_normalizer.py` sebelum comparison atau scoring.
5. **ALWAYS use absolute imports** dari root package (contoh: `from backend.core.settings import ...`).
6. **ALWAYS log pipeline steps** via `backend/utils/logger.py` untuk observability.
7. **NEVER buat HTTP response di `backend/services/`** — services mengembalikan Pydantic models/dict, bukan HTTP response. HTTP response adalah tugas FastAPI routes di `backend/api/`.

---

## 🤖 LLM & External Services (Aktual)

| Service | Tujuan | Config Key |
|---|---|---|
| **Ollama (Gemma 2B)** | LLM lokal utama: ETL extraction & Enrichment narasi | Tidak perlu key (jalan lokal) |
| SBERT (lokal) | Embeddings: semantic similarity | Tidak perlu key (jalan lokal) |
| Supabase | Database: jobs, users, matches | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| SerpApi | Job scraping: Google Jobs | `SERPAPI_KEY` |
| Google Cloud | Target Deployment Platform | `GOOGLE_CLOUD_PROJECT` (opsional di lokal) |

> ℹ️ **Catatan Penting:** Penggunaan Azure (OCR/NER) dan Claude API telah **dibatalkan/ditunda**. Pengembangan saat ini 100% bergantung pada model lokal (Ollama/Gemma 2B & SBERT) untuk mengurangi biaya API dan mempermudah deployment awal.

---

## 🧩 Pipeline Arsitektur

```text
CV Input (JSON Data / User Profile)
        │
        ▼
[1] Semantic Search       ← backend/services/vector_store.py → search()
    SBERT Similarity via FAISS Index
        │
        ▼
[2] Job Matching          ← backend/services/matcher_service.py → recommend_jobs()
    Hybrid Recommendation (Semantic Search + ML Prediction / Heuristic)
        │
        ▼
[3] Skill Gap Analysis    ← backend/api/v1/endpoints/skills.py → analyze_skill_gap()
    MVP Mock (Menunggu implementasi penuh)
        │
        ▼
JSON Output → FastAPI (backend/api/v1/) → Frontend
```

---

## 📐 Scoring System

### Fusion Weights (Job Matching)
| Layer | Weight | File |
|---|---|---|
| Semantic SBERT cosine | 0.60 | `backend/services/vector_store.py` / `backend/models/embedder.py` |
| ML Prediction (LogReg/RF/XGB) | 0.40 | `backend/services/matcher_service.py` |

> ⚠️ **Catatan Rule-Based System:** Penggunaan `expert_system` dan `skkni_weights` saat ini **DITUNDA**. Scoring hanya menggunakan Semantic + ML.

### Readiness Labels (Skill Gap)
| Score | Label |
|---|---|
| 80–100 | Ready |
| 60–79 | Almost Ready |
| 40–59 | Partially Ready |
| 0–39 | Not Ready |

---

## 🔗 Key Entry Points

### Untuk Backend Development
```python
from backend.api.dependencies import get_matcher, get_vector_store
from backend.services.matcher_service import MatcherService
from backend.services.vector_store import VectorStore
from backend.api.v1.schemas.match import MatchRequest, MatchResponse
from backend.core.settings import settings
```

### Untuk Frontend Development
- Lihat `frontend/AGENTS.md` untuk aturan khusus frontend
- API contract ada di bagian "API Contract" dokumen ini
- TypeScript types di `frontend/types/` harus mirror `backend/api/v1/schemas/`

---

## 🎯 Status Implementasi (Aktual)

| Komponen | Status | Catatan |
|---|---|---|
| `backend/core/settings.py` | ✅ Selesai | Ollama config, Supabase, fusion weights |
| `backend/config/azure_client.py` | ❌ Batal | Azure dibatalkan/ditunda |
| `backend/prompts/` | ✅ Selesai | Prompt templates disesuaikan |
| `backend/rules/*` | ❌ Ditunda | Expert system, SKKNI, Inference Engine ditunda |
| `backend/services/matcher_service.py` | ✅ Selesai | Hybrid Recommendation (ML + Heuristic) |
| `backend/api/v1/endpoints/skills.py` | 🟡 MVP | Gap Analysis belum full LLM enrichment |
| `backend/api/v1/schemas/` | ✅ Selesai | Semua Pydantic v2 schemas per domain |
| `backend/models/embedder.py` | ✅ Selesai | SBERT singleton |
| `backend/utils/logger.py` | ✅ Selesai | PipelineTrace + timed_step |
| `backend/utils/skill_normalizer.py` | ✅ Selesai | 60+ alias mapping |
| `backend/services/vector_store.py` | ✅ Selesai | Semantic Search dengan SBERT + FAISS |
| `backend/services/etl_pipeline.py` | ✅ Selesai | ETL dan Pembersihan Data lowongan |
| `backend/services/data_indexing.py`| ✅ Selesai | Modul pembuatan index pencarian |
| `backend/services/cv_preprocessor.py` | 🔲 Ditunda | Image deskew, denoise, crop (untuk nanti) |
| `backend/services/ocr_engine.py` | 🔲 Ditunda | OCR extraction ditunda |
| `backend/services/skill_extractor.py` | 🔲 Ditunda | NER + LLM parsing ditunda |
| FastAPI routes (`api/v1/`) | ✅ Selesai | Clean Architecture endpoints sudah diimplementasi |
| `frontend/` UI | 🟡 Scaffold | Next.js scaffold ada, belum ada UI nyata |
| `frontend/types/` | 🔲 Belum | TypeScript types belum dibuat |
| `frontend/lib/api.ts` | 🔲 Belum | API client belum dibuat |
| `frontend/lib/store.ts` | 🔲 Belum | Zustand store belum dibuat |
| Docker setup | 🔲 Belum | Dockerfile & docker-compose belum diisi |

---

## 📋 API Contract (Aktual via FastAPI)

```
POST /api/v1/match              → MatchResponse
GET  /api/v1/match/categories   → CategoriesResponse
GET  /api/v1/search             → SearchResponse
GET  /api/v1/search/stats       → StatsResponse
GET  /api/v1/jobs               → JobListResponse
GET  /api/v1/jobs/{job_id}      → JobDetailResponse
POST /api/v1/skills/gap         → SkillGapResponse
GET  /api/v1/skills/trending    → TrendingResponse
GET  /health                    → Health Check & Server Status

# Internal / Legacy
GET  /api/v1/internal/...       → Internal pipelines
POST /api/v1/recommend          → Legacy endpoint (deprecated)
GET  /api/v1/retrieval          → Legacy endpoint (deprecated)
```

---

## 📦 Menambah Fitur Baru (Checklist)

1. [ ] Definisikan Pydantic schema di `backend/models/schemas.py`
2. [ ] Buat prompt template di `backend/prompts/` (jika butuh LLM)
3. [ ] Tambah domain rules di `backend/rules/` (jika ada logika domain)
4. [ ] Buat service orchestrator di `backend/services/`
5. [ ] Expose sebagai FastAPI endpoint di `backend/main.py` (atau `backend/routes/`)
6. [ ] Tambah TypeScript types di `frontend/types/`
7. [ ] Buat UI component di `frontend/components/features/`

---

## 🛠️ Development Commands

```bash
# Backend
cd backend/
pip install -r requirements.txt
python -m backend.utils.logger    # Smoke test logger

# Frontend
cd frontend/
npm install
npm run dev                        # http://localhost:3000
```

---

## 🏗️ Konvensi Kode

- **Python:** `snake_case` fungsi/variabel, `PascalCase` class/schema, absolute imports dari `backend.*`
- **TypeScript:** `camelCase` fungsi, `PascalCase` components/types
- **Error handling:** try-except dengan fallback value — jangan crash pipeline, log error dan lanjut
- **Komentar:** campuran Bahasa Indonesia & English (ikuti gaya file yang ada)
- **Formatter:** Black (Python), ESLint + Prettier (TypeScript)
