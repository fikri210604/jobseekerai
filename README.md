# JobSeeker AI — Intelligent Career Advisor & Job Matching Platform

**Mata Kuliah:** Proyek Spesial Data Science — Semester 6  
**Stack:** Python 3.11+ · FastAPI · Next.js 16 · Google Gemini 2.5 Flash · SBERT · Scikit-learn

> **Catatan untuk AI Coding Agent:** README ini adalah **sumber kebenaran arsitektur**. Baca seluruh dokumen sebelum membuat perubahan apapun pada codebase.

---

## Latar Belakang

Pasar kerja Indonesia terus berkembang dengan cepat seiring dengan transformasi digital yang masif di berbagai sektor industri. Di satu sisi, terdapat jutaan pencari kerja yang kesulitan menemukan lowongan yang sesuai dengan kompetensi dan latar belakang mereka. Di sisi lain, perusahaan menghadapi tantangan dalam menemukan kandidat yang benar-benar *qualified* di antara ribuan pelamar.

Platform pencari kerja konvensional umumnya mengandalkan pencarian berbasis kata kunci yang tidak mampu memahami konteks dan semantik dari profil pengguna maupun deskripsi pekerjaan. Akibatnya, kandidat yang relevan kerap tidak terdeteksi, dan pencari kerja mendapatkan rekomendasi yang tidak akurat.

**JobSeeker AI** hadir sebagai solusi berbasis kecerdasan buatan yang mengintegrasikan *semantic understanding*, *machine learning*, dan *generative AI* untuk memberikan rekomendasi pekerjaan yang personal, akurat, dan kontekstual — khususnya untuk pasar kerja Indonesia.

---

## Rumusan Masalah

1. Bagaimana membangun sistem rekomendasi pekerjaan yang mampu memahami kesesuaian antara profil pencari kerja dan deskripsi lowongan secara semantik, bukan hanya berbasis kata kunci?
2. Bagaimana mengintegrasikan pendekatan *heuristic scoring* dan *machine learning prediction* dalam satu pipeline hybrid untuk menghasilkan skor kecocokan yang lebih akurat dan dapat dijelaskan?
3. Bagaimana memanfaatkan *large language model* (LLM) untuk menghasilkan saran karir yang dipersonalisasi, termasuk identifikasi *skill gap*, *career roadmap*, dan *cover letter* secara otomatis?

---

## Tujuan

1. Membangun pipeline **Sistem Rekomendasi Pekerjaan** berbasis hybrid scoring (Semantic Similarity + ML Prediction) yang dapat mencocokkan profil pencari kerja dengan lowongan yang relevan.
2. Membangun pipeline **Semantic Retrieval Search** menggunakan SBERT dan representasi vektor untuk pencarian lowongan berbasis makna, bukan hanya kecocokan kata kunci.
3. Mengintegrasikan **Google Gemini 2.5 Flash** sebagai AI Career Advisor yang mampu menghasilkan narasi karir, analisis skill gap, dan saran pengembangan diri secara otomatis.
4. Menyediakan REST API (FastAPI) dan antarmuka web (Next.js) yang fungsional sebagai media interaksi pengguna dengan seluruh pipeline AI.

---

## Manfaat

| Pihak | Manfaat |
|---|---|
| **Pencari Kerja** | Mendapatkan rekomendasi lowongan yang relevan berdasarkan profil lengkap, bukan sekadar kata kunci; mengetahui skill gap dan langkah konkret untuk menutupnya |
| **Pengembang / Peneliti** | Referensi implementasi pipeline hybrid AI (heuristic + ML + LLM) untuk domain job matching di konteks Indonesia |
| **Akademik** | Demonstrasi penerapan Data Science end-to-end: scraping → ETL → embedding → ML modelling → deployment API → UI |

---

## Teknologi yang Digunakan

### Backend & AI Pipeline

| Teknologi | Versi | Peran |
|---|---|---|
| **Python** | 3.11+ | Bahasa utama backend & pipeline |
| **FastAPI** | 0.115.5 | Web framework REST API (Clean Architecture) |
| **Pydantic** | 2.10.3 | Data validation & schema kontrak |
| **SBERT** (`paraphrase-multilingual-MiniLM-L12-v2`) | sentence-transformers 3.3.1 | Multilingual semantic embeddings (EN + ID) |
| **NumPy** | latest | Cosine similarity & embedding storage (`.npy`) |
| **Scikit-learn** | 1.6.0 | ML models: Logistic Regression, Random Forest |
| **XGBoost** | latest | ML model tambahan untuk hybrid scoring |
| **Ollama / Gemma 2B** | latest | LLM lokal untuk ETL extraction (offline) |
| **Google Gemini 2.5 Flash** | via API | Generative AI Career Advisor (online) |
| **SerpApi** | latest | Scraping data lowongan dari Google Jobs |
| **Joblib** | latest | Serialisasi model ML (`.pkl`) |
| **Uvicorn** | latest | ASGI server untuk FastAPI |

