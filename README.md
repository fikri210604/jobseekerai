# 🤖 SkillBridge AI — Intelligent Career Advisor & Job Matching Platform

> **Deskripsi:** Sistem AI berbasis multi-layer scoring (Semantic Similarity + ML Prediction) yang menganalisis profil pengguna, mencocokkan dengan lowongan kerja, mengidentifikasi skill gap, dan memprediksi trajektori karir — dikhususkan untuk pasar kerja Indonesia.
> *(Pengolahan CV dan Rule-Based Expert System dipindahkan ke pengembangan selanjutnya)*
> 🏆 **Mata Kuliah:** Proyek Spesial Data Science — Semester 6

> ⚠️ **Catatan Penting untuk Agent:** README ini adalah **sumber kebenaran arsitektur**. Implementasi aktual mungkin berbeda dari roadmap V2.0 (GCP). Selalu baca bagian "Status Implementasi" sebelum membuat perubahan.

---

## 📐 Arsitektur Tingkat Tinggi (V2.0 — GCP Native)

```
┌──────────────┐     ┌──────────────────────────────┐     ┌──────────────┐
│   Frontend   │────▶│        FastAPI Backend        │────▶│   Supabase   │
│  (Next.js)   │◀────│   (orchestrator + API layer)  │◀────│  (Database)  │
│  Port: 3000  │     │         Port: 8000            │     └──────────────┘
└──────────────┘     └──────────┬───────────────────┘
                                │
                     ┌──────────▼───────────────────┐
                     │       Backend Pipeline        │
                     │  (AI logic, rules, prompts,   │
                     │   ML models, services, NER)   │
                     └──────────────────────────────┘
                                │
                     ┌──────────▼───────────────────┐
                     │     External Services (Aktual) │
                     │  - Ollama/Gemma 2B (LLM)      │
                     │  - SBERT all-MiniLM-L6-v2     │
                     │  - FAISS (Vector Index lokal) │
                     │  - SerpApi (Job Data Source)  │
                     │  - Supabase (PostgreSQL)      │
                     │  - Google Cloud (Deployment)  │
                     └──────────────────────────────┘
```

---

## 📁 Struktur Proyek

```
project-akhir/
├── README.md                  ← (File ini) Dokumentasi utama untuk developer
├── AGENTS.md                  ← Panduan untuk AI coding agents
├── Dockerfile                 ← Dockerfile root (belum diisi)
├── docker-compose.yml         ← Docker Compose root (belum diisi)
│
├── backend/                   ← ★ CORE AI PIPELINE — seluruh logika kecerdasan
│   ├── __init__.py
│   ├── .env                   ← Environment variables (JANGAN commit)
│   ├── .gitignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── README.md              ← Dokumentasi khusus backend pipeline
│   │
│   ├── config/                ← Konfigurasi global & client initialization
│   │   ├── settings.py        ← Env vars, model config, bobot scoring, threshold
│   │   └── azure_client.py    ← Factory functions untuk Azure AI services
│   │
│   ├── prompts/               ← Prompt engineering templates (Claude / Gemini)
│   │   ├── system_prompt.py   ← System prompt utama untuk semua AI call
│   │   ├── cv_parser.py       ← Prompt parsing CV (raw text → structured JSON)
│   │   ├── job_matcher.py     ← Prompt ranking & matching jobs
│   │   ├── skill_gap.py       ← Prompt analisis gap skill per kategori
│   │   └── career_predict.py  ← Prompt prediksi karir & roadmap upskilling
│   │
│   ├── rules/                 ← (POSTPONED) Rule-based expert system
│   │   ├── expert_system.py   ← Hard rules, soft rules, bonus rules (ditunda)
│   │   ├── skkni_weights.py   ← Tabel bobot skill berbasis SKKNI Kemnaker (ditunda)
│   │   └── inference_engine.py← Forward chaining (ditunda)
│   │
│   ├── services/              ← Service layer (business logic orchestrators)
│   │   ├── job_matcher.py     ← 2-layer fusion: SBERT + ML Prediction
│   │   ├── skill_gap.py       ← Analisis gap: kalkulasi + LLM enrichment
│   │   └── career_predictor.py← Prediksi karir: RF + trend + LLM narrative
│   │
│   ├── models/                ← Data models & ML utilities
│   │   ├── schemas.py         ← Pydantic schemas (input/output semua pipeline)
│   │   └── embedder.py        ← SBERT singleton wrapper (encode, similarity)
│   │
│   ├── utils/                 ← Shared utilities
│   │   ├── logger.py          ← Pipeline monitoring, timing, error logging
│   │   └── skill_normalizer.py← Normalisasi skill aliases ("js" → "JavaScript")
│   │
│   ├── data/                  ← Data pipeline artifacts
│   │   ├── raw/               ← Data mentah dari SerpApi (google_jobs_results.json ~18MB)
│   │   ├── cleaned/           ← Hasil ekstraksi AI (cleaned_jobs.json — incremental)
│   │   ├── refined/           ← Hasil post-processing (refined_jobs.json — siap FAISS)
│   │   ├── vector/            ← FAISS index & job mapping JSON
│   │   └── fetch/             ← Skrip scraping (serapi_fetch.py)
│   └── services/
│       ├── etl_learning.ipynb ← ★ Notebook utama ETL pipeline (Ollama)
│       └── retrieval_pipeline.ipynb ← ★ Notebook Semantic Search (FAISS + SBERT)
│
└── frontend/                  ← Next.js 16 (App Router + Tailwind + Sera UI)
    ├── AGENTS.md              ← Instruksi agent untuk frontend
    ├── app/                   ← Pages & layouts
    ├── components/            ← UI components (ui/, shared/, features/)
    ├── lib/                   ← Utils, Zustand store, API clients
    └── types/                 ← TypeScript interfaces (mirror Pydantic schemas)
```

