import os
import json
import logging
import asyncio
import time
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
import ollama
import re
from backend.prompts.etl_pipeline import build_etl_extraction_prompt

# Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Konfigurasi Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DATA_DIR = os.path.join(BASE_DIR, "..", "data", "raw")
SCRAP_DATA_DIR = os.path.join(BASE_DIR, "..", "data", "scrap")

RAW_JOBS_PATH = os.path.join(RAW_DATA_DIR, "google_jobs_results.json")
# Fallback jika file tidak ada di data/raw/
if not os.path.exists(RAW_JOBS_PATH):
    # Cek di folder scrap lama atau root
    scrap_path = os.path.join(SCRAP_DATA_DIR, "google_jobs_results.json")
    if os.path.exists(scrap_path):
        RAW_JOBS_PATH = scrap_path
    else:
        RAW_JOBS_PATH = os.path.normpath(os.path.join(BASE_DIR, "..", "google_jobs_results.json"))

CLEANED_JOBS_PATH = os.path.join(SCRAP_DATA_DIR, "google_jobs_cleaned.json")

# Load environment
load_dotenv()

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL") or "gemma2:2b"

class JobExtraction(BaseModel):
    is_valid_job: bool = Field(description="Apakah ini lowongan kerja asli (bukan spam/artikel)")
    required_skills: List[str] = Field(default_factory=list, description="Daftar keahlian yang diekstrak")


def local_heuristic_check(title: str, description: str) -> bool:
    """
    Layer 1: Filter spam sederhana secara lokal.
    Mengembalikan True jika lowongan terlihat valid, False jika spam/artikel.
    """
    text = (title + " " + description).lower()
    
    # Kata kunci yang sering muncul di artikel spam/blog bukan lowongan
    spam_keywords = ["resep", "cara memasak", "film sub", "download gratis", "baca selengkapnya", "manfaat buah"]
    if any(k in text for k in spam_keywords):
        return False
    
    # Jika deskripsi terlalu pendek, kemungkinan besar bukan info lowongan berkualitas
    if len(description) < 100:
        return False
        
    return True

async def process_single_job(job: dict, index: int, total: int, semaphore: asyncio.Semaphore):
    """Memproses satu lowongan secara asinkron dengan kontrol rate limit via Semaphore."""
    async with semaphore:
        title = job.get("title", "Unknown Title")
        company = job.get("company_name", "Unknown Company")
        desc = job.get("description", "")

        if not title and not desc:
            return None

        # ── Layer 1: Local Heuristic Spam Check ───────────────────────────────
        if not local_heuristic_check(title, desc):
            logger.warning(f"[{index+1}/{total}] ❌ BLOCKED (Heuristic): {title[:30]}")
            return None

        # ── Layer 2: Gemini Extraction (Pusat Perapihan Data) ─────────────────
        prompt = build_etl_extraction_prompt(
            title=title,
            company=company,
            description=desc
        )

        try:
            client = ollama.AsyncClient()
            response = await client.chat(
                model=OLLAMA_MODEL,
                messages=[
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            )
            
            # Sanitasi teks (antisipasi LLM nakal)
            clean_json_text = response['message']['content'].replace("```json", "").replace("```", "").strip()
            
            try:
                extraction = JobExtraction.model_validate_json(clean_json_text)
            except ValidationError:
                # Coba cari blok JSON dengan regex jika kotor
                match = re.search(r'\{.*\}', clean_json_text, re.DOTALL)
                if match:
                    extraction = JobExtraction.model_validate_json(match.group(0))
                else:
                    raise

            if extraction.is_valid_job and len(extraction.required_skills) > 0:
                # Update metadata tanpa menghapus data asli (preservasi Salary, dsb)
                job["required_skills"] = [s.strip().title() for s in extraction.required_skills]
                
                # Enrichment: Tambah konteks semantik untuk SBERT
                job["semantic_context"] = f"{title} di {company}. Keahlian: {', '.join(job['required_skills'])}"
                
                logger.info(f"[{index+1}/{total}] ✅ VALID: {title[:30]}")
                return job
            else:
                logger.warning(f"[{index+1}/{total}] ❌ SKIPPED: {title[:30]}")
                return None

        except Exception as e:
            logger.error(f"[{index+1}/{total}] ⚠️ Error: {str(e)}")
            return None

async def run_etl():
    if not os.path.exists(RAW_JOBS_PATH):
        logger.error(f"File raw data tidak ditemukan: {RAW_JOBS_PATH}")
        return

    with open(RAW_JOBS_PATH, "r", encoding="utf-8") as f:
        all_jobs = json.load(f)

    logger.info(f"Memulai ETL Asinkron untuk {len(all_jobs)} lowongan...")
    
    # Batasi konkurensi (misal 5-10 request sekaligus) agar tidak terkena Rate Limit Tier Gratis
    semaphore = asyncio.Semaphore(10)
    
    tasks = [
        process_single_job(job, i, len(all_jobs), semaphore) 
        for i, job in enumerate(all_jobs)
    ]
    
    results = await asyncio.gather(*tasks)
    
    # Filter hasil yang None
    cleaned_jobs = [r for r in results if r is not None]

    logger.info(f"ETL SELESAI. Berhasil memproses {len(cleaned_jobs)} lowongan valid.")

    os.makedirs(os.path.dirname(CLEANED_JOBS_PATH), exist_ok=True)
    with open(CLEANED_JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_jobs, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Data bersih disimpan di: {CLEANED_JOBS_PATH}")

if __name__ == "__main__":
    start_time = time.time()
    asyncio.run(run_etl())
    elapsed = time.time() - start_time
    print(f"\n⏱️  Total waktu eksekusi: {elapsed:.2f} detik")
