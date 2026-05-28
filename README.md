# SkillBridge AI — Intelligent Career Advisor & Job Matching Platform

**Deskripsi:** Sistem AI berbasis multi-layer scoring (Semantic Similarity + ML Prediction) yang menganalisis profil pengguna, mencocokkan dengan lowongan kerja, mengidentifikasi skill gap, dan memprediksi trajektori karir — dikhususkan untuk pasar kerja Indonesia.
*(Pengolahan CV dan Rule-Based Expert System dipindahkan ke pengembangan selanjutnya)*
**Mata Kuliah:** Proyek Spesial Data Science — Semester 6

> **Catatan Penting untuk Agent:** README ini adalah **sumber kebenaran arsitektur**. Selalu baca bagian "Status Implementasi" sebelum membuat perubahan.

---

## Arsitektur Tingkat Tinggi

```
┌──────────────┐     ┌─────────────────────────────────────┐     ┌──────────────┐
│   Frontend   │────▶│       FastAPI Backend (Clean Arch)  │────▶│   Supabase   │
│  (Next.js 16)│◀────│  api/v1/endpoints → services       │◀────│  (PostgreSQL)│
│  Port: 3000  │     │  Port: 8000                         │     └──────────────┘
└──────────────┘     └──────────┬──────────────────────────┘
                                 │
                      ┌──────────▼──────────────────────────┐
                      │       Backend AI Pipeline            │
                      │  (services, models, prompts, ML)     │
                      │                                     │
                      │  ┌─────────────────────────────┐    │
                      │  │ matcher_service.py           │    │
                      │  │ (Heuristic + ML fusion)     │    │
                      │  └─────────────────────────────┘    │
                      │  ┌─────────────────────────────┐    │
                      │  │ vector_store.py              │    │
                      │  │ (FAISS + SBERT search)      │    │
                      │  └─────────────────────────────┘    │
                      │  ┌─────────────────────────────┐    │
                      │  │ etl_pipeline.py              │    │
                      │  │ (Data extraction & cleanup) │    │
                      │  └─────────────────────────────┘    │
                      └────────────────────────────────────┘
                                 │
                      ┌──────────▼──────────────────────────┐
                      │     External Services                │
                      │  - Ollama/Gemma 2B (LLM lokal)       │
                      │  - SBERT paraphrase-multilingual     │
                      │  - FAISS (Vector Index lokal)        │
                      │  - SerpApi (Job Data Source)         │
                      │  - Google Cloud (target deployment)  │
                      └─────────────────────────────────────┘
```

---

## Struktur Proyek