---

## 🔄 Pipeline Alur Data (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: INTERACTIVE DISCOVERY AGENT (LLM CHAT)                │
│  Input: Natural language chat (minat, hobi, keseharian)        │
│  ┌─────────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Chat Endpoint    │───▶│ LLM Router   │───▶│ State Manager  │  │
│  │ (Menerima pesan  │    │ (Evaluasi:   │    │ (Simpan riwayat│  │
│  │  dari user)      │    │  Tanya lagi  │    │  wawancara)    │  │
│  │                  │    │  atau cukup?)│    │                │  │
│  └─────────────────┘    └───────┬──────┘    └───────────────┘  │
│                                 │                              │
│                                 ▼                              │
│                      ┌─────────────────────┐                   │
│                      │  LLM Extractor      │                   │
│                      │  (Generate profile) │                   │
│                      └─────────────────────┘                   │
│                                 │                              │
│  Output: "Shadow CV" / ParsedCV (Pydantic model)               ▼
└──────────────────────────────────────────────────────┼──────────┘
                                                       │
┌──────────────────────────────────────────────────────▼──────────┐
│  STEP 2: JOB MATCHING (Fusion Scoring)                          │
│                                                                  │
│  ┌─────────────────┐  ┌────────────────┐                        │
│  │  Layer 1:        │  │  Layer 2:      │                        │
│  │  SBERT Semantic  │  │  ML Prediction │                        │
│  │  Similarity      │  │  (Log Reg/XGB) │                        │
│  │  (cosine sim)    │  │                │                        │
│  └────────┬────────┘  └────────┬───────┘                        │
│           │                    │                                 │
│           └─────────────┬──────┘                                 │
│                         ▼                                        │
│              ┌──────────────────┐                                │
│              │  Fusion Score    │                                │
│              └────────┬─────────┘                                │
│                       ▼                                          │
│              ┌──────────────────┐                                │
│              │  LLM Enrichment  │  ← Gemma 2B narrative          │
│              └────────┬─────────┘                                │
│                       ▼                                          │
│  Output: list[MatchResult] (sorted by final_score desc)         │
└──────────────────────────────────────────────────────────────────┘
                                                       │