### Frontend

| Teknologi | Versi | Peran |
|---|---|---|
| **Next.js** | 16 (App Router) | Framework UI React |
| **TypeScript** | latest | Type-safe frontend development |
| **Tailwind CSS** | latest | Utility-first styling |
| **Shadcn UI** | latest | Komponen UI primitif |
| **Zustand** | latest | State management |
| **Axios** | latest | HTTP client untuk komunikasi ke API |

### Infrastruktur & Deployment

| Teknologi | Peran |
|---|---|
| **Google Cloud Run** | Deployment backend & frontend (asia-southeast2) |
| **Docker** | Kontainerisasi aplikasi |

---

## Arsitektur Tingkat Tinggi

```
┌──────────────┐     ┌─────────────────────────────────────┐
│   Frontend   │────▶│       FastAPI Backend (Clean Arch)  │
│  (Next.js 16)│◀────│  api/v1/endpoints → services        │
│  Cloud Run   │     │  Cloud Run (asia-southeast2)        │
└──────────────┘     └──────────┬──────────────────────────┘
                                 │
                      ┌──────────▼──────────────────────────┐
                      │       Backend AI Pipeline            │
                      │  (services, models, prompts, ML)     │
                      │                                     │
                      │  ┌─────────────────────────────┐    │
                      │  │ matcher_service.py           │    │
                      │  │ (Heuristic 60% + ML 40%)    │    │
                      │  └─────────────────────────────┘    │
                      │  ┌─────────────────────────────┐    │
                      │  │ vector_store.py              │    │
                      │  │ (NumPy + SBERT search)      │    │
                      │  └─────────────────────────────┘    │
                      │  ┌─────────────────────────────┐    │
                      │  │ gemini_service.py            │    │
                      │  │ (Career Advisor via Gemini) │    │
                      │  └─────────────────────────────┘    │
                      └────────────────────────────────────┘
                                 │
                      ┌──────────▼──────────────────────────┐
                      │     External Services                │
                      │  - Google Gemini 2.5 Flash (AI LLM) │
                      │  - SBERT paraphrase-multilingual     │
                      │  - NumPy Embeddings (.npy cache)     │
                      │  - SerpApi (Job Data Source)         │
                      │  - Google Cloud Run (deployment)     │
                      └─────────────────────────────────────┘
```

---

## Pipeline Sistem

Sistem ini memiliki **dua pipeline utama** yang bekerja secara komplementer.

### Pipeline 1 — Sistem Rekomendasi Pekerjaan (Hybrid Scoring)

Pipeline ini menerima profil pengguna dan menghasilkan daftar lowongan paling relevan melalui proses hybrid scoring.

```
                        ┌─────────────────────────────┐
                        │  Input: User Profile         │
                        │  (skills, experience, edu,   │
                        │   salary preference, etc.)   │
                        └────────────┬────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────┐
│  LAYER 1: HEURISTIC SCORING                         weight: 0.60    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  matcher_service.py                                            │ │
│  │  - Category match        (bobot 35% dari heuristic score)     │ │
│  │  - Skill overlap         (bobot 40% dari heuristic score)     │ │
│  │  - Experience years      (bobot 15% dari heuristic score)     │ │
│  │  - Education level       (bobot  5% dari heuristic score)     │ │
│  │  - Salary range match    (bobot  5% dari heuristic score)     │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  LAYER 2: ML PREDICTION                             weight: 0.40    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  models/*.pkl — dilatih dari ~1.491 labeled jobs (5-Fold CV)   │ │
│  │  - Logistic Regression  ← default aktif                       │ │
│  │  - Random Forest        ← alternatif presentasi               │ │
│  │  - XGBoost              ← eksperimen (overfit di 1.491 rows)  │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  FUSION SCORE        │
                    │  0.60 × heuristic    │
                    │  + 0.40 × ml_score   │
                    └──────────┬───────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  LAYER 3: GEMINI AI CAREER ADVISOR                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  POST /api/v1/advisor/career  →  gemini_service.py            │ │
│  │  Input: user profile + top match results                       │ │
│  │  Output:                                                       │ │
│  │    - Career narrative (ringkasan profil & potensi karir)       │ │
│  │    - Skill roadmap (rekomendasi skill yang perlu dipelajari)   │ │
│  │    - Cover letter opening (pembuka surat lamaran personal)     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

Output Akhir: MatchResponse (top-K recommendations + score breakdown + AI advice)
```

