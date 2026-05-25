## Overview

SkillBridge AI adalah platform berbasis data-dense khusus untuk Talent Analytics, Semantic Search, dan Person-Job Fit Matching berbasis standar nasional SKKNI. Bahasa desain mengadopsi gaya "Modern Minimalist SaaS" dengan landasan kanvas hitam pekat kebiruan `{colors.canvas}` (#02040a) untuk memaksimalkan kontras teks dan grafik analitik tanpa melelahkan mata pengguna.

Sistem visual menggunakan aturan logika warna fungsional:
1. {colors.primary} (Indigo - #5e6ad2): Mengendalikan navigasi, tombol aksi utama, dan kontrol parameter sistem.
2. {colors.semantic-success} (Emerald - #10b981): Melambangkan validasi, tingkat kecocokan tinggi, dan data kompetensi yang terpenuhi.
3. {colors.semantic-warning} (Amber - #f59e0b): Melambangkan tingkat kecocokan moderat atau adanya gap kualifikasi ringan.

Tipografi diatur secara ketat menggunakan Font Sans (Inter/Geist Sans) untuk keterbacaan teks deskriptif, dan Font Mono (JetBrains Mono/Geist Mono) wajib digunakan untuk semua token kuantitatif (Nilai Persentase, Skor Matematika, Kode Unit SKKNI, dan Nominal Gaji).

## Arsitektur Peta Halaman (Page Architecture)

Sistem ini terdiri dari 5 halaman terintegrasi dengan spesifikasi visual sebagai berikut:

### 1. Landing Page (Gerbang Informasi Utama)
- Karakter: Bersih, representatif, minim ornamen kosmetik, berfokus pada visualisasi fitur.
- Komponen: Hero Section dengan tipografi besar dan tracking negatif agresif (-1.8px), barisan logo mitra industri terkemuka dengan opasitas muted (50%), 3 kartu visual keunggulan sistem (Semantic Search, XGBoost Ranking, SKKNI Alignment).

### 2. Form Ingestion & Parameter Input (Form Prediction)
- Karakter: Ergonomis, terstruktur, minim distraksi.
- Komponen: Formulir pengisian data CV teks, tag-injector untuk input Hard Skills (menggunakan Badge), kontroler parameter model (Dropdown pemilih algoritma: XGBoost, RF, LR, dan Slider bobot hibrida).

### 3. Dashboard Hasil Prediksi & Rekomendasi (Confidence Score Layer)
- Karakter: Data-Dense, Split-View Layout.
- Komponen: Menampilkan metrik evaluasi Person-Job Fit. Sisi kiri ringkasan profil user, sisi kanan daftar Top-10 kartu rekomendasi lowongan yang diurutkan berdasarkan matriks probabilitas XGBoost. Nilai dipresentasikan menggunakan komponen Progress Bar atau Donut Chart dengan label Monospace: "70.1% Confidence Score".

### 4. Semantic Search Engine (Cosine Similarity Layer)
- Karakter: Interaktif, berfokus pada kecepatan temu balik informasi.
- Komponen: Kolom pencarian teks semantik bebas (*free-text query*). Hasil pencarian menyajikan baris pekerjaan yang diurutkan berdasarkan kedekatan jarak ruang vektor SBERT, ditampilkan menggunakan label font-mono: "Cosine Similarity: 0.8958".

### 5. Detail Lowongan & Analisis Kesenjangan (Job Detail & Gap Analytics)
- Karakter: Komprehensif, mendalam.
- Komponen: Struktur split dua kolom. Kolom kiri berisi informasi detail deskripsi pekerjaan konvensional. Kolom kanan berisi "SKKNI Gap Analytics Dashboard" yang memuat Radar Chart (Spider Web) dari Recharts untuk memetakan tumpang tindih (*overlap*) kompetensi user dengan kebutuhan industri.

## Colors & Core Tokens

- Canvas (bg): #02040a (Deep navy black)
- Surface 1 (Card/Panel): #0d1117 (Charcoal base)
- Surface 2 (Hover/Active): #161b22 (Lifted dark slate)
- Hairline (Border): #1f2430 (Subtle grid border)
- Hairline Strong: #30363d (Input active border)
- Text Ink: #f3f4f6 (Light gray core text)
- Text Muted: #9ca3af (Secondary metadata text)