┌──────────────────────────────────────────────────────▼──────────┐
│  STEP 3: SKILL GAP ANALYSIS                                     │
│                                                                  │
│  Input: ParsedCV + target JobListing                             │
│  ┌──────────────────────────────┐  ┌─────────────────────────┐  │
│  │  Kalkulasi Matematis:         │  │  LLM Enrichment:        │  │
│  │  - Gap score per skill        │  │  - Narasi summary       │  │
│  │  - Readiness score (weighted) │  │  - Quick wins           │  │
│  │  - SKKNI weight multiplier    │  │  - Estimated timeline   │  │
│  └──────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
│  Output: SkillGapReport (readiness 0–100 + label)               │
└──────────────────────────────────────────────────────────────────┘
                                                       │
┌──────────────────────────────────────────────────────▼──────────┐
│  STEP 4: CAREER PREDICTION                                      │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │  A. Career Level  │  │  B. Skill Demand │  │ C. Success    │  │
│  │  (Heuristic/RF)   │  │  Forecast        │  │ Probability   │  │
│  │  Junior→...→Exec  │  │  (Linear Trend)  │  │ (Logistic Reg)│  │
│  └────────┬─────────┘  └────────┬────────┘  └───────────────┘  │
│           └────────────┬────────┘                               │
│                        ▼                                         │
│              ┌──────────────────┐                                │
│              │  LLM Narrative   │  ← career story + roadmap      │
│              └────────┬─────────┘                                │
│                       ▼                                          │
│  Output: CareerPrediction (narrative + roles + upskilling plan) │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Module Reference (untuk Backend)

### `backend/config/settings.py`
**Peran:** Single source of truth untuk semua konfigurasi.

| Variabel | Nilai Default | Keterangan |
|---|---|---|
| `OLLAMA_MODEL` | `gemma2:2b` | Model lokal LLM utama & ETL |
| `SBERT_MODEL` | `all-MiniLM-L6-v2` | Embedding model ringan (EN/ID) |
| `MAX_TOKENS` | `2048` | Maks token per LLM response |
| `TEMPERATURE` | `0.1` | Rendah = deterministik |
| `FUSION_WEIGHTS` | `semantic: 0.60, ml: 0.40` | Bobot 2-layer scoring (Expert system dihapus) |
| `READINESS_LABELS` | `80-100: Ready, 60-79: Almost Ready, ...` | Threshold label kesiapan |

### `backend/config/azure_client.py`
> **STATUS: DITUNDA / DIHAPUS**
> Penggunaan Azure Doc Intelligence (OCR) ditunda untuk pengembangan selanjutnya. CV Processing tidak menggunakan Azure.

### `backend/ingestion/` (planned — belum dibuat)
**Peran:** ETL pipeline — scraping & indexing lowongan secara asinkron (berjalan offline/background).

| File | Fungsi Utama | Keterangan |
|---|---|---|
| `serpapi_client.py` | `fetch_jobs(query, location)` | Mengambil lowongan via SerpApi Google Jobs |
| `llm_extractor.py` | `extract_entities(raw_text)` | Gemini Structured Output → JSON skill/edu/exp |
| `vector_indexer.py` | `upsert_to_vertex(job_embeddings)` | Sinkronisasi SBERT vectors ke Vertex AI |

### `backend/prompts/` (5 files)
**Peran:** Template prompt LLM API (Claude / Gemini) — setiap file memiliki:
1. String template dengan `{placeholder}` untuk data injection
2. `build_*_prompt()` function yang mem-format template + JSON dump

| File | Prompt Constant | Builder Function | Input |
|---|---|---|---|
| `system_prompt.py` | `SYSTEM_PROMPT` | — (dipakai langsung) | — |
| `cv_parser.py` | `CV_PARSE_PROMPT` | `build_cv_parse_prompt(raw_text)` | Raw OCR text |
| `job_matcher.py` | `JOB_MATCH_PROMPT` | `build_job_match_prompt(profile, jobs, top_n)` | User profile + jobs list |
| `skill_gap.py` | `SKILL_GAP_PROMPT` | `build_skill_gap_prompt(profile, job)` | User profile + 1 target job |
| `career_predict.py` | `CAREER_PREDICT_PROMPT` | `build_career_predict_prompt(profile, ml_pred, trends)` | Profile + ML output + trends |

