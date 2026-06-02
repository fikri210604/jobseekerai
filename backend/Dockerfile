# ============================================================
# JobSeeker AI — Backend Dockerfile
# Target: Google Cloud Run
# ============================================================

# ── Stage 1: Builder — install dependencies ────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system deps yang dibutuhkan oleh beberapa library (faiss, torch, pillow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements dan install ke virtual env
COPY requirements.txt .

# Install dependencies (tanpa dev tools agar image lebih kecil)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Pre-download SBERT model saat build (bukan saat cold start)
# Ini mencegah cold start yang lama di Cloud Run
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"


# ── Stage 2: Runtime — image akhir yang kecil ──────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages dari builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy model SBERT yang sudah di-download
COPY --from=builder /root/.cache/huggingface /root/.cache/huggingface

# Install runtime system libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy source code backend ke dalam folder /app/backend agar absolute import bekerja
COPY . /app/backend

# Port yang di-expose (Cloud Run default: 8080)
EXPOSE 8080

# Environment variables default (override via Cloud Run env vars)
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Tidak menggunakan HEALTHCHECK bawaan Docker karena Cloud Run sudah punya health check sendiri.
# HEALTHCHECK dihapus agar tidak menambah overhead saat startup.

# Start server
# --timeout-keep-alive 75 → lebih panjang dari Cloud Run request timeout (60s)
# --no-access-log       → kurangi log noise di Cloud Run
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --timeout-keep-alive 75
