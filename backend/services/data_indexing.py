from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
import re
import os

CLEANED_DATA_PATH = "../data/cleaned/cleaned_jobs.json"
REFINED_DATA_PATH = "../data/cleaned/refined_jobs.json"
FAISS_INDEX_PATH = "../data/vector/faiss_index.bin"
MAPPING_PATH = "../data/vector/job_mapping.json"

os.makedirs("../data/vector", exist_ok=True)

with open(CLEANED_DATA_PATH, "r", encoding="utf-8") as f:
    cleaned_jobs = json.load(f)

print(f"Total jobs dimuat: {len(cleaned_jobs)}")

def parse_single_salary_part(part_str):
    match = re.search(r"([\d\.,]+)\s*(jt|juta|rb|ribu)?", part_str)
    if not match:
        return None
    val_str, suffix = match.groups()
    try:
        if suffix in ["jt", "juta"]:
            num = float(val_str.replace(",", ".")) * 1_000_000
        elif suffix in ["rb", "ribu"]:
            num = float(val_str.replace(",", ".")) * 1_000
        else:
            cleaned_val = val_str.replace(".", "").replace(",", ".")
            num = float(cleaned_val)
        return num
    except ValueError:
        return None

def refine_job_data(raw_jobs):
    from backend.utils.skill_normalizer import normalize_skill
    refined_data = []
    
    for job in raw_jobs:
        # 1. Skip data yang tidak valid
        if not job.get("is_valid_job", True):
            continue
            
        extensions_str = " ".join(job.get("extensions", [])).lower()
        
        # 2. Ekstrak & Konversi Gaji
        # Reset jika ada nilai anomali (misal: angka sangat kecil seperti 6 rupiah dari "6 hari yang lalu")
        sal_min = job.get("salary_min", 0)
        sal_max = job.get("salary_max", 0)
        if 0 < sal_min < 100000:
            sal_min = 0
        if 0 < sal_max < 100000:
            sal_max = 0
            
        job["salary_min"] = sal_min
        job["salary_max"] = sal_max

        # Cek jika AI gagal mengekstrak gaji (salah satu bernilai 0), maka kita fallback ke regex dari extensions
        if sal_min == 0 or sal_max == 0:
            # Cari baris salary di extensions secara spesifik agar tidak terganggu oleh "3 hari yang lalu" atau "6 hari yang lalu"
            extensions = job.get("extensions", [])
            salary_str = None
            for ext in extensions:
                ext_lower = ext.lower()
                # Gaji di Google Jobs biasanya diawali "rp" atau mengandung "jt", "juta", "rb", "ribu" dengan "per"
                if "rp" in ext_lower or "idr" in ext_lower or any(p in ext_lower for p in ["per bulan", "per hari", "per minggu", "per jam", "per tahun"]):
                    salary_str = ext_lower
                    break
            
            if salary_str:
                clean_str = salary_str.replace('\xa0', ' ').replace('\u200b', '')
                clean_str = clean_str.replace("–", "-").replace("—", "-").replace("sampai", "-").replace("s/d", "-").replace("s.d.", "-")
                
                salary_parts = []
                if "-" in clean_str:
                    parts = clean_str.split("-")
                    for part in parts:
                        val = parse_single_salary_part(part)
                        if val is not None:
                            salary_parts.append(val)
                else:
                    val = parse_single_salary_part(clean_str)
                    if val is not None:
                        salary_parts.append(val)
                
                if salary_parts:
                    multiplier = 1
                    if "per hari" in clean_str or "perhari" in clean_str:
                        multiplier = 22
                    elif "per minggu" in clean_str or "perminggu" in clean_str:
                        multiplier = 4
                    elif "per jam" in clean_str or "perjam" in clean_str:
                        # Asumsi 8 jam per hari, 22 hari kerja per bulan
                        multiplier = 8 * 22
                    elif "per tahun" in clean_str or "pertahun" in clean_str:
                        multiplier = 1 / 12
                    else:
                        multiplier = 1
                    
                    parsed_min = int(min(salary_parts) * multiplier)
                    parsed_max = int(max(salary_parts) * multiplier)
                    
                    if len(salary_parts) == 1:
                        if job.get("salary_min", 0) > 0:
                            job["salary_max"] = max(job["salary_min"], parsed_min)
                        elif job.get("salary_max", 0) > 0:
                            job["salary_min"] = min(job["salary_max"], parsed_min)
                        else:
                            job["salary_min"] = parsed_min
                            job["salary_max"] = parsed_max
                    else:
                        job["salary_min"] = parsed_min
                        job["salary_max"] = parsed_max

        # 3. Koreksi Anomali Pengalaman Kerja (Consistency Corrector)
        exp = job.get("min_experience_years", 0)
        seniority = job.get("seniority_level", "Entry").lower()
        emp_type = job.get("employment_type", "Full-time").lower()
        
        # Koreksi jika diinput dalam satuan hari (misal 722 hari -> 2 tahun)
        if exp > 50:
            exp = int(exp / 365)
            
        # Koreksi konsistensi berdasarkan tipe pekerjaan & tingkat seniority
        if emp_type == "internship":
            exp = 0  # Magang secara logis tidak membutuhkan pengalaman tahunan
        elif seniority in ["entry", "junior"]:
            if exp > 3:
                # Junior/Entry yang salah parse (>3 tahun), biasanya aslinya adalah 0 atau 1 tahun
                exp = 0 if seniority == "entry" else 1 
        elif seniority == "mid":
            if exp > 6:
                exp = 3  # Mid-level wajarnya 2-5 tahun
        elif seniority in ["senior", "lead", "manager"]:
            if exp > 15:
                exp = 5  # Senior wajarnya 5-10 tahun, >15 tahun kemungkinan besar salah parse
                
        job["min_experience_years"] = exp
            
        # 4. Standarisasi Tipe Pekerjaan
        desc_lower = job.get("description", "").lower()
        
        if "freelance" in extensions_str or "lepas" in extensions_str or "freelance" in desc_lower:
            job["employment_type"] = "Freelance"
        elif "magang" in extensions_str or "internship" in extensions_str or "intern" in desc_lower:
            job["employment_type"] = "Internship"
        elif "paruh waktu" in extensions_str or "part time" in extensions_str or "paruh waktu" in desc_lower:
            job["employment_type"] = "Part-time"
        elif "tetap" in extensions_str or "full time" in extensions_str or "karyawan tetap" in desc_lower:
            job["employment_type"] = "Full-time"
        elif "kontrak" in extensions_str or "contract" in extensions_str or "kontrak" in desc_lower:
            job["employment_type"] = "Contract"

        # 5. Normalisasi Skills (Menggunakan skill_normalizer)
        job["hard_skills"] = list(set([
            normalize_skill(s) for s in job.get("hard_skills", []) 
            if len(s.split()) <= 4 and len(s) > 2
        ]))
        
        job["soft_skills"] = list(set([
            normalize_skill(s) for s in job.get("soft_skills", []) 
            if len(s.split()) <= 3 and len(s) > 2
        ]))
        
        job["original_salary_str"] = next((s for s in job.get("extensions", []) if "rp" in s.lower()), None)
        refined_data.append(job)
        
    return refined_data

