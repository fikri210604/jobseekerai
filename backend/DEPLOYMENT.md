# 🚀 Deploy SkillBridge AI Backend ke Google Cloud Run

## Overview Arsitektur

```
Internet
   │
   ▼
Cloud Run (FastAPI + Uvicorn)
   │
   ├── Cloud Storage  ← data files (refined_jobs.json, FAISS index, model .pkl)
   ├── Supabase       ← database PostgreSQL
   └── Secret Manager ← env vars sensitif
```

**Kenapa Cloud Run?**
- ✅ Serverless — scale to zero (hemat biaya untuk proyek kuliah)
- ✅ Bayar per request, bukan per jam
- ✅ Deploy dari Docker image, cocok dengan FastAPI
- ✅ Free tier: 2 juta request/bulan, 360,000 vCPU-seconds

---

## Prasyarat

- [ ] [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) terinstall
- [ ] [Docker Desktop](https://www.docker.com/products/docker-desktop/) berjalan
- [ ] Akun Google Cloud dengan billing aktif (butuh kartu kredit, tapi ada $300 free credit)
- [ ] Project di Google Cloud sudah dibuat

---

## Langkah 1 — Setup Google Cloud Project

```bash
# Login ke Google Cloud
gcloud auth login

# Set project (ganti YOUR_PROJECT_ID dengan ID project kamu)
gcloud config set project YOUR_PROJECT_ID

# Enable API yang dibutuhkan
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

---

## Langkah 2 — Siapkan Secrets di Secret Manager

> ⚠️ **CAUTION**: Jangan pernah hardcode API key di Dockerfile atau source code. Gunakan Secret Manager.

```bash
# Buat secret untuk setiap env var sensitif
echo -n "https://xxx.supabase.co" | gcloud secrets create SUPABASE_URL --data-file=-
echo -n "your-service-key" | gcloud secrets create SUPABASE_SERVICE_KEY --data-file=-
echo -n "your-serpapi-key" | gcloud secrets create SERPAPI_KEY --data-file=-
```

---

## Langkah 3 — Upload File Data ke Cloud Storage

> ℹ️ **IMPORTANT**: `refined_jobs.json`, FAISS index (`.faiss`/`.pkl`), dan model ML (`.pkl`) **tidak boleh**
> di-commit ke Git atau di-bundle ke Docker image (terlalu besar). Simpan di Cloud Storage.

```bash
# Buat bucket (nama harus unik global)
gsutil mb gs://skillbridge-ai-data

# Upload file data (jalankan dari root project-akhir/)
gsutil cp backend/data/cleaned/refined_jobs.json gs://skillbridge-ai-data/data/
gsutil cp backend/data/vector/*.faiss gs://skillbridge-ai-data/vector/
gsutil cp backend/data/vector/*.pkl gs://skillbridge-ai-data/vector/
gsutil cp backend/models/*.pkl gs://skillbridge-ai-data/models/
```

Kemudian update `main.py` agar download file dari Cloud Storage saat startup jika tidak ada secara lokal
(lihat bagian **Adaptasi Kode** di bawah).

---

## Langkah 4 — Buat Artifact Registry Repository

```bash
# Buat repository Docker di Artifact Registry
gcloud artifacts repositories create skillbridge-backend \
  --repository-format=docker \
  --location=asia-southeast2 \
  --description="SkillBridge AI Backend Docker images"

# Autentikasi Docker ke Artifact Registry
gcloud auth configure-docker asia-southeast2-docker.pkg.dev
```

---

## Langkah 5 — Build & Push Docker Image

```bash
# Masuk ke folder backend
cd backend/

# Build image (ganti YOUR_PROJECT_ID)
docker build -t asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/skillbridge-backend/api:latest .

# Push ke Artifact Registry
docker push asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/skillbridge-backend/api:latest
```

> 💡 **TIP**: Build pertama kali memakan waktu lama (~10-15 menit) karena download SBERT model ~400MB.
> Selanjutnya akan menggunakan Docker layer cache dan jauh lebih cepat.

---

## Langkah 6 — Deploy ke Cloud Run

```bash
gcloud run deploy skillbridge-backend \
  --image=asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/skillbridge-backend/api:latest \
  --region=asia-southeast2 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=3 \
  --port=8080 \
  --timeout=300 \
  --set-secrets="SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_KEY=SUPABASE_SERVICE_KEY:latest,SERPAPI_KEY=SERPAPI_KEY:latest" \
  --set-env-vars="GCS_BUCKET_NAME=skillbridge-ai-data,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID"
```

Setelah deploy selesai, kamu akan mendapat URL seperti:
```
https://skillbridge-backend-xxxxxxxx-as.a.run.app
```

---

## Adaptasi Kode — Download Data dari Cloud Storage saat Startup

Karena data files ada di GCS (bukan di image), tambahkan fungsi helper berikut di `main.py`
**sebelum** fungsi `lifespan()`:

```python
# main.py — tambahkan fungsi ini sebelum lifespan()

import os
from pathlib import Path

def _download_from_gcs_if_needed():
    """Download file data dari GCS jika tidak ada secara lokal (untuk Cloud Run)."""
    bucket = os.getenv("GCS_BUCKET_NAME")
    if not bucket:
        return  # Lokal development, skip

    try:
        from google.cloud import storage
        client = storage.Client()
        bucket_obj = client.bucket(bucket)

        files_to_download = [
            ("data/refined_jobs.json",   "data/cleaned/refined_jobs.json"),
            ("vector/faiss_index.faiss", "data/vector/faiss_index.faiss"),
            ("vector/metadata.pkl",      "data/vector/metadata.pkl"),
            ("models/xgboost.pkl",       "models/xgboost.pkl"),
        ]

        for gcs_path, local_path in files_to_download:
            local = Path(local_path)
            if not local.exists():
                local.parent.mkdir(parents=True, exist_ok=True)
                blob = bucket_obj.blob(gcs_path)
                blob.download_to_filename(str(local))
                logger.info(f"✅ Downloaded {gcs_path} dari GCS")

    except Exception as e:
        logger.warning(f"⚠️ GCS download gagal: {e}. Menggunakan file lokal jika ada.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 SkillBridge AI Backend starting up...")
    _download_from_gcs_if_needed()  # ← tambahkan baris ini di awal lifespan
    # ... sisa kode startup tidak perlu diubah
```

---

## Update CORS untuk Production

Di `main.py`, tambahkan URL frontend production ke `allow_origins`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend.vercel.app",   # ← tambahkan URL frontend production
        os.getenv("FRONTEND_URL", ""),         # ← atau dari env var
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Estimasi Biaya (Cloud Run)

| Resource | Free Tier | Estimasi Biaya |
|---|---|---|
| Request | 2 juta/bulan | Gratis |
| CPU | 180,000 vCPU-sec/bulan | Gratis |
| Memory | 360,000 GB-sec/bulan | Gratis |
| Artifact Registry | 0.5 GB/bulan | Gratis |
| Cloud Storage | 5 GB/bulan | Gratis |
| **Total estimasi** | **Proyek kecil** | **~$0/bulan** |

> ℹ️ **NOTE**: Cold start pertama setelah scale-to-zero memakan ~30-60 detik karena loading SBERT model ke memori.
> Jika terlalu lama, set `--min-instances=1` (ada biaya tambahan ~$10/bulan).

---

## Troubleshooting

### Build gagal — PyTorch terlalu besar
```bash
# Gunakan versi CPU-only yang lebih kecil di requirements.txt
torch==2.5.1+cpu  # ~300MB vs ~2GB untuk versi GPU
```

### Cold start terlalu lambat
- Set `--min-instances=1` untuk keep-warm instance
- Atau implementasi lazy loading: SBERT hanya di-load saat ada request pertama

### Out of Memory (OOM)
- Naikkan memory: `--memory=4Gi`
- SBERT butuh ~1.5GB, ditambah data jobs bisa mencapai 2-3GB total

### Error: "Permission denied" untuk Cloud Storage
```bash
# Grant akses ke service account default Cloud Run
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```
