# JobSeeker AI — Intelligent Career Advisor & Job Matching Platform

**Mata Kuliah:** Proyek Spesial Data Science — Semester 6  
**Stack:** Python 3.11+ · FastAPI · Next.js 16 · Google Gemini 2.5 Flash · SBERT · Scikit-learn

> **Catatan untuk AI Coding Agent:** README ini adalah **sumber kebenaran arsitektur**. Baca seluruh dokumen sebelum membuat perubahan apapun pada codebase.

---

## Latar Belakang

Pasar kerja Indonesia tengah menghadapi tantangan struktural yang kompleks di tengah akselerasi transformasi digital. Berdasarkan data Badan Pusat Statistik (BPS) tahun 2024, tingkat pengangguran terbuka di Indonesia masih berada di kisaran 4,8%, dengan jumlah angkatan kerja yang terus meningkat setiap tahunnya. Di sisi lain, laporan *LinkedIn Emerging Jobs Indonesia 2023* mencatat pertumbuhan signifikan permintaan tenaga kerja di bidang teknologi, data, dan digital marketing — namun terdapat kesenjangan (*mismatch*) yang nyata antara kompetensi pencari kerja dengan kebutuhan industri.

Fenomena *skill mismatch* ini diperparah oleh keterbatasan platform pencari kerja konvensional yang ada saat ini. Platform seperti Jobstreet, Glints, atau LinkedIn umumnya mengandalkan mekanisme pencarian berbasis kata kunci (*keyword-based search*). Pendekatan ini secara inheren memiliki kelemahan mendasar: ia tidak mampu memahami **konteks semantik** dari profil pengguna maupun deskripsi pekerjaan. Akibatnya, seorang *software engineer* yang mahir dalam "pengembangan aplikasi web" bisa luput dari rekomendasi lowongan yang mencari "full-stack developer", meskipun keduanya secara kompetensi saling bersesuaian.

Lebih jauh, platform konvensional umumnya tidak menyediakan umpan balik (*feedback*) yang actionable bagi pencari kerja — seperti identifikasi *skill gap* spesifik terhadap suatu posisi, saran roadmap pengembangan diri, atau narasi karir yang dipersonalisasi. Pencari kerja hanya menerima daftar lowongan tanpa panduan konkret mengenai langkah yang perlu diambil untuk meningkatkan kelayakan (*employability*) mereka.

Perkembangan pesat di bidang *Natural Language Processing* (NLP) dan *Generative AI* membuka peluang baru untuk mengatasi keterbatasan tersebut. Model *Sentence-BERT* (SBERT) memungkinkan representasi teks dalam ruang vektor berdimensi tinggi sehingga kemiripan semantik antar dokumen dapat dihitung secara efisien. Sementara itu, *Large Language Models* (LLM) seperti Google Gemini mampu menghasilkan analisis dan narasi yang kontekstual, personal, dan informatif.

