"""
vector_store.py — Vector Store untuk Search & Retrieval tanpa FAISS.

Peran script ini adalah sebagai 'Server/Engine' untuk melayani pencarian secara semantik.
Jika file embedding belum ada, sistem akan otomatis men-generate-nya (butuh waktu 1-2 menit pada run pertama)
dan menyimpannya sebagai file `.npy` untuk mempercepat run selanjutnya.

Penggunaan:
    from services.vector_store import vector_store
    vector_store.load_index()
    results = vector_store.search("Data Analyst SQL Jakarta", top_k=10)
"""

import os
import json
import logging
import numpy as np
from tqdm import tqdm
from collections import Counter
import statistics
from sklearn.metrics.pairwise import cosine_similarity

from backend.models.embedder import embedder

logger = logging.getLogger(__name__)

# ── Konstanta ──────────────────────────────────────────────────────────────────
_BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
_ROOT_DIR    = os.path.join(_BASE_DIR, "..")
_DATA_DIR    = os.path.join(_ROOT_DIR, "data", "cleaned")
_JOBS_PATH   = os.path.join(_DATA_DIR, "refined_jobs.json")
_NPY_PATH    = os.path.join(_ROOT_DIR, "data", "retrieval", "sbert_embeddings.npy")


# ==============================================================================
# VectorStore — Class Utama
# ==============================================================================