```
project-akhir/
├── README.md                  ← (File ini) Dokumentasi utama
├── AGENTS.md                  ← Panduan untuk AI coding agents
├── Dockerfile                 ← Root Dockerfile (belum diisi)
├── docker-compose.yml         ← Root Compose (belum diisi)
│
├── backend/                   ← CORE AI PIPELINE — seluruh logika kecerdasan
│   ├── __init__.py
│   ├── .env                   ← Environment variables (JANGAN commit)
│   ├── main.py                ← Entry point FastAPI server (uvicorn)
│   │
│   ├── api/                   ← FastAPI Clean Architecture
│   │   ├── dependencies.py    ← DI: get_matcher(), get_vector_store()
│   │   └── v1/
│   │       ├── api_router.py  ← Router aggregator
│   │       ├── endpoints/     ← Controllers per domain
│   │       │   ├── match.py   ← POST /match, GET /match/categories
│   │       │   ├── search.py  ← GET /search, /distribution, /stats, /jobs_category
│   │       │   ├── jobs.py    ← GET /jobs, GET /jobs/{id}
│   │       │   ├── skills.py  ← POST /skills/gap, GET /skills/trending
│   │       │   └── cv.py      ← (placeholder, kosong)
│   │       └── schemas/       ← Pydantic v2 schemas per domain
│   │           ├── match.py   ← MatchRequest, MatchResponse, MatchResult, dll
│   │           ├── search.py  ← SearchResponse, StatsResponse, Distribution
│   │           ├── jobs.py    ← JobItem, JobListResponse, JobDetailResponse
│   │           └── skills.py  ← SkillGapRequest/Response, TrendingResponse
│   │
│   ├── core/
│   │   └── settings.py        ← Pydantic BaseSettings (env vars, weights, config)
│   │
│   ├── prompts/               ← LLM prompt templates (untuk Ollama/Gemma 2B)
│   │   ├── system_prompt.py   ← System prompt utama
│   │   ├── cv_parser.py       ← Prompt parsing CV (raw text → structured JSON)
│   │   ├── etl_pipeline.py    ← Prompt ETL extraction (job → skills)
│   │   ├── job_matcher.py     ← Prompt ranking & matching jobs
│   │   ├── skill_gap.py       ← Prompt analisis gap skill per kategori
│   │   └── career_predict.py  ← Prompt prediksi karir & roadmap upskilling
│   │
│   ├── routes/                ← Internal & Legacy routes (deprecated)
│   │   ├── predictor_router.py← POST /recommend (legacy, deprecated)
│   │   ├── retrieval_router.py← GET /retrieval/search (legacy, deprecated)
│   │   └── web.py             ← Internal tools
│   │
│   ├── services/              ← Business logic utama
│   │   ├── matcher_service.py ← Hybrid recommendation (Heuristic + ML fusion)
│   │   ├── vector_store.py    ← FAISS + SBERT Semantic Search
│   │   ├── etl_pipeline.py    ← Ekstraksi & normalisasi data pekerjaan
│   │   ├── data_indexing.py   ← Build & load index untuk pencarian
│   │   ├── evaluation_cells.py← ML evaluation helpers
│   │   ├── scraper_v2.py      ← SerpApi scraper
│   │   ├── etl_learning.ipynb ← Notebook utama ETL pipeline (Ollama)
│   │   ├── data_indexing.ipynb← Notebook ML training (RF vs LogReg vs XGB)
│   │   └── retrieval_pipeline.ipynb ← Notebook Semantic Search (FAISS + SBERT)
│   │
│   ├── models/                ← Model ML / Embedder
│   │   ├── embedder.py        ← SBERT singleton wrapper
│   │   ├── logistic_regression.pkl ← Trained LogReg model
│   │   ├── random_forest.pkl       ← Trained RF model
│   │   └── xgboost.pkl             ← Trained XGBoost model
│   │
│   ├── utils/                 ← Helper functions & logging
│   │   ├── logger.py          ← PipelineTrace + @timed_step decorator
│   │   └── skill_normalizer.py← 60+ alias mapping ("js" → "JavaScript")
│   │
│   ├── data/                  ← Dataset & artifacts
│   │   ├── raw/               ← Data mentah dari SerpApi (google_jobs_results.json ~18MB)
│   │   ├── cleaned/           ← Hasil ekstraksi AI (cleaned_jobs.json)
│   │   ├── refined/           ← refined_jobs.json (siap FAISS)
│   │   ├── vector/            ← FAISS index + job_mapping.json (756 jobs terindex)
│   │   ├── retrieval/         ← Data retrieval pipeline
│   │   ├── scrap/             ← Raw scrap data
│   │   └── fetch/             ← Skrip scraping (serapi_fetch.py)
│   │
│   ├── requirements.txt       ← Dependencies utama
│   ├── requirements_ml.txt    ← Dependencies ML tambahan
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/                  ← Next.js 16 (App Router + Tailwind + Shadcn UI)
    ├── AGENTS.md              ← Instruksi agent untuk frontend
    ├── app/                   ← Pages & layouts (App Router)
    │   ├── page.tsx           ← Landing page (Hero, Search, Categories, Map)
    │   ├── layout.tsx
    │   ├── jobs/[id]/         ← Job detail & SKKNI Radar Chart
    │   ├── predict/           ← Profile form + algorithm config
    │   ├── results/           ← Prediction results dashboard
    │   └── search/            ← Semantic search engine
    ├── components/
    │   ├── ui/                ← Shadcn UI primitives (button, card, badge, dll)
    │   ├── shared/            ← Navbar, layout components
    │   └── features/          ← job-detail/, predict/, results/, search/
    ├── lib/
    │   ├── api.ts             ← Re-export all API modules
    │   ├── api/               ← Axios clients (cv, jobs, matching, prediction, skills)
    │   ├── store.ts           ← Zustand stores (user, results, search, skillGap, career)
    │   ├── utils.ts           ← cn() utility
    │   └── mock-data.ts       ← Mock data for development
    ├── types/
    │   └── index.ts           ← TypeScript interfaces (mirror Pydantic schemas)
    └── DESIGN.md              ← Panduan desain UI
```