### `backend/rules/` (POSTPONED)
> **STATUS: DITUNDA**
> Penggunaan Rule-based expert system ditunda karena bobot (SKKNI, rules) perlu dipelajari lebih lanjut. Sistem saat ini hanya mengandalkan ML Pred dan Semantic Similarity. File-file di folder ini (`expert_system.py`, `skkni_weights.py`, `inference_engine.py`) diabaikan untuk versi MVP.

### `backend/services/` (3 files)
**Peran:** Orchestrator layer — menggabungkan rules + ML + LLM.

**`job_matcher.py` → `match_jobs()`:**
```python
match_jobs(
    user_profile: dict,       # ParsedCV.model_dump()
    job_listings: list[dict], # dari Supabase
    ml_scores: dict | None,   # {job_id: probability}
    top_n: int = 5,
    enrich_with_ai: bool = True,
) -> list[MatchResult]
```

**`skill_gap.py` → `analyze_skill_gap()`:**
```python
analyze_skill_gap(
    user_profile: dict,
    target_job: dict,
    enrich_with_ai: bool = True,
) -> SkillGapReport
```

**`career_predictor.py` → `predict_career()`:**
```python
predict_career(
    user_profile: dict,
    skill_trends: list[dict] | None = None,
) -> dict  # CareerPrediction-compatible
```

### `backend/models/schemas.py`
**Peran:** Pydantic schemas — kontrak data yang ketat.

**Schemas utama (gunakan sebagai referensi tipe data):**

| Schema | Dipakai Di | Keterangan |
|---|---|---|
| `ParsedCV` | CV Parser output | 12 field: personal_info, education, skills, dll. |
| `JobListing` | Database / API input | Job posting dengan required_skills |
| `MatchResult` | Job Matcher output | 3-layer scores + final + skill lists |
| `SkillGapReport` | Skill Gap output | readiness_score + breakdown + quick_wins |
| `CareerPrediction` | Career Predictor output | narrative + roles + upskilling roadmap |
| `CVUploadResponse` | API response | upload_id + parsed_data |
| `MatchRequest/Response` | API contract | Request: user + top_n; Response: results |
| `SkillGapRequest` | API contract | user + target_job |
| `CareerPredictRequest` | API contract | user only |

**Enums:**
`EducationLevel`, `ProficiencyLevel`, `SkillStatus`, `Priority`, `ReadinessLabel`, `RecommendationTag`, `JobType`

### `backend/models/embedder.py`
**Peran:** Singleton SBERT wrapper.
- `embedder.encode(texts)` → `np.ndarray`
- `embedder.similarity(a, b)` → `float` (0–1)
- `embedder.similarity_batch(query, candidates)` → `list[float]`
- `embedder.build_skill_text(profile)` → gabungan skill/exp sebagai teks
- `embedder.build_job_text(job)` → gabungan job desc/skills sebagai teks

### `backend/utils/`
**`logger.py`:**
- `PipelineTrace` class — track timing per step
- `@timed_step()` decorator — otomatis log durasi
- `log_pipeline_error()`, `log_ai_call()` — structured logging

**`skill_normalizer.py`:**
- `normalize_skill("js")` → `"JavaScript"`
- `normalize_skill_list(skills)` → deduplicated + normalized
- 60+ alias mapping

---

## ⚙️ Environment Variables

