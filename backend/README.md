# 🤖 JobSeeker AI — Backend

Backend **FastAPI** untuk platform career advisor berbasis AI multi-layer scoring
untuk pasar kerja Indonesia.

---

## 📁 Struktur Folder

```
backend/
├── main.py                    # FastAPI entry point & lifespan startup
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Production Docker image (Cloud Run)
├── DEPLOYMENT.md              # Panduan deploy ke Google Cloud Run
│
├── api/
│   └── v1/
│       ├── api_router.py      # Router utama /api/v1
│       ├── endpoints/         # Controllers (match, search, jobs, skills)
│       └── schemas/           # Pydantic request/response schemas
│
├── config/
│   └── settings.py            # Env vars, model config, fusion weights
│
├── core/
│   └── settings.py            # Settings singleton (Pydantic BaseSettings)
│
├── services/
│   ├── matcher_service.py     # Core: Hybrid AI job matching (Heuristic + ML)
│   ├── vector_store.py        # FAISS semantic search wrapper
│   ├── skill_gap.py           # Skill gap calculation
│   ├── career_predictor.py    # Career prediction (heuristic + linear trend)
│   ├── etl_pipeline.py        # ETL: scraping → cleaning → indexing
│   └── data_indexing.py       # FAISS index builder
│
├── models/
│   ├── embedder.py            # SBERT singleton wrapper
│   └── xgboost.pkl            # Trained ML model (generated, not in git)
│
├── data/
│   ├── cleaned/
│   │   └── refined_jobs.json  # Dataset lowongan yang sudah diproses
│   └── vector/
│       ├── faiss_index.faiss  # FAISS vector index
│       └── metadata.pkl       # Metadata untuk tiap vektor FAISS
│
├── prompts/                   # Prompt templates untuk LLM (Gemma 2B/Gemini)
├── rules/                     # Expert system & SKKNI weights (ditunda)
└── utils/
    ├── logger.py              # PipelineTrace, timed_step, log_ai_call
    └── skill_normalizer.py    # normalize_skill(), 60+ alias mapping
```

---

## 🔄 Alur Pipeline

```
Input Profil Kandidat (JSON)
        │
        ▼
[1] Job Matching             ← services/matcher_service.py → recommend_jobs()
    Heuristic scoring (skill, category, exp, edu, salary)
    + ML prediction (XGBoost)
        │
        ▼
[2] Semantic Search          ← services/vector_store.py → search()
    SBERT embedding → FAISS similarity search
        │
        ▼
[3] Skill Gap Analysis       ← services/skill_gap.py → analyze_skill_gap()
    Kalkulasi gap per skill + readiness label
        │
        ▼
[4] Career Prediction        ← services/career_predictor.py → predict_career()
    Heuristic level + linear trend forecast
        │
        ▼
JSON Response → FastAPI → Frontend
```

---

## 🧩 Scoring System

### Hybrid Job Matching
| Layer | Bobot | Keterangan |
|---|---|---|
| Heuristic (skill, category, exp, edu, salary) | 60% | Rule-based multi-factor |
| ML Prediction (XGBoost) | 40% | Trained classifier |

### Heuristic Sub-weights
| Faktor | Bobot |
|---|---|
| Skill coverage | 40% |
| Category match | 35% |
| Experience gap | 15% |
| Education level | 5% |
| Salary feasibility | 5% |

### Skill Gap Readiness Labels
| Score | Label |
|---|---|
| 80–100 | Ready |
| 60–79 | Almost Ready |
| 40–59 | Partially Ready |
| 0–39 | Not Ready |

---

## 🔗 API Endpoints

| Method | Path | Deskripsi |
|---|---|---|
| `POST` | `/api/v1/match` | Rekomendasi lowongan Hybrid AI |
| `GET` | `/api/v1/match/categories` | Daftar kategori pekerjaan |
| `GET` | `/api/v1/search` | Pencarian semantik FAISS + SBERT |
| `GET` | `/api/v1/search/stats` | Statistik FAISS index |
| `GET` | `/api/v1/jobs` | Daftar lowongan dengan filter |
| `GET` | `/api/v1/jobs/{id}` | Detail satu lowongan |
| `POST` | `/api/v1/skills/gap` | Analisis skill gap |
| `GET` | `/api/v1/skills/trending` | Skill yang sedang trending |
| `GET` | `/health` | Health check server |

Swagger UI tersedia di: `http://localhost:8000/docs`

---

## ⚙️ Setup & Development

### 1. Install dependencies

```bash
cd backend/
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

### 2. Setup environment variables

```bash
# Buat file .env (jangan pernah commit ke git)
cp .env.example .env
# Isi SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY, dll.
```

### 3. Jalankan server development

```bash
uvicorn main:app --reload --port 8000
```

Server berjalan di: `http://localhost:8000`

---

## 🤖 LLM & External Services

| Service | Tujuan | Config Key |
|---|---|---|
| **SBERT** (lokal) | Embeddings untuk semantic search | - (auto-download) |
| **XGBoost** (lokal) | ML scoring job matching | `models/xgboost.pkl` |
| **FAISS** (lokal) | Vector similarity search | `data/vector/` |
| **Supabase** | Database PostgreSQL | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| **SerpApi** | Job scraping Google Jobs | `SERPAPI_KEY` |
| **Gemini Flash** | LLM enrichment (opsional) | `GOOGLE_API_KEY` |

> Model SBERT (`paraphrase-multilingual-MiniLM-L12-v2`) didownload otomatis
> dari Hugging Face saat pertama kali dijalankan.

---

## 🚀 Deployment

Backend di-deploy ke **Google Cloud Run** menggunakan Docker.

Lihat panduan lengkap di **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

```
Docker Image → Artifact Registry → Cloud Run
Data Files   → Cloud Storage
Secrets      → Secret Manager
```

---

## 📋 Status Implementasi

| Komponen | Status | Catatan |
|---|---|---|
| FastAPI app & lifespan | ✅ Selesai | main.py |
| Job Matching (Hybrid AI) | ✅ Selesai | Heuristic + XGBoost |
| Semantic Search (FAISS) | ✅ Selesai | SBERT + FAISS |
| Skill Gap Analysis | ✅ Selesai | Kalkulasi matematis |
| Career Prediction | ✅ Selesai | Heuristic + linear trend |
| Pydantic v2 Schemas | ✅ Selesai | api/v1/schemas/ |
| SBERT Embedder | ✅ Selesai | Singleton wrapper |
| ETL Pipeline | ✅ Selesai | Scraping → cleaning → indexing |
| Dockerfile (Cloud Run) | ✅ Selesai | Multi-stage build |
| Expert System (SKKNI) | 🔲 Ditunda | rules/ |
| CV OCR / Ingestion | 🔲 Ditunda | Upload CV dari user |
| FastAPI Auth | 🔲 Ditunda | JWT / Supabase Auth |
| Docker Compose (full stack) | 🔲 Belum | - |