---

## Pipeline Alur Data (End-to-End)

```
                        ┌─────────────────────────────┐
                        │  Input: User Profile         │
                        │  (skills, experience, edu,   │
                        │   salary preference, etc.)   │
                        └────────────┬────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────┐
│  STEP 1: SEMANTIC SEARCH (FAISS + SBERT)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  vector_store.search()              backend/services/vector_   │ │
│  │  - Encode query dengan SBERT        store.py                   │ │
│  │  - FAISS similarity search (cosine)                            │ │
│  │  - Return top-K candidates (default: 50)                       │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
│                              ▼                                     │
│  Output: list[dict] ranked by cosine similarity                    │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────┐
│  STEP 2: JOB MATCHING (Hybrid Fusion)                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  matcher_service.recommend_jobs()  backend/services/matcher_   │ │
│  │                                                                 │ │
│  │  ┌──────────────────┐  ┌─────────────────┐                     │ │
│  │  │  Layer 1:         │  │  Layer 2:       │                     │ │
│  │  │  Heuristic Scoring│  │  ML Prediction  │                     │ │
│  │  │  (category,skill, │  │  (LogReg/RF/    │                     │ │
│  │  │   exp, edu, salary│  │   XGBoost)      │                     │ │
│  │  │   weights: 0.60)  │  │   weight: 0.40  │                     │ │
│  │  └────────┬─────────┘  └────────┬────────┘                     │ │
│  │           └──────────┬──────────┘                               │ │
│  │                      ▼                                          │ │
│  │              ┌──────────────┐                                   │ │
│  │              │ Fusion Score │                                   │ │
│  │              └──────┬───────┘                                   │ │
│  └─────────────────────┼──────────────────────────────────────────┘ │
│                        ▼                                           │
│  Output: MatchResponse (top-K recommendations + score breakdown)   │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────┐
│  STEP 3: SKILL GAP ANALYSIS (MVP Mock)                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  POST /api/v1/skills/gap          backend/api/v1/endpoints/    │ │
│  │                                     skills.py                  │ │
│  │  - Membandingkan skill user vs required skills dari lowongan   │ │
│  │  - Readiness score (0–100) + label (Ready/Almost/Partial/Not) │ │
│  │  - Gap summary (MVP: mock response, menunggu LLM enrichment)  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Output: SkillGapResponse (readiness_score, matched/missing skills) │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Reference (untuk Backend)

### `backend/core/settings.py`
**Peran:** Single source of truth untuk semua konfigurasi (Pydantic BaseSettings).

| Variabel | Nilai Default | Keterangan |
|---|---|---|
| `sbert_model` | `paraphrase-multilingual-MiniLM-L12-v2` | SBERT multilingual (EN+ID) |
| `fusion_weights` | `rule_based: 0.30, semantic: 0.45, ml_predict: 0.25` | Bobot 3-layer scoring |
| `skill_category_weights` | `hard_skill: 0.40, tool: 0.25, ...` | Bobot per kategori skill |
| `max_tokens` | `2000` | Maks token per LLM response |
| `temperature` | `0.1` | Rendah = deterministik |
| `cors_origins` | `http://localhost:3000,...` | Origin yang diizinkan CORS |

> **Catatan Fusion:** Nilai di `settings.py` adalah konfigurasi global. Implementasi aktual di `matcher_service.py` menggunakan `_HYBRID_WEIGHTS = {"ml": 0.40, "heuristic": 0.60}`.

