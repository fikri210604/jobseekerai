<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version uses Next.js 16 (App Router) with strict compilation standards.
Read relevant conventions in `node_modules/next/dist/docs/` before implementing features.

<!-- END:nextjs-agent-rules -->

# 🛠️ Ekosistem Teknologi & UI

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Pustaka Komponen:** Shadcn UI (Radix-based, dark-mode default, unstyled by default via Tailwind)
- **Komponen Visualisasi:** Recharts (Khusus untuk visualisasi Spider Web/Radar Chart)
- **Manajemen State Global:** Zustand (Untuk mengelola state asinkronus antar halaman)
- **Bahasa Desain:** Modern Minimalist SaaS Terkelola (Inspirasi: Linear x Supabase)
  - Canvas Background: `{colors.canvas}` (#02040a) - Deep navy-tinted black.
  - Surface 1 (Card/Panel Base): `{colors.surface-1}` (#0d1117) - Charcoal base.
  - Surface 2 (Hover/Active/Modal): `{colors.surface-2}` (#161b22) - Lifted dark slate.
  - Hairline Border: `{colors.hairline}` (#1f2430) - 1px subtle grid boundary.
  - Akun Utama 1 (Indigo): `#5e6ad2` - Untuk kontrol interaktif, tombol primer, dan active navigation.
  - Akun Utama 2 (Emerald): `#10b981` - Khusus untuk data metrik kuantitatif (Confidence Score, Cosine Similarity, SKKNI Compliant).

# 📂 Struktur Proyek & Blueprint Komponen

Patuhi struktur folder dan tanggung jawab komponen berikut secara ketat:

- `app/` -> Struktur Routing Next.js 16 App Router. Harus bersih dari logika bisnis berat.
- `components/ui/` -> Komponen primitif shadcn/Sera UI.
  - `button.tsx`: Varian `primary` (bg Indigo), `outline`, `ghost`, `destructive`.
  - `badge.tsx`: Varian `default` (skill tag), `success` (Emerald), `warning` (Amber), `error` (Merah), `info` (Biru Muda).
  - `card.tsx`: Base Surface-1 (`#0d1117`), rounded-xl, hairline border.
  - `input.tsx` / `textarea.tsx`: Canvas bg, border berubah Indigo saat focus.
  - `select.tsx`: Dropdown menu dengan latar belakang dark.
  - `slider.tsx`: Track abu-abu muted, range Indigo.
  - `progress.tsx`: Bar progres berwarna Emerald untuk confidence score.
- `components/shared/` -> Komponen tata letak global.
  - `Navbar.tsx`: Fixed top, blur backdrop, logo, navigasi dengan gaya indikator aktif (Indigo).
- `components/features/` -> Blok fitur modular spesifik per halaman:
  - `landing/`: `HeroSection.tsx`, `PartnerLogos.tsx`, `FeatureCards.tsx`
  - `predict/`: `ProfileForm.tsx`, `SkillTagInput.tsx` (injeksi badge dinamis), `CVTextarea.tsx`, `AlgoConfig.tsx` (Dropdown + Slider).
  - `results/`: `DiagnosticStrip.tsx` (3 kartu metrik), `UserProfilePanel.tsx`, `JobMatchCard.tsx` (Split layout, skor Emerald).
  - `search/`: `SemanticSearchBar.tsx` (Terminal style `> _`), `SearchResultRow.tsx` (Skor Cosine biru muda).
  - `job-detail/`: `JobInfoPanel.tsx`, `SkillRadarChart.tsx` (Visualisasi Recharts untuk SKKNI Gap Analytics).
- `lib/`
  - `utils.ts`: Hanya berisi fungsi gabungan `cn()`. **Dilarang keras menulis ulang atau menimpa utilitas kelas Tailwind di sini.**
  - `store.ts`: Store Zustand (useUserStore, useResultsStore, useSearchStore).
  - `api.ts`: Klien Axios untuk request ke backend.
- `types/index.ts` -> Definisi antarmuka TypeScript yang wajib sinkron dengan skema Pydantic backend (`UserProfile`, `MatchResult`, `SearchResult`, dll).

# 🔄 Spesifikasi Alur Data & Manajemen State (Zustand)

Sistem dilarang keras melakukan komputasi kecerdasan buatan, parsing teks dokumen, atau query database langsung dari sisi frontend. Seluruh beban kerja wajib dilemparkan ke FastAPI melalui API layer.

Mekanisme State Store global (`lib/store.ts`) wajib mengelola struktur data berikut:

1. `userProfileState`: Menyimpan parameter input (Pendidikan, Gaji, Pengalaman, Hard Skills Badges).
2. `predictionResultState`: Menyimpan array hasil perankingan **Two-Stage XGBoost** (berisi objek dengan metrik `confidence_score`).
3. `semanticSearchState`: Menyimpan array hasil pencarian **SBERT Vector Space** (berisi objek dengan metrik `cosine_similarity`).

# 🎨 Cetak Biru Implementasi 5 Halaman Utama (Peta Rute Agen)

Agen Pengembang wajib mematuhi arsitektur antarmuka dan penempatan metrik kuantitatif pada 5 halaman spesifik berikut:

### 1. Landing Page (`app/page.tsx`)

- Wajib menampilkan Hero Section dengan tipografi besar, tebal (weight 600), dan tracking negatif tajam (`tracking-[-1.8px]`).
- Tombol Aksi Utama ("Get Started") wajib menggunakan warna Indigo (`bg-[#5e6ad2]`).
- Grid bawah menampilkan 5 logo mitra industri dengan efek opasitas pudar (`opacity-50`).
- Menyediakan 3 kartu ringkasan teknologi penjelas sistem: "SBERT Semantic Search", "XGBoost Re-ranking Engine", dan "SKKNI Competency Mapping".

### 2. Form Prediction / Ingestion View (`app/predict/page.tsx`)

- Layout wajib menggunakan struktur terpusat yang bersih.
- Kolom kiri: Dropdown tingkat pendidikan, input numerik tahun pengalaman, dan input ekspektasi gaji.
- Kolom kanan: `Textarea` tunggal dari Sera UI untuk input teks mentah CV pelamar, dilengkapi dengan penambahan komponen `Badge` dinamis untuk injeksi data _Hard Skills_.
- Bagian Bawah: Panel Kontrol Parameter Model. Berisi komponen `Dropdown` pemilih algoritma (_XGBoost Classifier Tuned_, _Random Forest_, _Logistic Regression_) dan komponen `Slider` pengatur bobot matriks hibrida.

### 3. Dashboard Hasil Prediksi & Rekomendasi (`app/results/page.tsx`)

- Layout wajib menggunakan **Split-View Layout** (Dua panel asimetris).
- Header Atas: Menampilkan 3 kartu ringkasan metadata diagnostik: "Total Scraped Jobs Evaluated: 1,322", "Server Inference Latency: 18ms", "Active Algorithm: XGBoost Classifier".
- Panel Rekomendasi: Menampilkan tumpukan vertikal kartu lowongan kerja (`JobMatchCard`).
- **Aturan Metrik**: Sisi kanan setiap kartu wajib menampilkan nilai probabilitas model klasifikasi menggunakan komponen teks bermonospasi (`font-mono`) berwarna hijau emerald (`text-[#10b981]`) dengan format teks yang kentara.

### 4. Semantic Search Engine (`app/search/page.tsx`)

- Layar khusus Information Retrieval (IR). Memiliki bar pencarian semantik besar minimalis di atas (gaya terminal).
- Menampilkan hasil pencarian sebagai baris dokumen dari ruang vektor SBERT.
- Metrik Kosinus: Tampilkan jarak matematis menggunakan warna token biru muda bergaya font-mono: "Cosine Similarity: 0.8958".

### 5. Job Detail & Gap Analytics (`app/jobs/[id]/page.tsx`)

- Kolom Kiri (50%): Deskripsi lengkap lowongan, tautan lamaran, dan metadata struktural rekrutmen.
- Kolom Kanan (50%): Analisis Kesenjangan Kompetensi SKKNI.
- Grafik: Radar Chart penuh (Spider Web) yang melapiskan vektor keahlian pengguna (solid light blue) terhadap unit SKKNI (garis keliling hijau emerald).
- Di bawah grafik, cantumkan _missing unit codes_ sebagai peringatan lencana merah.