```bash
# === Database ===
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=...

# === App ===
APP_ENV=development                    # development | production
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Quick Start

### Backend (AI Pipeline + API)
```bash
cd backend/
cp .env.example .env                   # Isi API keys (jika ada .env.example)
pip install -r requirements.txt        # Install dependencies
python -m backend.utils.logger         # Smoke test
```

### Frontend
```bash
cd frontend/
npm install
npm run dev                            # http://localhost:3000
```

---

## 🧠 Panduan untuk Agent / AI Coding Assistant

### Prinsip Arsitektur
1. **Separation of Concerns:** `backend/` adalah domain logic murni (AI pipeline), `frontend/` adalah presentation layer. FastAPI routes (API layer) belum dibuat — akan ditambahkan di `backend/` juga.
2. **Backend pipeline bersifat framework-agnostic:** Services di `backend/services/` mengembalikan Pydantic models/dict, BUKAN HTTP response.
3. **LLM digunakan untuk enrichment, bukan logic inti.** Kalkulasi scoring (fusion, gap, readiness) dilakukan oleh rules/ML terlebih dahulu, Claude menambahkan narasi.
4. **Semua data flow mengikuti Pydantic schema** di `backend/models/schemas.py` — ini adalah kontrak yang harus dihormati.

### Saat Menambah Fitur Baru
1. **Definisikan schema dulu** di `backend/models/schemas.py`
2. **Buat prompt** (jika perlu LLM) di `backend/prompts/`
3. **Tambah rules** (jika ada domain logic) di `backend/rules/`
4. **Buat service orchestrator** di `backend/services/`
5. **Expose via API** di `backend/` (FastAPI route — belum dibuat)
6. **Konsumsi dari frontend** di `frontend/lib/api.ts`

### Saat Mengedit Module yang Ada
- **Selalu normalize skill** via `backend/utils/skill_normalizer.py` sebelum comparison
- **Selalu log** langkah penting via `backend/utils/logger.py`
- **Jangan hardcode bobot** — gunakan `backend/config/settings.py`
- **Jangan skip Pydantic validation** — gunakan schema dari `backend/models/schemas.py`

### Status Implementasi

| Komponen | Status | Catatan |
|---|---|---|
| `backend/config/` | ✅ Selesai | Settings + Ollama config |
| `backend/prompts/` | ✅ Selesai | Prompt templates (disesuaikan untuk Gemma 2B) |
| `backend/rules/` | ❌ Ditunda | Expert system + SKKNI (Pengembangan selanjutnya) |
| `backend/services/job_matcher.py` | ✅ Selesai | 2-layer fusion scoring (Semantic + ML) |
| `backend/services/skill_gap.py` | ✅ Selesai | Gap analysis |
| `backend/services/career_predictor.py` | ✅ Selesai | Heuristic + trend |
| `backend/services/etl_learning.ipynb` | ✅ Selesai | ETL pipeline (Ollama/Gemma 2B) |
| `backend/services/retrieval_pipeline.ipynb` | ✅ Selesai | Semantic Search (FAISS + SBERT) |
| `backend/services/data_indexing.ipynb` | 🟡 Sedang Berjalan | ML Training: RF vs LogReg + EDA + Heatmap |
| `backend/models/` | ✅ Selesai | Schemas + Embedder |
| `backend/utils/` | ✅ Selesai | Logger + Normalizer |
| `backend/data/raw/` | ✅ Selesai | ~4.911 raw job listings (18MB JSON) |
| `backend/data/cleaned/` | ✅ Selesai | Hasil ETL incremental (Ollama/Gemma 2B) |
| `backend/data/refined/` | ✅ Selesai | Post-processed: salary normalized, skills clean |
| `backend/data/vector/` | ✅ Selesai | FAISS index (756 jobs ter-index, field `location` ditambahkan) |
| FastAPI routes | 🔲 Belum | API layer belum dibuat |
| `frontend/` | 🟡 Partial | Struktur Next.js ada, perlu integrasi API |

### Services yang Ditunda (Pengembangan Selanjutnya)
- `backend/services/cv_preprocessor.py` — preprocessing image (CV OCR ditunda)
- `backend/services/ocr_engine.py` — Penggunaan Azure Doc Intel dibatalkan
- `backend/services/skill_extractor.py` — NER parsing dari raw text
- `backend/rules/*` — Rule-based scoring

### Dependensi Utama (berdasarkan requirements.txt)
| Package | Versi | Peran |
|---|---|---|
| `ollama` | latest | LLM lokal (Gemma 2B) |
| `sentence-transformers` | 3.3.1 | SBERT embeddings (multilingual) |
| `scikit-learn` | 1.6.0 | ML models (RF, LogReg) |
| `pydantic` | 2.10.3 | Data validation |
| `fastapi` | 0.115.5 | Web framework |
| `supabase` | latest | Database client |
| `faiss-cpu` | 1.9.0 | Vector similarity search lokal |
| `google-cloud-aiplatform`| 1.46.0 | Google Cloud deployment target |

---

## 📋 API Contract (Planned — untuk Backend)

```
POST /api/v1/cv/upload          → CVUploadResponse
  Body: multipart/form-data (file)

POST /api/v1/match              → MatchResponse
  Body: MatchRequest { user_profile: ParsedCV, top_n: int }

POST /api/v1/skill-gap          → SkillGapReport
  Body: SkillGapRequest { user_profile: ParsedCV, target_job: JobListing }

POST /api/v1/career/predict     → CareerPrediction
  Body: CareerPredictRequest { user_profile: ParsedCV }

GET  /api/v1/jobs               → list[JobListing]
  Query: ?page=1&limit=20&search=...

GET  /api/v1/skills/trending    → list[TrendingSkill]
```

---

## 🏗️ Konvensi Kode

- **Bahasa kode:** Python 3.11+ (agent/backend), TypeScript (frontend)
- **Bahasa komentar/docstring:** Campuran Bahasa Indonesia & English
- **Formatter:** Black (Python), ESLint + Prettier (TS)
- **Import style:** Absolute imports dari root package (`from backend.config.settings import ...`)
- **Naming:**
  - Python: `snake_case` untuk fungsi/variabel, `PascalCase` untuk class/schema
  - TypeScript: `camelCase` untuk fungsi, `PascalCase` untuk components/types
- **Error handling:** Try-except dengan fallback value (jangan crash pipeline, log error dan lanjut)

---

## 🚀 ETL Pipeline (Implementasi Aktual)

### Pipeline 1: Data Ingestion & AI Extraction (Lokal, Offline)

> Dijalankan di `backend/services/etl_learning.ipynb`. Stack: **Ollama (Gemma 2B)** — model LLM lokal yang berjalan tanpa koneksi internet dan tanpa biaya API.

```text
┌─────────────────┐    ┌─────────────────────────────┐    ┌──────────────────────────┐
│ data/raw/       │    │ ETL Stage 1: AI Extraction  │    │ data/cleaned/            │
│ google_jobs_    │───▶│ (Ollama/Gemma 2B)           │───▶│ cleaned_jobs.json        │
│ results.json    │    │ - is_potential_job() filter │    │ (incremental, resumable) │
│ (~4.911 jobs)   │    │ - build_prompt() one-shot   │    │ Schema: JobExtracted      │
└─────────────────┘    │ - process_with_ai() async   │    └─────────────┬────────────┘
                       └─────────────────────────────┘                  │
                                                                         ▼
                       ┌─────────────────────────────┐    ┌──────────────────────────┐
                       │ ETL Stage 2: Refinement     │    │ data/refined/            │
                       │ (Pure Python — tanpa AI)    │───▶│ refined_jobs.json        │
                       │ - Salary normalization      │    │ (siap untuk FAISS index) │
                       │ - Skills deduplication      │    └─────────────┬────────────┘
                       │ - Employment type fix       │                  │
                       └─────────────────────────────┘                  ▼
                                                          ┌──────────────────────────┐
                                                          │ data/vector/             │
                                                          │ faiss_index.bin          │
                                                          │ job_mapping.json         │
                                                          │ (SBERT all-MiniLM-L6-v2) │
                                                          └──────────────────────────┘
```

### Detail ETL: Schema Data Output (`cleaned_jobs.json`)

Setiap record yang berhasil diekstrak memiliki field berikut:

| Field | Tipe | Keterangan |
|---|---|---|
| `is_valid_job` | bool | False = spam/tidak valid, dibuang di refinement |
| `hard_skills` | list[str] | Tools, bahasa pemrograman, keahlian teknis |
| `soft_skills` | list[str] | Karakter/sikap kerja (maks 3) |
| `education_level` | str\|null | SD/SMP/SMA/SMK/D3/S1/S2/S3 |
| `min_experience_years` | int | Tahun pengalaman minimum |
| `certifications` | list[str] | Sertifikat/lisensi yang disebut |
| `job_category` | str | 1 dari 14 kategori standar |
| `job_subcategory` | str | Subkategori bebas |
| `seniority_level` | str | Entry/Junior/Mid/Senior/Lead/Manager |
| `work_arrangement` | str | Onsite/Remote/Hybrid |
| `employment_type` | str | Full-time/Part-time/Contract/Internship/Freelance |
| `salary_min` | int | Gaji minimum **per bulan** dalam IDR (0 jika tidak diketahui) |
| `salary_max` | int | Gaji maximum **per bulan** dalam IDR (0 jika tidak diketahui) |
| `original_salary_str` | str\|null | String gaji asli untuk transparansi UI |
| `is_multi_position` | bool | True = 1 posting untuk banyak posisi |
| `job_responsibilities` | list[str] | Tanggung jawab utama (maks 3) |
| `cleaned_title` | str | Judul tanpa noise "Lowongan Kerja"/nama kota |

> ⚠️ **Catatan Kritis — Normalisasi Gaji:** Field `salary_min` & `salary_max` **selalu dalam satuan per bulan** (IDR/bulan). Gaji harian dikalikan 22 (hari kerja/bulan), gaji mingguan dikalikan 4, gaji per jam dikalikan 160. Hal ini penting agar model ML tidak menganggap gaji per hari jauh lebih kecil dari gaji per bulan.

### Detail ETL: Prompting Strategy

ETL menggunakan **One-Shot Prompting** — memberikan 1 contoh JSON konkret sebelum meminta model memproses data baru. Ini kritis untuk model kecil seperti Gemma 2B:

```python
# build_prompt() di etl_learning.ipynb
# Strategi: Schema + Rules + 1 Example + Input
# Token budget: ~380 tokens (optimal untuk Gemma 2B dengan num_predict=400)
# temperature=0 untuk output deterministik dan mencegah looping
```

### Pipeline 2: Semantic Retrieval (Runtime)

> Dijalankan **per request** saat user berinteraksi. Kompleksitas: `O(log N)` → `O(K)`.

```
[User Chat Interaction]
        │
        ▼
1. Interactive Discovery Agent (LLM Interview)
   AI bertanya tentang minat, hobi, dan rutinitas hingga mendapat profil solid.
        │
        ▼
2. Stage-1 Retrieval (FAISS Vector Search)
   Query SBERT dari "Shadow CV" ke FAISS lokal ──▶ Top 50 Kandidat
        │
        ▼
3. Stage-2 Reranking & Dynamic Fusion
   - ML Prediction
   - LLM Enrichment (Gemma 2B)
        │
        ▼
Top 5 Final Matches + Skill Gap Analysis + Career Prediction
```

---

## 📂 Struktur Direktori Revisi (V2.0)

> **Catatan:** Struktur di bawah adalah roadmap V2.0 untuk migrasi ke GCP.
> Implementasi saat ini menggunakan `backend/` dengan Claude + Azure.

```
backend/
├── ingestion/                 ← ETL pipeline lowongan (offline/background) — BELUM DIBUAT
│   ├── serpapi_client.py      ← Paging & crawling dari SerpApi Google Jobs
│   ├── llm_extractor.py       ← Gemini Structured Output: teks → JSON entitas
│   └── vector_indexer.py      ← Sinkronisasi SBERT vectors ke Vertex AI
│
├── core/                      ← Mesin inferensi runtime — BELUM DIBUAT
│   ├── dynamic_weights.py     ← Meta-learner untuk bobot fusion adaptif
│   ├── two_stage_matcher.py   ← Stage-1 Retrieval + Stage-2 LLM Reranker
│   └── constraint_engine.py   ← Hard/Soft rules (lokasi, pendidikan, SKKNI)
│
├── multimodal/                ← CV parsing via Gemini multimodal — BELUM DIBUAT
│   └── cv_ingestion.py        ← Mengirim PDF/Gambar langsung ke Gemini
│
└── config/
    └── gcp_client.py          ← Inisialisasi Vertex AI & GCP services — BELUM DIBUAT
```

---

## 🗺️ Phased Implementation Roadmap

### Phase 1 — Data Ingestion, ETL & Semantic Retrieval ⚡ `CRITICAL`
> **Target:** Membangun dataset Gold Standard lowongan dan mengindeksnya dengan SBERT.

- [x] 1.1 Scraping data lowongan mentah via SerpApi → `data/raw/google_jobs_results.json` (~4.911 jobs)
- [x] 1.2 Buat ETL extraction notebook (`etl_learning.ipynb`) dengan Ollama/Gemma 2B
- [x] 1.3 Post-processing `refine_job_data()`
- [x] 1.4 Semantic Retrieval & FAISS indexing: diimplementasi pada `retrieval_pipeline.ipynb`
- [x] 1.5 Data Indexing & ML Training pipeline (`data_indexing.ipynb`): job mapping diperluas dengan field `location`, 756 data ter-index ke FAISS
- [ ] 1.6 ML Model Training selesai: RF vs Logistic Regression (EDA + Synthetic Labeling + Evaluation) — **sedang berjalan**
- [ ] 1.7 Normalisasi entitas via `skill_normalizer.py` dan simpan ke Supabase (opsional)

### Phase 2 — ML Modelling & Backend API (FastAPI) 🟡 `MEDIUM`
> **Target:** Model ML selesai ditraining & di-evaluate, lalu pipeline dibungkus dalam FastAPI.

- [ ] 2.1 Selesaikan ML training di `data_indexing.ipynb`: Synthetic Labeling → EDA → Preprocessing → RF vs LogReg → Evaluation (K-Fold, F1, Confusion Matrix)
- [ ] 2.2 Simpan model terbaik (`.pkl`) ke `backend/data/models/`
- [ ] 2.3 Bungkus pipeline runtime ke dalam FastAPI routes di `backend/main.py`
- [ ] 2.4 Endpoint job matching: FAISS retrieval + ML re-ranking (fusion score 0.6 semantic + 0.4 ML)
- [ ] 2.5 Async logging via `backend/utils/logger.py`
- [ ] 2.6 Persiapan Deployment ke Google Cloud Platform

### Phase 3 — Frontend Integration & UI/UX ⚪ `LOW`
- [ ] 3.1 Hubungkan Next.js App Router ke FastAPI endpoints
- [ ] 3.2 Tampilkan list pekerjaan hasil retrieval semantik

### Phase 4 — Pengembangan Selanjutnya (Ditunda)
- CV Parsing (Image OCR, Azure Doc Intelligence)
- Rule-based Expert System (Penghitungan SKKNI dan Hard/Soft rules)

---

## ⚠️ Known Issues & Decisions

| Issue | Keputusan | Alasan |
|---|---|---|
| Gemma 2B halusinasi nilai salary | `salary=0` jika tidak eksplisit disebut; regex fallback di `refine_job_data()` | Model kecil sering mengarang angka |
| Gaji per hari vs per bulan tidak konsisten | Konversi ke IDR/bulan (×22/×4/×160); simpan `original_salary_str` | Unit inconsistency merusak ML scoring |
| Gemma 2B looping output | `temperature=0`, `num_predict=400`, try-except di `process_with_ai()` | Mencegah infinite generation |
| Data duplikat saat resume | `job_id` set untuk skip yang sudah ada | Proses ETL bisa diinterrupt & dilanjutkan |
| `soft_skills` lebih dari 3 item | Filter `len(s.split()) <= 3` di refinement | Prompt sudah ada `max3` tapi model terkadang melanggar |
| `job_subcategory` kadang berupa list | Fungsi `build_job_text()` menggunakan `to_str()` yang handle list & string | Field ini bisa list atau string dari output Gemma 2B |
| Pilihan algoritma ML Layer 2 | **Random Forest** sebagai model utama, **Logistic Regression** sebagai baseline pembanding | 756 data terlalu kecil untuk XGBoost; RF lebih stabil & interpretable untuk presentasi |
| Data ML hanya 756 baris | Gunakan **5-Fold Cross Validation** agar setiap data sempat jadi training & test set | Mitigasi data kecil tanpa harus scraping ulang |