### `backend/prompts/` (6 files)
**Peran:** Template prompt untuk Ollama/Gemma 2B — setiap file memiliki string template + `build_*_prompt()` function.

| File | Prompt Constant | Builder Function | Input |
|---|---|---|---|
| `system_prompt.py` | `SYSTEM_PROMPT` | — (dipakai langsung) | — |
| `cv_parser.py` | `CV_PARSE_PROMPT` | `build_cv_parse_prompt(raw_text)` | Raw OCR text |
| `etl_pipeline.py` | `ETL_EXTRACTION_PROMPT` | `build_etl_extraction_prompt(title, company, desc)` | Job raw text → skills |
| `job_matcher.py` | `JOB_MATCH_PROMPT` | `build_job_match_prompt(profile, jobs, top_n)` | User profile + jobs list |
| `skill_gap.py` | `SKILL_GAP_PROMPT` | `build_skill_gap_prompt(profile, job)` | User profile + 1 target job |
| `career_predict.py` | `CAREER_PREDICT_PROMPT` | `build_career_predict_prompt(profile, ml_pred, trends)` | Profile + ML output + trends |

### `backend/services/` (4 core services)
**Peran:** Business logic utama — menggabungkan heuristic + ML + LLM.

**`matcher_service.py` → `MatcherService`:**
```python
matcher = MatcherService()
matcher.load_resources()                    # Muat refined_jobs.json + model .pkl
matcher.recommend_jobs(user_profile,        # Entry point utama
    top_k=10, category_filter=None)         # → MatchResponse dict
matcher.get_available_categories()          # → list[str]
```
- Heuristic scoring: category (35%) + skill (40%) + exp (15%) + edu (5%) + salary (5%)
- ML fusion: `0.40 * ml_score + 0.60 * heuristic_score`

**`vector_store.py` → `VectorStore`:**
```python
vector_store = VectorStore()
vector_store.load_index()                   # Muat FAISS index dari disk
vector_store.search(query_text,             # Semantic search
    top_k=10, threshold=0.3)                # → list[dict]
vector_store.get_index_stats()              # → stats dict
vector_store.get_job_distribution()         # → sebaran provinsi
vector_store.get_job_category_distribution() # → sebaran kategori
```

**`etl_pipeline.py`:**
- `extract_jobs_from_serpapi()` — Ambil data dari SerpApi Google Jobs
- `process_with_ai()` — Ekstraksi menggunakan Ollama/Gemma 2B
- `refine_job_data()` — Post-processing (salary normalisasi, skill dedup)

**`data_indexing.py`:**
- `build_faiss_index()` — Buat FAISS index dari refined_jobs.json
- `load_faiss_index()` / `save_faiss_index()` — Persistensi index

### `backend/api/v1/schemas/` (Pydantic v2 per domain)
**Peran:** Kontrak data untuk setiap endpoint — **sumber kebenaran tipe data API**.

| File | Schema Utama | Endpoint |
|---|---|---|
| `match.py` | `MatchProfileInput`, `MatchRequest`, `MatchResult`, `MatchResponse`, `CategoriesResponse` | `POST /api/v1/match` |
| `search.py` | `SearchResult`, `SearchResponse`, `StatsResponse`, `JobDistributionResponse`, `JobCategoryDistributionResponse` | `GET /api/v1/search` |
| `jobs.py` | `JobItem`, `JobListResponse`, `JobDetailResponse` | `GET /api/v1/jobs` |
| `skills.py` | `SkillGapRequest`, `SkillGapData`, `SkillGapResponse`, `TrendingSkillItem`, `TrendingResponse` | `POST /api/v1/skills/gap` |

### `backend/models/embedder.py`
> **Status:** Tersedia (SBERT singleton), tetapi belum diintegrasikan penuh ke pipeline runtime. Vector search saat ini menggunakan VectorStore yang memuat embedding dari FAISS index yang sudah pre-computed.

### `backend/utils/`
**`logger.py`:**
- `PipelineTrace` class — track timing per step
- `@timed_step()` decorator — otomatis log durasi
- `log_pipeline_error()`, `log_ai_call()` — structured logging

