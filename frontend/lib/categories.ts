// frontend/lib/categories.ts

export const CATEGORY_OPTIONS = [
  { value: "Technology", label: "Teknologi Informasi (IT)" },
  { value: "Finance", label: "Keuangan & Akuntansi" },
  { value: "Marketing", label: "Pemasaran & Penjualan" },
  { value: "Human Resources", label: "Sumber Daya Manusia (HR)" },
  { value: "Operations", label: "Operasional & Logistik" },
  { value: "Engineering", label: "Teknik (Non-IT)" },
  { value: "Creative", label: "Desain & Kreatif" },
  { value: "Healthcare", label: "Kesehatan & Medis" },
] as const;

export const SUBCATEGORY_MAP: Record<string, { value: string; label: string }[]> = {
  Technology: [
    { value: "Software Engineering", label: "Rekayasa Perangkat Lunak" },
    { value: "Data Science & Analytics", label: "Sains Data & Analitik" },
    { value: "DevOps & Cloud", label: "Infrastruktur Cloud & DevOps" },
    { value: "Cybersecurity", label: "Keamanan Siber" },
    { value: "Product Management", label: "Manajemen Produk" },
    { value: "IT Support", label: "Dukungan IT & Jaringan" },
    { value: "QA & Testing", label: "QA & Pengujian Perangkat Lunak" },
  ],
  Finance: [
    { value: "Accounting", label: "Akuntansi" },
    { value: "Financial Analysis", label: "Analisis Keuangan" },
    { value: "Auditing", label: "Audit" },
    { value: "Taxation", label: "Perpajakan" },
    { value: "Banking", label: "Perbankan & Layanan Keuangan" },
    { value: "Investment", label: "Investasi & Manajemen Kekayaan" },
  ],
  Marketing: [
    { value: "Digital Marketing", label: "Pemasaran Digital" },
    { value: "Content Creation", label: "Pembuatan Konten & Copywriting" },
    { value: "SEO & SEM", label: "SEO & SEM" },
    { value: "Social Media", label: "Manajemen Media Sosial" },
    { value: "Public Relations", label: "Hubungan Masyarakat (PR)" },
    { value: "Sales", label: "Penjualan & Pengembangan Bisnis" },
  ],
  "Human Resources": [
    { value: "Recruitment", label: "Akuisisi Bakat & Rekrutmen" },
    { value: "HR Generalist", label: "HR Generalist" },
    { value: "Compensation", label: "Kompensasi & Tunjangan" },
    { value: "Training", label: "Pelatihan & Pengembangan" },
    { value: "Employee Relations", label: "Hubungan Karyawan" },
  ],
  Operations: [
    { value: "Supply Chain", label: "Rantai Pasok & Pengadaan" },
    { value: "Logistics", label: "Logistik & Distribusi" },
    { value: "Project Management", label: "Manajemen Proyek" },
    { value: "Customer Service", label: "Layanan Pelanggan & Dukungan" },
    { value: "Quality Assurance", label: "Jaminan Mutu (Operasional)" },
  ],
  Engineering: [
    { value: "Mechanical", label: "Teknik Mesin" },
    { value: "Electrical", label: "Teknik Elektro" },
    { value: "Civil", label: "Teknik Sipil" },
    { value: "Industrial", label: "Teknik Industri" },
    { value: "Chemical", label: "Teknik Kimia" },
  ],
  Creative: [
    { value: "Graphic Design", label: "Desain Grafis" },
    { value: "UI/UX", label: "Desain UI/UX" },
    { value: "Video Production", label: "Pengeditan & Produksi Video" },
    { value: "Animation", label: "Animasi & 3D" },
    { value: "Photography", label: "Fotografi" },
  ],
  Healthcare: [
    { value: "Nursing", label: "Keperawatan" },
    { value: "Pharmacy", label: "Farmasi" },
    { value: "Medical Administration", label: "Administrasi Medis" },
    { value: "Therapy", label: "Terapi & Rehabilitasi" },
    { value: "Public Health", label: "Kesehatan Masyarakat" },
  ],
};