**JobSeeker AI** dibangun sebagai respons atas kebutuhan tersebut — sebuah platform *intelligent career advisor* berbasis AI yang mengintegrasikan **semantic search** (SBERT) dan **machine learning hybrid scoring** (Logistic Regression / Random Forest / XGBoost) untuk menghasilkan rekomendasi pekerjaan yang akurat dan transparan, serta memanfaatkan **Google Gemini 2.5 Flash** secara khusus sebagai *career advisor* — untuk menghasilkan narasi karir, analisis *skill gap*, dan saran pengembangan diri yang dipersonalisasi bagi setiap pengguna. Platform ini dirancang khusus untuk pasar kerja Indonesia dengan dukungan pemrosesan teks dwibahasa (Indonesia & Inggris).

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
| **MLflow** | 3.13.0 | Experiment tracking, metric logging, artifact logging, dan model registry |
| **DagsHub SDK** | 0.7.0 | Menghubungkan MLflow ke remote repository DagsHub |
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
| **DagsHub** | Remote experiment dashboard, artifact storage, dan model registry |

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
                      │  - DagsHub + MLflow (ML Tracking)    │
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
│  │  models/*.pkl — dilatih dari 60.940 pair user-job (5-Fold CV) │ │
│  │  - Logistic Regression  ← baseline linear                     │ │
│  │  - Random Forest        ← alternatif ensemble                 │ │
│  │  - XGBoost              ← default aktif                       │ │
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

#### Penjelasan Tahapan Pipeline 1

**Layer 1 — Heuristic Scoring (Bobot: 0.60)**

Layer ini menghitung skor kecocokan awal (*baseline score*) berdasarkan aturan domain yang telah ditentukan (*rule-based scoring*). Setiap pasangan user-job dievaluasi menggunakan lima komponen dengan bobot berbeda:

| Komponen | Bobot | Cara Kerja |
|---|---|---|
| **Category Match** | 35% | Kecocokan kategori industri preferensi user dengan kategori pekerjaan. Bersifat biner (0 atau 1). |
| **Skill Overlap** | 40% | Proporsi *hard skills* yang dimiliki user terhadap yang dibutuhkan job. Dihitung sebagai `|user_skills ∩ job_skills| / |job_skills|`. |
| **Experience** | 15% | Kesesuaian tahun pengalaman user terhadap kebutuhan job. Bernilai eksponensial: `exp(-|gap|/3)`, semakin kecil gap semakin tinggi skor. |
| **Education** | 5% | Kecukupan jenjang pendidikan user terhadap kebutuhan job. Bernilai 1 jika pendidikan user ≥ kebutuhan, 0.5 jika selisih 1 level, 0 jika selisih >1 level. |
| **Salary** | 5% | Kesesuaian ekspektasi gaji user terhadap rentang gaji yang ditawarkan. Dihitung via rasio gaji yang di-*clip* ke rentang [0,1]. |

Skor heuristik akhir merupakan rata-rata tertimbang dari kelima komponen di atas, menghasilkan nilai antara 0 hingga 1.

**Layer 2 — ML Prediction (Bobot: 0.40)**

Layer ini menggunakan model *machine learning* yang telah dilatih sebelumnya untuk memprediksi probabilitas kecocokan user-job. Model dilatih di `modelling.ipynb` menggunakan **pairwise dataset** sebanyak **60.940 pasangan user-job** dengan fitur-fitur tabular seperti `skill_coverage`, `category_match`, `exp_gap_normalized`, `salary_ratio`, dan lainnya (lihat bagian Modeling untuk detail).

Tiga model disediakan dan dipilih secara konfigurasi:

| Model | Akurasi Test | Karakteristik |
|---|---|---|
| **Logistic Regression** | 66,37% | Interpretable, cepat, dan digunakan sebagai baseline |
| **Random Forest** | 69,68% | Menangkap interaksi non-linear melalui ensemble pohon |
| **XGBoost** (default) | 69,90% | Akurasi test tertinggi dan dimuat oleh `matcher_service.py` |

Model mengembalikan probabilitas kelas positif (*match*) sebagai *ML Score*.

**Fusion Score**

Skor akhir merupakan kombinasi linear dari kedua layer:

```
Fusion Score = (0.60 × Heuristic Score) + (0.40 × ML Score)
```

Pendekatan hibrid ini menggabungkan keunggulan *rule-based* (stabil, dapat dijelaskan) dan *machine learning* (adaptif, menangkap pola kompleks). Jika model ML gagal dimuat (misal file `.pkl` corrupt), sistem akan *fallback* ke pure heuristic scoring tanpa error.

**Layer 3 — Gemini AI Career Advisor**

Layer ini bersifat opsional dan dipanggil secara terpisah via endpoint `/api/v1/advisor/career`. Setelah pengguna menerima daftar rekomendasi pekerjaan, Gemini AI menghasilkan tiga output naratif:

1. **Career Narrative** — Ringkasan profil pengguna dan potensi karir berdasarkan hasil matching.
2. **Skill Roadmap** — Rekomendasi skill yang perlu dipelajari atau ditingkatkan untuk posisi target, diurutkan berdasarkan prioritas.
3. **Cover Letter Opening** — Pembuka surat lamaran yang dipersonalisasi untuk lowongan teratas.

Layer ini menggunakan **Google Gemini 2.5 Flash** melalui `gemini_service.py` dan prompt templates di `backend/prompts/`.

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
│  - Setiap hasil: judul, perusahaan, lokasi, link, similarity score │
└─────────────────────────────────────────────────────────────────────┘
```

#### Penjelasan Tahapan Pipeline 2

**Input — Query Teks Bebas**

Pengguna memasukkan teks natural language dalam Bahasa Indonesia, Inggris, atau campuran keduanya. Contoh: *"data engineer yang bisa Python dan SQL"* atau *"marketing digital jakarta remote"*. Tidak ada format khusus atau kata kunci tertentu yang diharuskan.

**Step 1 — Text Encoding (SBERT)**

Query teks diubah menjadi representasi vektor (*dense vector*) berdimensi 384 menggunakan model **SBERT `paraphrase-multilingual-MiniLM-L12-v2`** melalui `backend/models/embedder.py`. Model ini mendukung multilingual (Indonesia & Inggris) dalam satu ruang vektor yang sama, sehingga pencarian tetap akurat meskipun query menggunakan bahasa campuran.

Proses encoding berlangsung *on-the-fly* setiap kali request masuk — tidak ada pre-computed index untuk query.

**Step 2 — Cosine Similarity Search (NumPy)**

Vektor query dibandingkan dengan seluruh vektor pekerjaan yang telah di-*pre-compute* dan disimpan di `sbert_embeddings.npy` (1.491 embedding). Perbandingan dilakukan dengan **cosine similarity** menggunakan NumPy:

```
similarity = dot(query_vec, job_vec) / (||query_vec|| × ||job_vec||)
```

Hasilnya difilter berdasarkan threshold minimum (default: 0.3) untuk menghilangkan hasil dengan relevansi rendah, kemudian diurutkan menurun berdasarkan skor similarity.

**Output — SearchResponse**

Daftar lowongan dikembalikan dalam bentuk JSON yang mencakup judul, perusahaan, lokasi, deskripsi, link sumber, metadata posting, dan skor similarity. Hasil diurutkan dari yang paling relevan secara semantik.

> **Catatan Teknis:** Implementasi awal menggunakan FAISS, namun diganti dengan NumPy cosine similarity karena FAISS memiliki *dependency binary issue* pada Google Cloud Run. Performa untuk dataset ~1.491 jobs tetap optimal dengan pendekatan NumPy.

---

## Retrieval — Pencarian Lowongan

Sistem retrieval digunakan untuk mencari lowongan berdasarkan **makna dari kalimat pengguna**, bukan hanya berdasarkan kata yang sama persis. Pengembangannya dilakukan di `backend/services/retrieval_pipeline.ipynb` dengan membandingkan TF-IDF dan SBERT, sedangkan pencarian pada aplikasi dijalankan oleh `backend/services/vector_store.py`.

```text
Data mentah Google Jobs (4.911)
        |
        v
Hapus lowongan duplikat (1.868)
        |
        v
Buang data kosong dan spam (1.782)
        |
        +----------------+
        v                v
TF-IDF              SBERT
Pencarian kata      Pencarian makna
        |                |
        +--------+-------+
                 v
Bandingkan hasil kedua metode
                 |
                 v
SBERT memberikan hasil terbaik
                 |
                 v
API: Query -> SBERT -> Hitung kemiripan -> Hasil terbaik
```

### Tahapan Pengembangan

#### 1. Menyiapkan Library

Notebook memuat library untuk pengolahan data, pembersihan teks, pembuatan model pencarian, dan visualisasi. NLTK dan PySastrawi digunakan untuk mengolah teks Bahasa Indonesia.

#### 2. Memuat dan Menghapus Data Duplikat

Sebanyak **4.911 lowongan** dibaca dari `backend/data/raw/google_jobs_results.json`. Lowongan dengan judul dan nama perusahaan yang sama dianggap duplikat, sehingga tersisa **1.868 lowongan unik**.

#### 3. Menyaring Data yang Tidak Layak

Data kosong, terlalu pendek, atau terindikasi spam dibuang sebelum masuk ke proses pencarian. Penyaringan ini menggunakan aturan sederhana dan tidak memakai LLM.

- Judul kosong atau memiliki kurang dari 8 karakter.
- Deskripsi kosong atau memiliki kurang dari 80 karakter.
- Judul atau deskripsi mengandung kata-kata spam dan konten yang bukan lowongan.
- Deskripsi hanya berisi nomor telepon tanpa informasi pekerjaan yang jelas.

Tahap ini membuang **86 data (4,6%)** dan menyisakan **1.782 lowongan**.

#### 4. Menyiapkan Teks Lowongan

Teks pencarian dibuat dengan menggabungkan `title`, `company_name`, `location`, dan `description`.

Untuk TF-IDF, teks diubah menjadi huruf kecil, dibersihkan dari HTML, URL, angka, dan tanda baca, kemudian kata-kata umum dibuang dan kata diubah ke bentuk dasarnya. SBERT menggunakan teks asli yang sudah digabungkan agar makna kalimat tetap terjaga.

#### 5. Membangun Pencarian TF-IDF

TF-IDF digunakan sebagai metode pembanding. Metode ini mencari lowongan berdasarkan kesamaan kata dan frasa antara query pengguna dan teks lowongan.

Konfigurasinya menggunakan maksimal 10.000 kata atau frasa dan menghasilkan matriks berukuran **1.782 x 10.000**.

#### 6. Membangun Pencarian SBERT

Model `paraphrase-multilingual-MiniLM-L12-v2` mengubah setiap teks lowongan menjadi kumpulan **384 angka** yang mewakili maknanya. Sebanyak 1.782 lowongan diproses dalam kelompok berisi 64 data agar penggunaan memori lebih efisien.

Keunggulan SBERT adalah kemampuannya memahami kata atau kalimat yang berbeda tetapi memiliki arti serupa. Contohnya, query “pengembang aplikasi web” masih dapat menemukan lowongan “full-stack developer”.

#### 7. Membuat Fungsi Pencarian

Notebook menyediakan `search_tfidf()` dan `search_sbert()`. Kedua fungsi mengubah query ke bentuk angka, membandingkannya dengan seluruh lowongan, lalu mengurutkan hasil berdasarkan tingkat kemiripan.

TF-IDF menggunakan batas skor awal `0.01`, sedangkan SBERT menggunakan `0.3`. Hasil dengan skor tertinggi ditampilkan lebih dahulu.

#### 8. Menguji dan Membandingkan Model

Pengujian dilakukan menggunakan **12 contoh pencarian** dari berbagai bidang, seperti data, software, akuntansi, produksi, marketing, HR, administrasi, F&B, logistik, dan desain. Lima hasil teratas dari setiap query kemudian dibandingkan dengan daftar lowongan yang dianggap relevan.

| Model | MAP | NDCG@5 | Precision@5 |
|---|---:|---:|---:|
| **TF-IDF** | 0,3754 | 0,3259 | 0,3333 |
| **SBERT** | **0,4654** | **0,4792** | **0,4500** |

SBERT memperoleh nilai lebih tinggi pada seluruh metrik sehingga dipilih sebagai metode pencarian utama pada aplikasi.

> **Catatan:** Hasil ini masih merupakan evaluasi awal. Penilaian relevansi masih berdasarkan kemiripan judul, sehingga pengujian berikutnya sebaiknya menggunakan `job_id` unik agar hasil evaluasi lebih akurat.

#### 9. Menampilkan Hasil Evaluasi

Notebook menampilkan grafik perbandingan nilai kedua metode dan contoh tiga hasil terbaik dari beberapa query. Tahap ini membantu melihat perbedaan hasil TF-IDF dan SBERT secara langsung.

#### 10. Menyimpan Model

Model SBERT disimpan di `backend/data/retrieval/sbert_model_lokal/` agar backend dapat menggunakannya tanpa mengunduh ulang model.

File `retrieval_index.faiss` dan `retrieval_metadata.pkl` merupakan hasil implementasi lama dan tidak lagi digunakan oleh API terbaru.

### Alur Pencarian pada Aplikasi

Notebook menggunakan 1.782 data mentah yang sudah disaring untuk membandingkan TF-IDF dan SBERT. API menggunakan **1.491 data hasil ETL** karena data tersebut lebih bersih dan memiliki struktur yang konsisten.

```text
GET /api/v1/search?q=...&limit=10&threshold=0.3&province=...
        |
        v
Periksa query dan API key
        |
        v
Muat 1.491 lowongan dan representasi maknanya
        |
        v
Ubah query menjadi 384 angka dengan SBERT
        |
        v
Bandingkan query dengan seluruh lowongan
        |
        v
Buang hasil dengan skor rendah dan filter provinsi
        |
        v
Urutkan hasil dan kirim sebagai JSON
```

#### 1. Memuat Data saat Server Dijalankan

Saat FastAPI dijalankan, `vector_store.load_index()` memuat **1.491 lowongan** dari `refined_jobs.json` dan representasi maknanya dari `sbert_embeddings.npy`.

File tersebut memiliki ukuran **1.491 x 384**, yaitu satu baris untuk setiap lowongan dan 384 angka untuk mewakili maknanya. Jika jumlah data dan representasi tidak sesuai, sistem akan membuat ulang file tersebut secara otomatis.

#### 2. Memuat Model SBERT

Model baru dimuat ketika pertama kali dibutuhkan agar proses startup server tidak terlalu lama. Backend akan memakai model dari `sbert_model_lokal/`; jika tidak tersedia, model akan diunduh melalui Sentence Transformers.

#### 3. Mengubah Query Menjadi Angka

Kalimat pencarian pengguna, baik dalam Bahasa Indonesia, Inggris, maupun campuran, diubah oleh SBERT menjadi 384 angka. Query tidak melalui proses stemming agar makna kalimat tetap terjaga.

#### 4. Menghitung Kemiripan

Sistem membandingkan angka dari query dengan angka dari setiap lowongan menggunakan cosine similarity. Semakin tinggi nilainya, semakin mirip makna query dan lowongan tersebut.

```text
similarity = dot(query_vector, job_vector)
             / (norm(query_vector) x norm(job_vector))
```

#### 5. Menyaring Hasil

Lowongan dengan skor di bawah `threshold` tidak ditampilkan. Pengguna juga dapat membatasi pencarian berdasarkan provinsi, misalnya DKI Jakarta, Jawa Barat, atau Yogyakarta.

#### 6. Mengirim Hasil ke Pengguna

Sistem mengambil hasil terbaik sesuai nilai `limit`, dengan pilihan 1 sampai 50 lowongan. Hasil tersebut berisi judul, perusahaan, lokasi, deskripsi, link sumber, gaji, waktu posting, tipe pekerjaan, dan skor kemiripan.

API kemudian mengembalikannya dalam format `SearchResponse`, dimulai dari lowongan yang paling relevan.

> **Catatan implementasi:** Versi awal menggunakan FAISS, sedangkan versi terbaru menggunakan cosine similarity dari Scikit-learn. Pendekatan ini lebih mudah dijalankan di Cloud Run dan masih cukup cepat untuk 1.491 lowongan.

---

## Modeling — ML Training Pipeline

Proses training dilakukan di `backend/models/modelling.ipynb`; angka berikut mengacu pada **output eksekusi terakhir notebook**, bukan estimasi.

### 1. Setup Environment & Load Dataset

Notebook memuat library analisis/ML, konfigurasi `.env`, dan layanan tracking DagsHub, kemudian membaca **1.491 lowongan dengan 16 kolom** dari `backend/data/vector/job_mapping.json`.

### 2. Data Understanding & EDA

Tahap ini memeriksa schema melalui `df.info()`, memastikan tidak ada duplikasi berdasarkan `job_id`, `title`, dan `company`, menghitung statistik deskriptif, serta memvisualisasikan pengalaman-gaji, kategori pekerjaan, senioritas-gaji, dan work arrangement.

### 3. Data Preprocessing

Sebanyak **733 missing value** pada `education_level` diisi `Unknown`, **7 missing value** pada `job_subcategory` diisi `General`, dan lowongan dengan `salary_max > Rp100 juta` dibuang sehingga tersisa **1.484 lowongan**.

### 4. Synthetic User Generation

Notebook membuat **10 persona terkurasi** dan **190 profil hasil augmentasi acak** dari 7 kategori industri, sehingga tersedia **200 profil user sintetis** dengan atribut skill, pengalaman, pendidikan, preferensi gaji, kategori, dan sertifikasi.

### 5. Pairwise Dataset & Probabilistic Labeling

Setiap profil dipasangkan dengan lowongan, dihitung compatibility score berbobot, lalu target `is_match` dibuat menggunakan Bernoulli sampling dengan probabilitas 5%, 20%, 50%, atau 80% sesuai rentang skor dan dikoreksi menggunakan hard-negative rules.

### 6. Class Balancing & Feature Finalization

Kelas negatif di-downsample menjadi sekitar 1,2 kali kelas positif dengan mempertahankan hard negatives, menghasilkan **60.940 pasangan** yang terdiri dari **33.240 negatif (54,55%)** dan **27.700 positif (45,45%)**.

Dataset pairing awal memiliki 14 fitur, tetapi training final memakai 13 fitur berikut:

```text
skill_coverage, n_user_skills, category_match, exp_gap_raw,
exp_gap_normalized, user_exp_years, edu_gap, edu_sufficient,
salary_feasible, salary_ratio, is_remote, is_junior,
certifications_count
```

`soft_skill_coverage` sudah dihitung pada pairwise dataset tetapi belum dimasukkan ke `feature_cols` saat training, sedangkan `semantic_score` dilewati karena belum tersedia.

### 7. Stratified Data Split

Data dibagi secara stratified berdasarkan `is_match` agar distribusi label tetap konsisten:

| Split | Proporsi | Jumlah |
|---|---:|---:|
| **Train** | 70% | 42.656 |
| **Validation** | 15% | 9.143 |
| **Test** | 15% | 9.141 |

### 8. Model Training & Hyperparameter Tuning

Logistic Regression, Random Forest, dan XGBoost dilatih dengan **5-Fold GridSearchCV** menggunakan accuracy sebagai scoring; `StandardScaler` hanya digunakan dalam pipeline Logistic Regression.

| Model | Best Parameters | Best CV Accuracy |
|---|---|---:|
| **Logistic Regression** | `C=10.0` | 66,02% |
| **Random Forest** | `max_depth=10`, `min_samples_leaf=10`, `min_samples_split=15` | 69,73% |
| **XGBoost** | `max_depth=5`, `learning_rate=0.05`, `subsample=1.0`, `colsample_bytree=0.8` | 69,88% |

### 9. Test Set Evaluation

Ketiga model dievaluasi pada **9.141 data test** menggunakan accuracy, precision, recall, F1-score, classification report, dan confusion matrix.

| Model | Accuracy | Precision Positif | Recall Positif | F1 Positif |
|---|---:|---:|---:|---:|
| **Logistic Regression** | 66,37% | 0,63 | 0,64 | 0,63 |
| **Random Forest** | 69,68% | 0,69 | 0,60 | 0,64 |
| **XGBoost** | **69,90%** | **0,70** | 0,59 | 0,64 |

### 10. Experiment Tracking & Model Registry

Notebook menginisialisasi `DagsHubService`, sementara `dagshub.init(..., mlflow=True)` mengarahkan MLflow Tracking URI ke repository DagsHub dan memilih experiment **`JobSeekerAI - Job Matching`**.

Setiap model dicatat sebagai MLflow run terpisah dengan isi berikut:

| Komponen | Data yang Dicatat |
|---|---|
| **Run name** | `LogisticRegression_Training_Run`, `RandomForest_Training_Run`, `XGBoost_Training_Run` |
| **Parameters** | Seluruh parameter estimator terbaik hasil GridSearchCV |
| **Metrics** | Accuracy, F1, ROC-AUC, serta precision dan recall khusus XGBoost |
| **Tags** | Framework, task `binary_classification`, dan domain `job_matching` |
| **Model artifact** | Estimator hasil training melalui `mlflow.sklearn.log_model()` |
| **Model registry** | `jobseekerai-logistic_regression`, `jobseekerai-random_forest`, dan `jobseekerai-xgboost` |

Jika tracking tidak terkonfigurasi atau koneksi gagal, `DagsHubService` mengembalikan `None` dan proses modelling lokal tetap dapat dilanjutkan.

### 11. Model Interpretation & Advanced Evaluation

Notebook menghitung permutation importance XGBoost berbasis penurunan F1, membandingkan confusion matrix, menguji learning rate `0.1`, `0.01`, `0.001`, dan `0.0001` selama 60 boosting rounds, serta memvisualisasikan ROC-AUC dan Precision-Recall curve.

### 12. Model Export & API Integration

Model hasil notebook disimpan sebagai `logistic_regression.pkl`, `random_forest.pkl`, dan `xgboost.pkl`, kemudian API menggunakan file lokal `backend/models/xgboost.pkl` sebagai artifact inference default. DagsHub/MLflow dipakai untuk tracking dan registry, tetapi API saat ini **tidak mengunduh model dari DagsHub saat runtime**.

#### Alur Integrasi Model ke API

```text
Frontend Form
    → Next.js API Proxy + X-API-Key
    → POST /api/v1/match?limit=10
    → Pydantic MatchRequest validation
    → MatcherService singleton
    → Feature engineering per user-job
    → XGBoost predict_proba()
    → 40% ML score + 60% heuristic score
    → Sort descending + top-K
    → Pydantic MatchResponse
```

1. **Model export:** Notebook menyimpan estimator XGBoost ke `backend/models/xgboost.pkl`.
2. **Startup loading:** FastAPI `lifespan` menjalankan background thread yang memanggil `matcher.load_resources()` untuk memuat `refined_jobs.json` dan model melalui `joblib.load()`.
3. **Dependency injection:** `get_matcher()` memberikan singleton `MatcherService` yang sudah memegang dataset dan model kepada endpoint.
4. **Request validation:** `POST /api/v1/match` menerima `MatchRequest`, sedangkan profil kandidat divalidasi oleh `MatchProfileInput`.
5. **Category filtering:** Service membatasi job pool berdasarkan `category_filter` atau `preferred_category`, dengan fallback ke seluruh dataset jika kategori tidak ditemukan.
6. **Online feature engineering:** Untuk setiap pasangan kandidat-lowongan, service menghitung 13 fitur yang sama dengan fitur training:

```text
skill_coverage, n_user_skills, category_match, exp_gap_raw,
exp_gap_normalized, user_exp_years, edu_gap, edu_sufficient,
salary_feasible, salary_ratio, is_remote, is_junior,
certifications_count
```

7. **ML inference:** Service membaca `feature_names_in_` dari model untuk menjaga nama dan urutan kolom, lalu mengambil probabilitas kelas match melalui `predict_proba(df)[0, 1]`.
8. **Score fusion:** Probabilitas ML digabungkan dengan heuristic score:

```text
Final Score = 0.40 × ML_Score + 0.60 × Heuristic_Score
```

9. **Ranking & response:** Semua lowongan diurutkan berdasarkan final score, dipotong sesuai `limit` (1–50), lalu dikembalikan sebagai `MatchResponse` beserta `confidence_score`, `score_method`, dan rincian kecocokan.
10. **Monitoring & fallback:** Endpoint `/health` menampilkan status resource dan model; jika file model tidak tersedia, gagal dimuat, atau inference gagal, sistem otomatis menggunakan pure heuristic scoring.

#### API Contract Ringkas

```http
POST /api/v1/match?limit=10
X-API-Key: <server-api-key>
Content-Type: application/json
```

```json
{
  "parsed_cv": {
    "hard_skills": ["Python", "SQL", "Git"],
    "soft_skills": ["komunikasi"],
    "education_level": "S1",
    "total_experience_years": 2,
    "preferred_category": "Technology",
    "preferred_salary": 7000000,
    "certifications_count": 1
  },
  "category_filter": "Technology"
}
```

> **Catatan validasi artifact:** `xgboost.pkl` yang aktif saat ini memiliki 13 fitur yang sesuai dengan API, tetapi parameternya adalah `n_estimators=60` dan `learning_rate=0.0001`, yaitu model terakhir dari eksperimen learning-rate. Artifact ini perlu diekspor ulang dari `xgb_grid.best_estimator_` agar model deployment identik dengan hasil evaluasi XGBoost terbaik (`learning_rate=0.05`).

---

## Dataset

### Sumber Data

Data lowongan kerja dikumpulkan menggunakan **SerpApi** — sebuah layanan scraping Google Jobs yang memungkinkan pengambilan data lowongan secara terstruktur dan legal via API.

- **Target scraping:** Lowongan pekerjaan di Indonesia dari Google Jobs
- **Skrip scraping:** `backend/data/fetch/serapi_fetch.py`
- **Frekuensi:** One-time batch scraping (offline)

### Statistik Dataset

| Tahap | File | Jumlah Records | Atribut | Ukuran |
|---|---|---|---|---|
| **Raw** (SerpApi) | `data/raw/google_jobs_results.json` | **4.911** | 12 (mentah) | ~18 MB |
| **Cleaned** (setelah AI Extraction) | `data/cleaned/cleaned_jobs.json` | **1.617** | 28 (terstruktur) | — |
| **Refined** (setelah Refinement) | `data/cleaned/refined_jobs.json` | **1.491** | 29 | — |
| **Vector/Modeling** | `data/vector/job_mapping.json` | **1.491** | 16 | — |
| **Embedded** | `data/retrieval/sbert_embeddings.npy` | 1.491 embedding vectors | — | — |

> **Mengapa hanya 1.491 dari 4.911?**
> Proses Feature Extraction melalui dua tahap: (1) **AI Extraction** menggunakan Ollama/Gemma 2B — dari 4.911 raw jobs, sekitar 1.617 lolos validasi sebagai lowongan valid (`is_valid_job = true`) dan berhasil diekstrak atributnya; (2) **Refinement** berbasis Python — menghasilkan 1.491 data setelah normalisasi gaji, deduplikasi skill, perbaikan tipe data, dan filtering data tidak lengkap atau tidak valid.

### Proses Feature Extraction (Data Pipeline)

Pipeline ekstraksi fitur dijalankan offline via `backend/services/etl_learning.ipynb` dan terdiri dari **dua tahap utama**:

#### Tahap 1: AI Extraction — Ollama/Gemma 2B (LLM Lokal)

 Pada tahap ini, **Large Language Model (LLM) lokal Ollama/Gemma 2B** digunakan untuk mengekstrak atribut terstruktur dari deskripsi lowongan mentah. Dari **12 atribut mentah** (title, description, extensions, detected_extensions, dll.), LLM mengekstrak menjadi **28 atribut terstruktur**.

**Apa yang diekstrak LLM:**

| Atribut Hasil Ekstraksi | Contoh |
|---|---|
| `hard_skills` | `["Python", "SQL", "PostgreSQL"]` |
| `soft_skills` | `["komunikasi", "teliti", "kerja sama"]` |
| `education_level` | `"S1"`, `"D3"`, `"SMA"` |
| `min_experience_years` | `2` |
| `salary_min` / `salary_max` | `5000000` / `8000000` |
| `job_category` | `"Technology"`, `"Marketing & Sales"` |
| `job_subcategory` | `"Data Analyst"`, `"Sales Executive"` |
| `seniority_level` | `"Entry"`, `"Junior"`, `"Mid"`, `"Senior"` |
| `work_arrangement` | `"Onsite"`, `"Remote"`, `"Hybrid"` |
| `employment_type` | `"Full-time"`, `"Part-time"`, `"Contract"` |

**Filter validasi juga dilakukan oleh LLM** — job yang bukan lowongan valid (spam, iklan, bukan pekerjaan) diklasifikasikan sebagai `is_valid_job = false` dan difilter.

```
┌──────────────────────┐     ┌──────────────────────────────────────────┐     ┌──────────────────────────┐
│  Raw Google Jobs     │     │  STAGE 1: AI EXTRACTION                  │     │  cleaned_jobs.json       │
│  (4.911 data)        │────▶│  ┌────────────────────────────────────┐  │────▶│  (1.617 data)            │
│                      │     │  │  Ollama/Gemma 2B (LLM Lokal)       │  │     │  28 atribut terstruktur  │
│  12 atribut mentah:  │     │  │                                    │  │     └────────────┬───────────┘
│  • title             │     │  │  Prompt → Deskripsi job mentah     │  │                  │
│  • description       │     │  │         ↓                          │  │                  │
│  • extensions        │     │  │         hard_skills: [...],        │  │                  │
│  • detected_extensions│     │  │         soft_skills: [...],        │  │                  │
│  • company_name      │     │  │         salary_min: ...,           │  │                  │
│  • location          │     │  │         education_level: ...,      │  │                  │
│  • via               │     │  │         job_category: ...,         │  │                  │
│  • source_link       │     │  │         seniority_level: ...,      │  │                  │
│  • share_link        │     │  │         work_arrangement: ...,     │  │                  │
│  • job_title         │     │  │         ...                        │  │                  │
│  • apply_options     │     │  └────────────────────────────────────┘  │                  │
│  • job_id            │     │  Filter: is_valid_job = true/false      │                  │
└──────────────────────┘     └──────────────────────────────────────────┘                  ▼
                         ┌──────────────────────────────────────────┐     ┌──────────────────────────┐
                         │  STAGE 2: REFINEMENT (Python)            │     │  refined_jobs.json       │
                         │  ┌────────────────────────────────────┐  │────▶│  (1.491 data)            │
                         │  │ • Normalisasi gaji (harian→bulanan)│  │     │  29 atribut              │
                         │  │ • Deduplikasi & normalisasi skill  │  │     └────────────┬───────────┘
                         │  │ • Perbaikan employment_type        │  │                  │
                         │  │ • Filter soft_skills > 3 item      │  │                  │
                         │  │ • Validasi salary range            │  │                  │
                         │  └────────────────────────────────────┘  │                  │
                         └──────────────────────────────────────────┘                  ▼
                                                                     ┌──────────────────────────┐
                                                                     │  job_mapping.json        │
                                                                     │  (1.491 data)            │
                                                                     │  16 atribut final        │
                                                                     │  (untuk modeling/index)  │
                                                                     └──────────────────────────┘
```

#### Tahap 2: Refinement (Pure Python — Tanpa AI)

Tahap ini menggunakan logika Python murni untuk membersihkan dan menormalisasi hasil ekstraksi LLM:

| Proses | Detail |
|---|---|
| **Normalisasi Gaji** | Konversi gaji harian (×22), mingguan (×4), per jam (×160) ke IDR/bulan. Jika tidak terdeteksi, diisi `0`. |
| **Normalisasi Skill** | Via `skill_normalizer.py` — 100+ alias mapping (`"js"` → `"JavaScript"`, `"excel"` → `"Microsoft Excel"`) |
| **Deduplikasi Skill** | Menghapus duplikat dalam satu list skill |
| **Filter Soft Skills** | Maksimal 3 item (LLM kadang menghasilkan >3 meski diminta `max3`) |
| **Validasi Lowongan** | Filter `is_valid_job = false`, duplikat via `job_id`, dan data tidak lengkap |

#### Output Akhir untuk Modeling

Data akhir `job_mapping.json` (1.491 data, 16 atribut) digunakan untuk:
- **ML Modeling** (`modelling.ipynb`) — pairwise feature engineering & training
- **Semantic Indexing** (`data_indexing.ipynb`) — SBERT embedding & FAISS/NumPy index
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
│   │   ├── dagshub_service.py  ← MLflow tracking & DagsHub model registry
│   │   ├── evaluation_cells.py← ML evaluation helpers
│   │   ├── scraper_v2.py      ← SerpApi scraper
│   │   ├── etl_learning.ipynb ← Notebook utama ETL pipeline (Ollama)
│   │   ├── data_indexing.ipynb← Notebook semantic indexing
│   │   └── retrieval_pipeline.ipynb ← Notebook Semantic Search (SBERT)
│   │
│   ├── models/                ← Model ML / Embedder
│   │   ├── embedder.py        ← SBERT singleton wrapper
│   │   ├── modelling.ipynb    ← Training, evaluation, dan MLflow tracking
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
│   ├── push_models_to_dagshub.py ← Upload file .pkl sebagai MLflow artifacts
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

### `backend/services/` (5 core services)

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

**`dagshub_service.py` → `DagsHubService`:**
```python
dagshub_service.initialize()                   # Hubungkan MLflow ke DagsHub
dagshub_service.log_model_run(                 # Log params, metrics, tags, dan model
    model, params, metrics, model_name="xgboost"
)
dagshub_service.log_dataset_info(...)          # Log metadata dataset
dagshub_service.get_best_run("roc_auc")         # Ambil run terbaik
```
- Experiment default: `JobSeekerAI - Job Matching`
- Model yang didukung: XGBoost, Random Forest, dan Logistic Regression
- Kegagalan tracking tidak menghentikan training karena service menggunakan graceful fallback

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

# === DagsHub & MLflow Tracking ===
DAGSHUB_REPO_OWNER=your-dagshub-username
DAGSHUB_REPO_NAME=your-repository-name
DAGSHUB_USERNAME=your-dagshub-username
DAGSHUB_TOKEN=your-dagshub-token

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

# Modelling & experiment tracking
pip install -r requirements_ml.txt
jupyter notebook models/modelling.ipynb
python push_models_to_dagshub.py        # Opsional: upload ulang artifact .pkl
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
| `dagshub` | 0.7.0 | Inisialisasi remote MLflow tracking di DagsHub |
| `mlflow` | 3.13.0 | Experiment runs, metrics, artifacts, dan model registry |

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
| Data sumber ML 1.491 lowongan | **200 synthetic users + pairwise generation + 5-Fold Cross Validation** | Menghasilkan 60.940 pasangan terlabel untuk training dan evaluasi |
| 3 models tersimpan (RF, LogReg, XGB) | Default: `xgboost.pkl` | XGBoost memperoleh accuracy test tertinggi, sedangkan LogReg tetap menjadi baseline |
| Tracking eksperimen bersifat eksternal | MLflow diarahkan ke DagsHub melalui `dagshub.init(..., mlflow=True)` | Training lokal tetap berjalan ketika credential atau koneksi DagsHub tidak tersedia |
| FAISS diganti NumPy | `vector_store.py` sekarang menggunakan `sbert_embeddings.npy` + cosine similarity NumPy | FAISS tidak bisa berjalan di Cloud Run (dependency/binary issue) |
| CPU throttling di Cloud Run | Aktifkan `--no-cpu-throttling` pada service backend | Background thread load NumPy dibekukan sebelum selesai tanpa CPU always-on |
| job_id base64 rusak di URL | Endpoint `GET /api/v1/jobs/by-link?link=...` dibuat agar ID aman dikirim sebagai query param | Karakter `=` dan `/` di base64 merusak URL path routing |
| Skill Gap Analysis (Competency Gap) | Komponen diganti sepenuhnya oleh Gemini AI Career Advisor | Mock data tidak informatif; Gemini memberikan insight jauh lebih kaya |