**`skill_normalizer.py`:**
- `normalize_skill("js")` → `"JavaScript"`
- `normalize_skill_list(skills)` → deduplicated + normalized
- 100+ alias mapping (EN ↔ ID, singkatan → full name)

---

## Environment Variables

```bash
# === CORS ===
cors_origins=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000

# === Google Cloud (target deployment) ===
gcp_project_id=your-gcp-project-id
gcp_location=us-central1
google_application_credentials=

# === Ollama (local LLM) ===
# Tidak perlu key, pastikan Ollama berjalan di localhost:11434
```

---

## Quick Start

### Backend (AI Pipeline + API)
```bash
cd backend/
pip install -r requirements.txt        # Install dependencies
python -m uvicorn main:app --reload    # http://localhost:8000
python -m backend.utils.logger         # Smoke test logger
```

### Frontend
```bash
cd frontend/
npm install
npm run dev                            # http://localhost:3000
```

---

## Panduan untuk Agent / AI Coding Assistant

### Prinsip Arsitektur
1. **Separation of Concerns:** `backend/services/` adalah domain logic murni, `backend/api/v1/endpoints/` adalah controllers (HTTP layer). Services mengembalikan dict/Pydantic, BUKAN HTTP response.
2. **LLM digunakan untuk enrichment, bukan logic inti.** Kalkulasi scoring (fusion, gap, readiness) dilakukan oleh heuristic/ML terlebih dahulu.
3. **Semua data flow mengikuti Pydantic schema** di `backend/api/v1/schemas/` — ini adalah kontrak yang harus dihormati. Frontend types di `frontend/types/` harus mirror schema ini.
4. **Jangan gunakan `backend/models/` untuk schemas** — folder itu untuk ML model files (.pkl) dan embedder.

### Saat Menambah Fitur Baru
1. **Definisikan schema dulu** di `backend/api/v1/schemas/`
2. **Buat prompt** (jika perlu LLM) di `backend/prompts/`
3. **Buat service orchestrator** di `backend/services/`
4. **Buat controller** di `backend/api/v1/endpoints/`
5. **Daftarkan router** di `backend/api/v1/api_router.py`
6. **Update TypeScript types** di `frontend/types/index.ts`
7. **Buat UI component** di `frontend/components/features/`

### Status Implementasi

| Komponen | Status | Catatan |
|---|---|---|
| `backend/core/settings.py` | ✅ Selesai | Pydantic BaseSettings, weights, LLM config |
| `backend/prompts/` | ✅ Selesai | 6 file prompt untuk Gemma 2B |
| `backend/rules/*` | ❌ Ditunda | Expert system, SKKNI, Inference Engine |
| `backend/services/matcher_service.py` | ✅ Selesai | Hybrid: Heuristic (60%) + ML (40%) |
| `backend/services/vector_store.py` | ✅ Selesai | Semantic Search FAISS + SBERT |
| `backend/services/etl_pipeline.py` | ✅ Selesai | ETL dari SerpApi → refined_jobs.json |
| `backend/services/data_indexing.py` | ✅ Selesai | Build/Load FAISS index |
| `backend/models/embedder.py` | ✅ Selesai | SBERT singleton wrapper |
| `backend/models/*.pkl` | ✅ Selesai | 3 models: RF, LogReg, XGBoost |
| `backend/utils/logger.py` | ✅ Selesai | PipelineTrace + timed_step |
| `backend/utils/skill_normalizer.py` | ✅ Selesai | 100+ alias mapping |
| `backend/api/v1/endpoints/` | ✅ Selesai | match, search, jobs, skills endpoints |
| `backend/api/v1/schemas/` | ✅ Selesai | Pydantic v2 per domain |
| `backend/data/raw/` | ✅ Selesai | ~4.911 raw job listings (18MB JSON) |
| `backend/data/cleaned/` | ✅ Selesai | Hasil ETL incremental (Ollama) |
| `backend/data/refined/` | ✅ Selesai | refined_jobs.json (siap FAISS) |
| `backend/data/vector/` | ✅ Selesai | FAISS index (756 jobs ter-index) |
| `frontend/` Landing Page | ✅ Selesai | Hero, search bar, map, charts, dll |
| `frontend/store.ts` | ✅ Selesai | Zustand: user, results, search, skillGap, career |
| `frontend/api.ts` | ✅ Selesai | Axios clients untuk semua endpoint |
| `frontend/types/` | ✅ Selesai | TypeScript interfaces mirror Pydantic |
| `frontend/app/predict/` | 🟡 Scaffold | Form profile + algorithm config |
| `frontend/app/results/` | 🟡 Scaffold | Dashboard hasil prediksi |
| `frontend/app/search/` | 🟡 Scaffold | Semantic search engine |
| `frontend/app/jobs/[id]/` | 🟡 Scaffold | Job detail + SKKNI Radar Chart |
| Docker setup | 🔲 Belum | Dockerfile & docker-compose belum diisi |
| Supabase integration | 🔲 Belum | Config ada, koneksi runtime belum aktif |
| ML Training (synthetic labeling) | 🟡 Sedang Berjalan | RF vs LogReg vs XGB EDA + evaluation |