# 2. Bersihkan datanya
final_ready_jobs = refine_job_data(cleaned_jobs)

# 3. Simpan kembali untuk digunakan oleh SBERT/FAISS
with open(REFINED_DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(final_ready_jobs, f, indent=2, ensure_ascii=False)

print(f"Data berhasil dibersihkan! Tersisa {len(final_ready_jobs)} loker valid.")

# Model multilingual — cocok untuk teks Bahasa Indonesia
SBERT_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
BATCH_SIZE       = 64

print(f"🚀 Memuat model SBERT: '{SBERT_MODEL_NAME}'...")
sbert_model = SentenceTransformer(SBERT_MODEL_NAME)
print(f"✅ Model berhasil dimuat.")

def build_job_text(job):
    def to_str(val):
        if isinstance(val, list):
            return " ".join([str(v) for v in val if v])
        return str(val) if val else ""

    parts = [
        to_str(job.get("cleaned_title", "")),
        to_str(job.get("job_category", "")),
        to_str(job.get("job_subcategory", "")),  
        to_str(job.get("hard_skills", [])),
        to_str(job.get("soft_skills", [])),
        to_str(job.get("job_responsibilities", [])),
    ]
    return " ".join([p for p in parts if p.strip()]).strip()

texts = [build_job_text(job) for job in final_ready_jobs]
print(f"✅ Berhasil memproses {len(texts)} teks.")

mapping = [
    {
        "index": i,
        "job_id": job.get("job_id", ""),
        "title": job.get("cleaned_title", ""),
        "company": job.get("company_name", ""),
        "location": job.get("location", ""),  
        "education_level": job.get("education_level"),
        "min_experience_years": job.get("min_experience_years"),
        "salary_min": job.get("salary_min"),
        "salary_max": job.get("salary_max"),
        "work_arrangement": job.get("work_arrangement"),
        "seniority_level": job.get("seniority_level"),
        "employment_type": job.get("employment_type"),
        "job_category": job.get("job_category"),
        "job_subcategory": job.get("job_subcategory"),
        "hard_skills": job.get("hard_skills", []),
        "soft_skills": job.get("soft_skills", []),
    }
    for i, job in enumerate(final_ready_jobs)
]
print("Proses embedding batch SBERT...")
embeddings = sbert_model.encode(
    texts, 
    batch_size=BATCH_SIZE, 
    show_progress_bar=True, 
    normalize_embeddings=True
)
print(f"✅ Proses embedding selesai.")

dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings.astype("float32"))
faiss.write_index(index, FAISS_INDEX_PATH)
print(f"✅ Index FAISS tersimpan: {FAISS_INDEX_PATH}")
print(f"   Total vektor diindex: {index.ntotal}")

with open(MAPPING_PATH, "w", encoding="utf-8") as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)
print(f"✅ Mapping tersimpan: {MAPPING_PATH}")

with open(MAPPING_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"Total data yang berhasil diindex : {len(data)}")