### Pipeline 2 — Semantic Retrieval Search

Pipeline ini memungkinkan pencarian lowongan berbasis makna (bukan kata kunci), cocok digunakan untuk eksplorasi bebas.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Input: Query Teks Bebas (contoh: "data engineer cloud aws")        │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: TEXT ENCODING (SBERT)                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  embedder.py → SBERT paraphrase-multilingual-MiniLM-L12-v2    │ │
│  │  - Encode query menjadi dense vector (384 dimensi)             │ │
│  │  - Mendukung teks campuran Bahasa Indonesia & Inggris          │ │
│  └───────────────────────────────┬────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────- ┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: COSINE SIMILARITY SEARCH (NumPy)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  vector_store.py → VectorStore.search()                        │ │
│  │  - Muat sbert_embeddings.npy (pre-computed, 1.491 jobs)        │ │
│  │  - Hitung cosine similarity: query_vec · job_vec               │ │
│  │  - Filter by threshold (default: 0.3)                          │ │
│  │  - Return top-K jobs terurut by similarity score               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Output: SearchResponse                                             │
│  - List lowongan terurut by semantic similarity                     │
│  - Setiap hasil: judul, perusahaan, lokasi, skills, similarity score│
└─────────────────────────────────────────────────────────────────────┘
```

> **Catatan Teknis:** Implementasi awal menggunakan FAISS, namun diganti dengan NumPy cosine similarity karena FAISS memiliki *dependency binary issue* pada Google Cloud Run. Performa untuk dataset ~1.491 jobs tetap optimal dengan pendekatan NumPy.

---

## Dataset

### Sumber Data

Data lowongan kerja dikumpulkan menggunakan **SerpApi** — sebuah layanan scraping Google Jobs yang memungkinkan pengambilan data lowongan secara terstruktur dan legal via API.

- **Target scraping:** Lowongan pekerjaan di Indonesia dari Google Jobs
- **Skrip scraping:** `backend/data/fetch/serapi_fetch.py`
- **Frekuensi:** One-time batch scraping (offline)

### Statistik Dataset

| Tahap | File | Jumlah Records | Ukuran |
|---|---|---|---|
| **Raw** | `data/raw/google_jobs_results.json` | ~4.911 lowongan | ~18 MB |
| **Cleaned** (setelah ETL AI) | `data/cleaned/cleaned_jobs.json` | ~4.100 lowongan valid | — |
| **Refined** (siap indexing) | `data/cleaned/refined_jobs.json` | ~1.491 lowongan ter-proses penuh | — |
| **Embedded** | `data/retrieval/sbert_embeddings.npy` | 1.491 embedding vectors | — |

> **Mengapa hanya 1.491 dari 4.911?**  
> Proses ETL menggunakan Ollama/Gemma 2B secara lokal (CPU). Dari 4.911 raw jobs, ~1.617 lolos cleaning dan ~1.491 lolos refinement. Sisanya difilter karena diklasifikasikan sebagai bukan lowongan valid (`is_valid_job = false`), duplikat, atau data tidak lengkap.

### Proses ETL (Data Ingestion & Extraction)

Pipeline ETL dijalankan offline via Jupyter Notebook (`backend/services/etl_learning.ipynb`) menggunakan **Ollama/Gemma 2B** sebagai LLM lokal.

```
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
                       │ - Salary normalization       │    │ (siap untuk indexing)    │
                       │ - Skills deduplication       │    └─────────────┬────────────┘
                       │ - Employment type fix        │                  │
                       └──────────────────────────────┘                  ▼
                                                           ┌──────────────────────────┐
                                                           │ data/retrieval/          │
                                                           │ sbert_embeddings.npy     │
                                                            │ (1.491 jobs ter-embed)    │
                                                           └──────────────────────────┘
