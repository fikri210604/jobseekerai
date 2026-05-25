# backend/prompts/etl_pipeline.py
"""
Prompt untuk ETL job extraction — mengekstrak keahlian dan validasi lowongan.
"""

ETL_EXTRACTION_PROMPT = """
Kamu adalah sistem ekstraksi data lowongan kerja. 
Tugasmu HANYA mengekstrak informasi dalam format JSON.
Jangan tambahkan penjelasan apapun. Hanya output JSON.

Keluarkan output dalam format JSON valid. Format wajib:
{{
  "is_valid_job": true/false,
  "required_skills": ["Python", "SQL", ...]
}}

Aturan:
1. Jika teks adalah artikel, spam, atau "loker palsu", set "is_valid_job" ke false.
2. Jika lowongan asli, ekstrak semua hard skills dan tools yang disebutkan.
3. Hanya berikan JSON murni, tanpa backticks markdown (```json), tanpa penjelasan tambahan di awal atau akhir.

### Contoh 1:
Judul: Data Analyst - PT Astra International
Perusahaan: PT Astra International
Deskripsi: Mencari kandidat yang menguasai SQL, Python, dan Power BI. Pengalaman dengan Tableau menjadi nilai tambah.
Output: {{"is_valid_job": true, "required_skills": ["SQL", "Python", "Power BI", "Tableau"]}}

### Contoh 2:
Judul: Loker Supir Truk Langsung Kerja
Perusahaan: Unknown Company
Deskripsi: Dibutuhkan supir truk berpengalaman min 2 tahun. SIM B1. Gaji pokok Rp 4 juta.
Output: {{"is_valid_job": true, "required_skills": ["SIM B1"]}}

### Contoh 3:
Judul: LOKER TERBARU BISA TANPA IJAZAH
Perusahaan: Unknown Company
Deskripsi: Klik link berikut untuk info lebih lanjut...
Output: {{"is_valid_job": false, "required_skills": []}}

### Ekstrak Lowongan Berikut:
Judul: {title}
Perusahaan: {company}
Deskripsi: {description}
Output:
""".strip()


def build_etl_extraction_prompt(
    title: str,
    company: str,
    description: str,
) -> str:
    """
    Membangun prompt untuk ekstraksi data lowongan kerja.
    """
    return ETL_EXTRACTION_PROMPT.format(
        title=title,
        company=company,
        description=description[:2000]  # Limit description length
    )