### Services yang Ditunda
- `backend/services/cv_preprocessor.py` — Image preprocessing (CV OCR)
- `backend/services/ocr_engine.py` — OCR extraction (dibatalkan)
- `backend/services/skill_extractor.py` — NER + LLM parsing dari raw text
- `backend/rules/*` — Rule-based expert system + SKKNI weights

### Dependensi Utama
| Package | Versi | Peran |
|---|---|---|
| `ollama` | latest | LLM lokal (Gemma 2B) |
| `sentence-transformers` | 3.3.1 | SBERT embeddings (multilingual) |
| `scikit-learn` | 1.6.0 | ML models (RF, LogReg) |
| `pydantic` | 2.10.3 | Data validation |
| `fastapi` | 0.115.5 | Web framework |
| `faiss-cpu` | 1.9.0 | Vector similarity search |
| `supabase` | latest | Database client |
| `joblib` | latest | Model serialization (.pkl) |

---

## API Contract (Aktual via FastAPI)

```
# Matching
POST /api/v1/match                    → MatchResponse
  Body: { parsed_cv: MatchProfileInput, category_filter?: string }
  Query: ?limit=10
GET  /api/v1/match/categories         → CategoriesResponse

# Semantic Search
GET  /api/v1/search                   → SearchResponse
  Query: ?q=...&limit=10&threshold=0.3
GET  /api/v1/search/distribution      → JobDistributionResponse
GET  /api/v1/search/stats             → StatsResponse
GET  /api/v1/search/jobs_category     → JobCategoryDistributionResponse

# Jobs
GET  /api/v1/jobs                     → JobListResponse
  Query: ?limit=10&offset=0
GET  /api/v1/jobs/{job_id}            → JobDetailResponse

# Skills
POST /api/v1/skills/gap               → SkillGapResponse
  Body: { job_id: string, user_skills: string[] }
GET  /api/v1/skills/trending          → TrendingResponse

# Health
GET  /                                → Server status
GET  /health                          → Health check with stats

# Legacy (deprecated — backward compatibility)
POST /api/v1/recommend                → Predictor response (legacy)
GET  /api/v1/retrieval/search         → Retrieval response (legacy)
```

---

## Konvensi Kode

- **Bahasa kode:** Python 3.11+ (backend), TypeScript (frontend)
- **Bahasa komentar/docstring:** Campuran Bahasa Indonesia & English
- **Formatter:** Black (Python), ESLint + Prettier (TS)
- **Import style:** Absolute imports dari root package (`from backend.core.settings import ...`, `from backend.services.matcher_service import ...`)
- **Naming:** Python: `snake_case` fungsi/variabel, `PascalCase` class/schema. TypeScript: `camelCase` fungsi, `PascalCase` components/types
- **Error handling:** Try-except dengan fallback value — jangan crash pipeline, log error dan lanjut

---

## ETL Pipeline & Runtime (Implementasi Aktual)