```

### Schema Data Output (`refined_jobs.json`)

| Field | Tipe | Keterangan |
|---|---|---|
| `is_valid_job` | bool | False = spam/bukan lowongan, dibuang di refinement |
| `hard_skills` | list[str] | Tools, bahasa pemrograman, keahlian teknis |
| `soft_skills` | list[str] | Karakter/sikap kerja (maks 3 item) |
| `education_level` | str\|null | SD/SMP/SMA/SMK/D3/S1/S2/S3 |
| `min_experience_years` | int | Tahun pengalaman minimum |
| `certifications` | list[str] | Sertifikat/lisensi yang dibutuhkan |
| `job_category` | str | 1 dari 14 kategori standar |
| `job_subcategory` | str | Subkategori spesifik pekerjaan |
| `seniority_level` | str | Entry/Junior/Mid/Senior/Lead/Manager |
| `work_arrangement` | str | Onsite/Remote/Hybrid |
| `employment_type` | str | Full-time/Part-time/Contract/Internship/Freelance |
| `salary_min` / `salary_max` | int | Gaji per bulan dalam IDR (0 jika tidak diketahui) |
| `original_salary_str` | str\|null | String gaji asli untuk transparansi UI |
| `cleaned_title` | str | Judul pekerjaan tanpa noise/iklan |

> **Normalisasi Gaji:** `salary_min` & `salary_max` selalu dalam IDR/bulan. Konversi: gaji harian ×22, mingguan ×4, per jam ×160.

---

## Struktur Proyek

```
project-akhir/
├── README.md                  ← (File ini) Dokumentasi utama
├── AGENTS.md                  ← Panduan untuk AI coding agents
├── Dockerfile                 ← Root Dockerfile
├── docker-compose.yml         ← Root Compose
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
│   ├── prompts/               ← LLM prompt templates
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
│   │   ├── vector_store.py    ← NumPy + SBERT Semantic Search
│   │   ├── gemini_service.py  ← Google Gemini 2.5 Flash Career Advisor
│   │   ├── etl_pipeline.py    ← Ekstraksi & normalisasi data pekerjaan
│   │   ├── data_indexing.py   ← Build & load index untuk pencarian
│   │   ├── evaluation_cells.py← ML evaluation helpers
│   │   ├── scraper_v2.py      ← SerpApi scraper
│   │   ├── etl_learning.ipynb ← Notebook utama ETL pipeline (Ollama)
│   │   ├── data_indexing.ipynb← Notebook ML training (RF vs LogReg vs XGB)
│   │   └── retrieval_pipeline.ipynb ← Notebook Semantic Search (SBERT)
│   │
│   ├── models/                ← Model ML / Embedder
│   │   ├── embedder.py        ← SBERT singleton wrapper
│   │   ├── logistic_regression.pkl ← Trained LogReg model
│   │   ├── random_forest.pkl       ← Trained RF model
│   │   └── xgboost.pkl             ← Trained XGBoost model
│   │
│   ├── utils/                 ← Helper functions & logging
│   │   ├── logger.py          ← PipelineTrace + @timed_step decorator
│   │   └── skill_normalizer.py← 100+ alias mapping ("js" → "JavaScript")
│   │
│   ├── data/                  ← Dataset & artifacts
│   │   ├── raw/               ← Data mentah dari SerpApi (~4.911 jobs, 18MB)
│   │   ├── cleaned/           ← Hasil ekstraksi AI (cleaned_jobs.json)
│   │   ├── refined/           ← refined_jobs.json (siap indexing)
│   │   ├── retrieval/         ← sbert_embeddings.npy (1.491 jobs ter-embed)
│   │   ├── vector/            ← FAISS index (legacy) + job_mapping.json
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
    │   ├── jobs/[id]/         ← Job detail & Gemini AI Advisor per lowongan
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
    │   ├── store.ts           ← Zustand stores (user, results, search, geminiAdvisor)
    │   ├── utils.ts           ← cn() utility
    │   └── mock-data.ts       ← Mock data for development
    ├── types/
    │   └── index.ts           ← TypeScript interfaces (mirror Pydantic schemas)
    └── DESIGN.md              ← Panduan desain UI
```

---

## API Contract

```
# Matching & Rekomendasi
POST /api/v1/match                    → MatchResponse
  Body: { parsed_cv: MatchProfileInput, category_filter?: string }
  Query: ?limit=10
GET  /api/v1/match/categories         → CategoriesResponse

# Semantic Search
GET  /api/v1/search                   → SearchResponse
  Query: ?q=...&limit=10&threshold=0.3

# Stats & Distribution
GET  /api/v1/stats                    → StatsResponse (market insights + distribusi)

# Jobs
GET  /api/v1/jobs                     → JobListResponse
  Query: ?limit=10&offset=0
GET  /api/v1/jobs/{job_id}            → JobDetailResponse
GET  /api/v1/jobs/by-link             → JobDetailResponse
  Query: ?link=<source_link_or_job_id>

# Skills
POST /api/v1/skills/gap               → SkillGapResponse
GET  /api/v1/skills/trending          → TrendingResponse