class VectorStore:
    """
    Engine pencarian semantik menggunakan NumPy & Cosine Similarity untuk lowongan kerja.

    Alur kerja:
        1. load_index()      → muat dataset json & numpy embedding ke memori (sekali saat startup)
        2. search()          → entry point pencarian utama
        3. get_index_stats() → utilitas health check / dashboard
    """

    def __init__(self, jobs_path: str = _JOBS_PATH, npy_path: str = _NPY_PATH) -> None:
        self.jobs_path = jobs_path
        self.npy_path  = npy_path
        self._jobs: list[dict]              = []
        self._embeddings: np.ndarray | None = None


    # ──────────────────────────────────────────────────────────────────────────
    # 1. INISIALISASI & PEMUATAN RESOURCE
    # ──────────────────────────────────────────────────────────────────────────

    def load_index(self) -> bool:
        """
        Muat dataset dan embedding dari disk ke memori.
        Jika embedding belum ada, akan di-generate otomatis.

        Returns:
            True jika berhasil, False jika dataset tidak ditemukan.
        """
        if not os.path.exists(self.jobs_path):
            logger.error(
                f"Dataset lowongan tidak ditemukan di: {self.jobs_path}\n"
                f"Harap pastikan ETL pipeline telah dijalankan."
            )
            return False

        # Load dataset asli
        with open(self.jobs_path, "r", encoding="utf-8") as f:
            self._jobs = json.load(f)

        # Load atau generate embeddings
        if os.path.exists(self.npy_path):
            logger.info("Memuat SBERT embeddings dari file .npy...")
            self._embeddings = np.load(self.npy_path)
            
            # Jika jumlah data berubah, re-encode
            if len(self._embeddings) != len(self._jobs):
                logger.warning("Jumlah embedding tidak sesuai dengan jumlah lowongan. Melakukan re-encoding...")
                self._embeddings = self._generate_embeddings()
        else:
            logger.info("File .npy tidak ditemukan. Membangun SBERT embeddings secara dinamis (~1-2 menit)...")
            self._embeddings = self._generate_embeddings()

        logger.info(f"✅ Vector Store siap: {len(self._jobs)} vektor siap dicari.")
        return True

    def _generate_embeddings(self, batch_size: int = 32) -> np.ndarray:
        """Generate vektor SBERT untuk seluruh lowongan dan simpan ke disk menggunakan batch."""
        texts = []
        for j in self._jobs:
            # Gunakan gabungan Title, Company, Location, dan Description untuk konteks SBERT
            text = f"{j.get('title','')} {j.get('company_name','')} {j.get('location','')} {j.get('description','')}"
            texts.append(text)
            
        logger.info(f"🚀 Memulai embedding {len(texts):,} teks dalam batch {batch_size}...")
        
        all_embeddings = []
        # Encode dalam batch dengan progress bar
        for i in tqdm(range(0, len(texts), batch_size), desc="Encoding Batches"):
            batch = texts[i : i + batch_size]
            vecs = embedder.encode(batch)
            all_embeddings.append(vecs)
            
        self._embeddings = np.vstack(all_embeddings).astype("float32")
        
        # Simpan ke .npy agar load berikutnya instant
        os.makedirs(os.path.dirname(self.npy_path), exist_ok=True)
        np.save(self.npy_path, self._embeddings)
        logger.info(f"✅ Embedding selesai! Shape: {self._embeddings.shape}")
        logger.info(f"✅ Embeddings berhasil disimpan di {self.npy_path}")
        
        return self._embeddings

    # ──────────────────────────────────────────────────────────────────────────
    # 2. PENCARIAN (PUBLIC)
    # ──────────────────────────────────────────────────────────────────────────

    def search(
        self,
        query_text: str,
        top_k: int       = 50,
        threshold: float = 0.3,
    ) -> list[dict]:
        """
        Cari Top-K lowongan yang paling relevan dengan teks query.

        Args:
            query_text: Teks query bebas dari user (contoh: 'Software Engineer Python')
            top_k:      Jumlah maksimal kandidat yang dikembalikan
            threshold:  Batas minimum similarity score (0.0 - 1.0)

        Returns:
            List dictionary lowongan kerja lengkap dengan 'similarity_score'.
        """
        if self._embeddings is None:
            logger.error("Vector index belum dimuat. Panggil load_index() terlebih dahulu saat startup.")
            return []

        # Encode query
        q_vec = embedder.encode([query_text])
        
        # Hitung similarity
        scores = cosine_similarity(q_vec, self._embeddings).flatten()
        
        # Ambil top-K
        top_idx = scores.argsort()[::-1][:top_k]
        
        results = []
        for i in top_idx:
            score = float(scores[i])
            if score < threshold:
                break # Karena array sudah di-sort descending, sisanya pasti lebih kecil
                
            job = dict(self._jobs[i])
            job["similarity_score"] = round(score, 4)
            # Normalisasi untuk menjaga kesamaan response dengan format FAISS sebelumnya
            job = self._normalize_result(job)
            results.append(job)

        logger.info(
            f"Semantic Search '{query_text[:40]}...' "
            f"→ Ditemukan {len(results)} hasil (threshold={threshold})"
        )
        return results

    def _normalize_result(self, job: dict) -> dict:
        # Flatten dan susun hanya field yang dibutuhkan untuk ditampilkan ke user via API
        return {
            "title"           : job.get("title", ""),
            "company_name"    : job.get("company_name", ""),
            "location"        : job.get("location", ""),
            "via"             : job.get("via", ""),
            "source_link"     : job.get("source_link", ""),
            "share_link"      : job.get("share_link", ""),
            "description"     : job.get("description", ""),
            "job_id"          : job.get("job_id", ""),
            "salary"          : job.get("detected_extensions", {}).get("salary", ""),
            "posted_at"       : job.get("detected_extensions", {}).get("posted_at", ""),
            "schedule_type"   : job.get("detected_extensions", {}).get("schedule_type", ""),
            "similarity_score": job.get("similarity_score", 0.0)
        }

    # ──────────────────────────────────────────────────────────────────────────
    # 3. UTILITAS PUBLIK
    # ──────────────────────────────────────────────────────────────────────────

    def get_index_stats(self) -> dict:
        """Mengembalikan statistik index yang sedang berjalan (untuk dashboard/health check)."""
        if self._embeddings is None:
            return {"status": "not_loaded", "total_vectors": 0}
        return {
            "status":         "loaded",
            "total_vectors":  len(self._embeddings),
            "dimension":      self._embeddings.shape[1] if len(self._embeddings) > 0 else 0,
            "jobs_count":     len(self._jobs),
        }

vector_store = VectorStore()

def load_index(jobs_path: str = _JOBS_PATH, npy_path: str = _NPY_PATH) -> bool:
    return vector_store.load_index()

def search(query_text: str, top_k: int = 50, threshold: float = 0.3) -> list[dict]:
    return vector_store.search(query_text, top_k, threshold)

def get_index_stats() -> dict:
    return vector_store.get_index_stats()

if __name__ == "__main__":
    # Smoke Test Sederhana
    logging.basicConfig(level=logging.INFO)
    print("--- Uji Coba Vector Store ---")
    if vector_store.load_index():
        contoh = vector_store.search("Data Analyst SQL Jakarta", top_k=3)
        print(f"\nTop Hasil Pencarian:")
        for r in contoh:
            print(f"[{r.get('similarity_score')}] {r.get('title')} @ {r.get('company_name')}")