### Pipeline 1: Data Ingestion & AI Extraction (Lokal, Offline)

Dijalankan di `backend/services/etl_learning.ipynb`. Stack: **Ollama (Gemma 2B)** — model LLM lokal tanpa biaya API.

```text
┌─────────────────┐    ┌──────────────────────────────┐    ┌──────────────────────────┐
│ data/raw/       │    │ ETL Stage 1: AI Extraction   │    │ data/cleaned/            │
│ google_jobs_    │───▶│ (Ollama/Gemma 2B)            │───▶│ cleaned_jobs.json        │
│ results.json    │    │ - is_potential_job() filter  │    │ (incremental, resumable) │
│ (~4.911 jobs)   │    │ - build_prompt() one-shot    │    └─────────────┬────────────┘
└─────────────────┘    │ - process_with_ai() async    │                  │
                       └──────────────────────────────┘                  ▼
                       ┌──────────────────────────────┐    ┌──────────────────────────┐
                       │ ETL Stage 2: Refinement      │    │ data/refined/            │
                       │ (Pure Python — tanpa AI)     │───▶│ refined_jobs.json        │
                       │ - Salary normalization       │    │ (siap untuk FAISS)       │
                       │ - Skills deduplication       │    └─────────────┬────────────┘
                       │ - Employment type fix        │                  │
                       └──────────────────────────────┘                  ▼
                                                           ┌──────────────────────────┐
                                                           │ data/vector/             │
                                                           │ faiss_index.bin          │
                                                           │ job_mapping.json         │
                                                           │ (756 jobs ter-index)     │
                                                           └──────────────────────────┘
```

### Detail ETL: Schema Data Output (`refined_jobs.json`)

| Field | Tipe | Keterangan |
|---|---|---|
| `is_valid_job` | bool | False = spam, dibuang di refinement |
| `hard_skills` | list[str] | Tools, bahasa pemrograman, keahlian teknis |
| `soft_skills` | list[str] | Karakter/sikap kerja (maks 3) |
| `education_level` | str\|null | SD/SMP/SMA/SMK/D3/S1/S2/S3 |
| `min_experience_years` | int | Tahun pengalaman minimum |
| `certifications` | list[str] | Sertifikat/lisensi |
| `job_category` | str | 1 dari 14 kategori standar |
| `job_subcategory` | str | Subkategori bebas |
| `seniority_level` | str | Entry/Junior/Mid/Senior/Lead/Manager |
| `work_arrangement` | str | Onsite/Remote/Hybrid |
| `employment_type` | str | Full-time/Part-time/Contract/Internship/Freelance |
| `salary_min` / `salary_max` | int | Gaji per bulan dalam IDR (0 jika tidak diketahui) |
| `original_salary_str` | str\|null | String gaji asli untuk transparansi UI |
| `cleaned_title` | str | Judul tanpa noise |

> **Catatan — Normalisasi Gaji:** `salary_min` & `salary_max` selalu dalam IDR/bulan. Gaji harian ×22, mingguan ×4, per jam ×160.

### Pipeline 2: Runtime (FastAPI + FAISS + MatcherService)

Dijalankan per request saat user berinteraksi.

```text
[User mengirim profile via API]
        │
        ▼
1. POST /api/v1/match
   → matcher_service.recommend_jobs()
        │
        ├── Heuristic scoring (category, skill, exp, edu, salary)
        ├── ML scoring (LogReg / RF / XGB — jika model tersedia)
        └── Fusion: 40% ML + 60% Heuristic
        │
        ▼
2. Top-K recommendations + score breakdown
        │
        ▼
3. GET /api/v1/search?q=...
   → vector_store.search() (FAISS semantic search)
        │
        ▼
4. POST /api/v1/skills/gap
   → Skill gap analysis (MVP mock)
```

---

## Phased Implementation Roadmap