# Gemini AI Career Advisor
POST /api/v1/advisor/career           → GeminiAdvisorResponse
  Body: { user_profile: {...}, match_results: MatchResult[] }
  Returns: career_narrative, skill_roadmap[], cover_letter_opening

# Health
GET  /                                → Server status
GET  /health                          → Health check with stats

# Legacy (deprecated — backward compatibility)
POST /api/v1/recommend                → Predictor response (legacy)
GET  /api/v1/retrieval/search         → Retrieval response (legacy)
```

---

## Module Reference

### `backend/core/settings.py`
**Peran:** Single source of truth untuk semua konfigurasi (Pydantic BaseSettings).

| Variabel | Nilai Default | Keterangan |
|---|---|---|
| `sbert_model` | `paraphrase-multilingual-MiniLM-L12-v2` | SBERT multilingual (EN+ID) |
| `fusion_weights` | `heuristic: 0.60, ml_predict: 0.40` | Bobot 2-layer scoring |
| `skill_category_weights` | `hard_skill: 0.40, tool: 0.25, ...` | Bobot per kategori skill |
| `max_tokens` | `2000` | Maks token per LLM response |
| `temperature` | `0.1` | Rendah = deterministik |
| `cors_origins` | `http://localhost:3000,...` | Origin yang diizinkan CORS |

### `backend/services/` (4 core services)

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
vector_store.load_index()                   # Muat sbert_embeddings.npy dari disk
vector_store.search(query_text,             # Semantic search
    top_k=10, threshold=0.3)                # → list[dict]
vector_store.get_index_stats()              # → stats dict
vector_store.get_job_distribution()         # → sebaran provinsi
vector_store.get_job_category_distribution() # → sebaran kategori
```

**`gemini_service.py`:**
- `generate_career_advice(user_profile, match_results)` — career narrative + roadmap + cover letter
- Powered by **Google Gemini 2.5 Flash** via Google Generative AI SDK

**`etl_pipeline.py`:**
- `extract_jobs_from_serpapi()` — Ambil data dari SerpApi Google Jobs
- `process_with_ai()` — Ekstraksi menggunakan Ollama/Gemma 2B
- `refine_job_data()` — Post-processing (salary normalisasi, skill dedup)

### `backend/utils/`

**`skill_normalizer.py`:**
- `normalize_skill("js")` → `"JavaScript"`
- `normalize_skill_list(skills)` → deduplicated + normalized
- 100+ alias mapping (EN ↔ ID, singkatan → full name)

---

## Environment Variables

```bash
# === CORS ===
cors_origins=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000

# === Google Cloud (deployment) ===
gcp_project_id=your-gcp-project-id
gcp_location=us-central1
google_application_credentials=

# === Google Gemini AI ===
gemini_api_key=your-gemini-api-key

# === SerpApi (job scraping) ===
serpapi_key=your-serpapi-key

# === Ollama (local LLM — tidak perlu key) ===
# Pastikan Ollama berjalan di localhost:11434
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

### Dependensi Utama
| Package | Versi | Peran |
|---|---|---|
| `sentence-transformers` | 3.3.1 | SBERT embeddings (multilingual) |
| `scikit-learn` | 1.6.0 | ML models (RF, LogReg) |
| `pydantic` | 2.10.3 | Data validation |
| `fastapi` | 0.115.5 | Web framework |
| `joblib` | latest | Model serialization (.pkl) |
| `google-generativeai` | latest | Gemini AI SDK |

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
| Data ML ~1.491 baris | **5-Fold Cross Validation** | Mitigasi data kecil tanpa scraping ulang |
| 3 models tersimpan (RF, LogReg, XGB) | Default: `logistic_regression.pkl` | XGB too complex for 1.491 rows; RF for presentation; LogReg for baseline |
| FAISS diganti NumPy | `vector_store.py` sekarang menggunakan `sbert_embeddings.npy` + cosine similarity NumPy | FAISS tidak bisa berjalan di Cloud Run (dependency/binary issue) |
| CPU throttling di Cloud Run | Aktifkan `--no-cpu-throttling` pada service backend | Background thread load NumPy dibekukan sebelum selesai tanpa CPU always-on |
| job_id base64 rusak di URL | Endpoint `GET /api/v1/jobs/by-link?link=...` dibuat agar ID aman dikirim sebagai query param | Karakter `=` dan `/` di base64 merusak URL path routing |
| Skill Gap Analysis (Competency Gap) | Komponen diganti sepenuhnya oleh Gemini AI Career Advisor | Mock data tidak informatif; Gemini memberikan insight jauh lebih kaya |