### Phase 1 — Data Ingestion, ETL & Semantic Retrieval
- [x] 1.1 Scraping data lowongan mentah via SerpApi (~4.911 jobs)
- [x] 1.2 ETL extraction notebook (`etl_learning.ipynb`) dengan Ollama/Gemma 2B
- [x] 1.3 Post-processing `refine_job_data()` (salary normalization, skill dedup)
- [x] 1.4 Semantic Retrieval & FAISS indexing (`retrieval_pipeline.ipynb`)
- [x] 1.5 Data Indexing & ML Training pipeline (`data_indexing.ipynb`): 756 jobs ter-index FAISS
- [x] 1.6 Model ML tersimpan (.pkl): RF, LogReg, XGBoost
- [ ] 1.7 Evaluasi model selesai (K-Fold, F1, Confusion Matrix) — **sedang berjalan**

### Phase 2 — ML Modelling & Backend API (FastAPI)
- [x] 2.1 FastAPI routes implemented (match, search, jobs, skills — di `api/v1/`)
- [x] 2.2 Service layer implemented (matcher_service, vector_store, etl_pipeline)
- [x] 2.3 Pydantic schemas per domain (`api/v1/schemas/`)
- [x] 2.4 Health check & CORS middleware
- [x] 2.5 Async logging via `backend/utils/logger.py`
- [ ] 2.6 Full LLM enrichment untuk skill gap (masih MVP mock)
- [ ] 2.7 Persiapan Deployment ke Google Cloud Platform

### Phase 3 — Frontend Integration & UI/UX
- [x] 3.1 Landing page (Hero, search bar, map, category chart)
- [x] 3.2 Zustand stores (user, results, search, skillGap, career)
- [x] 3.3 API client (Axios) untuk semua endpoint
- [x] 3.4 TypeScript types mirror Pydantic schemas
- [ ] 3.5 Form predict page fully functional
- [ ] 3.6 Results dashboard with real data
- [ ] 3.7 Job detail + SKKNI Radar Chart integration

### Phase 4 — Pengembangan Selanjutnya (Ditunda)
- Full LLM enrichment (Gemma 2B) untuk skill gap narrative & career prediction
- Rule-based Expert System (SKKNI weights, hard/soft rules)
- CV Parsing (Image OCR, Azure Doc Intelligence — dibatalkan, alternatif lokal)
- Docker setup & deployment automation

---

## Known Issues & Decisions

| Issue | Keputusan | Alasan |
|---|---|---|
| Gemma 2B halusinasi nilai salary | `salary=0` jika tidak eksplisit; regex fallback di refinement | Model kecil sering mengarang angka |
| Gaji per hari vs per bulan tidak konsisten | Konversi ke IDR/bulan (×22/×4/×160); simpan `original_salary_str` | Unit inconsistency merusak ML scoring |
| Gemma 2B looping output | `temperature=0`, `num_predict=400`, try-except di `process_with_ai()` | Mencegah infinite generation |
| Data duplikat saat resume ETL | `job_id` set untuk skip yang sudah ada | Proses bisa diinterrupt & dilanjutkan |
| `soft_skills` > 3 item | Filter `len(s.split()) <= 3` di refinement | Prompt `max3` kadang dilanggar model |
| `job_subcategory` kadang list | `to_str()` di `build_job_text()` handle list & string | Output Gemma 2B tidak konsisten |
| Data ML hanya 756 baris | **5-Fold Cross Validation** | Mitigasi data kecil tanpa scraping ulang |
| 3 models tersimpan (RF, LogReg, XGB) | Default: `logistic_regression.pkl` (di `matcher_service.py`) | XGB too complex for 756 rows; RF for presentation; LogReg for baseline |
| Fusion weights di settings.py vs matcher_service.py tidak sinkron | `settings.py` = 3-layer (0.30/0.45/0.25), `matcher_service.py` = 2-layer (0.40/0.60) | Settings.py adalah konfigurasi global yang belum dipakai; matcher_service.py adalah implementasi aktual |
| Skill gap analysis masih MVP mock | `POST /api/v1/skills/gap` return data hardcoded | Menunggu integrasi Gemma 2B untuk enrichment penuh |
| Frontend mock data tidak akurat | "124,502 jobs", "94.8% match rate" adalah placeholder | Belum diupdate sesuai data aktual (756 jobs) |
