"use client";

import { useState } from "react";
import { HelpCircle, X, CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_CV = `Nama: Budi Santoso
Pendidikan: S1 Teknik Informatika - Universitas Indonesia (2021)

Pengalaman:
- 3 tahun sebagai Backend Developer di PT. Teknologi Maju
  Membangun REST API menggunakan Python (FastAPI) dan PostgreSQL
  Mengelola deployment ke AWS EC2 menggunakan Docker
  
- 1 tahun sebagai Data Analyst Intern di Startup XYZ
  Menganalisis data pengguna menggunakan Python dan Pandas
  Membuat dashboard laporan menggunakan Tableau

Keahlian Tambahan:
  Memiliki pengalaman dengan Git, Postman, dan CI/CD pipelines
  Pernah mengerjakan proyek machine learning menggunakan Scikit-learn
  Terbiasa bekerja dalam tim menggunakan metodologi Agile/Scrum
  
Organisasi & Prestasi:
  - Juara 1 Hackathon Nasional 2022
  - Ketua Himpunan Mahasiswa Teknik Informatika (2020)
  
Sertifikasi:
  - AWS Certified Developer Associate (2023)
  - Google Professional Data Engineer (2022)

Catatan: Tertarik pada posisi di bidang backend engineering atau data engineering.
  Bersedia bekerja remote atau hybrid di area Jakarta.`;

export function CVGuideModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EXAMPLE_CV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-medium transition-colors"
        style={{ color: "var(--sb-indigo)" }}
      >
        <HelpCircle size={12} />
        Panduan Pengisian
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl"
            style={{
              background: "var(--sb-canvas)",
              borderColor: "var(--sb-hairline-strong)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
              style={{
                background: "var(--sb-surface-1)",
                borderColor: "var(--sb-hairline)",
              }}
            >
              <div className="flex items-center gap-2">
                <HelpCircle size={18} style={{ color: "var(--sb-indigo)" }} />
                <h2 className="text-sm font-semibold text-foreground">
                  Cara Mengisi Teks CV / Resume
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[var(--sb-hairline)] hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Intro */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kolom ini bersifat <span className="font-medium text-foreground">opsional</span>, 
                namun sangat direkomendasikan. Sistem akan menggunakannya untuk membantu 
                fitur <strong style={{ color: "var(--sb-indigo)" }}>✨ AI Profile Auditor</strong> 
                {" "}mendeteksi skill yang belum kamu cantumkan secara otomatis.
              </p>

              {/* Sections */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Apa saja yang bisa diisikan?
                </h3>

                {[
                  {
                    icon: "🎓",
                    title: "Pendidikan",
                    desc: "Jurusan, nama universitas, dan tahun lulus.",
                    example: "S1 Teknik Informatika - Universitas Indonesia (2021)",
                  },
                  {
                    icon: "💼",
                    title: "Pengalaman Kerja",
                    desc: "Posisi, perusahaan, lama bekerja, dan tanggung jawab utama. Sertakan teknologi yang dipakai.",
                    example: "3 tahun sebagai Backend Developer di PT. XYZ menggunakan Python, FastAPI, dan PostgreSQL.",
                  },
                  {
                    icon: "🛠️",
                    title: "Keahlian Tambahan",
                    desc: "Tools, framework, atau metodologi yang kamu kuasai tapi belum ada di form.",
                    example: "Terbiasa menggunakan Docker, Git, dan metodologi Agile.",
                  },
                  {
                    icon: "📜",
                    title: "Sertifikasi",
                    desc: "Nama sertifikasi dan tahun diperoleh (jika ada).",
                    example: "AWS Certified Developer Associate (2023)",
                  },
                  {
                    icon: "🏆",
                    title: "Organisasi & Prestasi",
                    desc: "Pengalaman kepanitiaan, organisasi, kompetisi, atau penghargaan yang pernah diraih.",
                    example: "Juara 1 Hackathon Nasional 2022, Ketua Himpunan Mahasiswa.",
                  },
                  {
                    icon: "💬",
                    title: "Catatan / Preferensi",
                    desc: "Hal lain yang relevan, seperti preferensi jenis pekerjaan atau area kerja.",
                    example: "Bersedia bekerja remote, tertarik di bidang data engineering.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border p-4"
                    style={{
                      background: "var(--sb-surface-1)",
                      borderColor: "var(--sb-hairline)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-0.5">{item.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                        <div
                          className="rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed"
                          style={{
                            background: "var(--sb-canvas)",
                            color: "var(--sb-emerald)",
                            border: "1px solid var(--sb-hairline)",
                          }}
                        >
                          {item.example}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div
                className="rounded-xl border p-4 space-y-2"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  borderColor: "rgba(99,102,241,0.2)",
                }}
              >
                <p className="text-xs font-semibold" style={{ color: "var(--sb-indigo)" }}>
                  💡 Tips agar analisis lebih akurat
                </p>
                {[
                  "Tidak perlu format yang sempurna — tulis saja secara natural seperti menulis di chat.",
                  'Sebutkan nama teknologi secara spesifik (misal "React" bukan hanya "framework").',
                  "Sertakan angka jika ada: berapa tahun, berapa orang dalam tim, dll.",
                  "Tidak perlu menulis CV lengkap — poin-poin singkat sudah cukup.",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "var(--sb-indigo)" }} />
                    <p className="text-xs text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Example full CV */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Contoh Isian Lengkap
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-7 gap-1.5 text-xs border-[var(--sb-hairline-strong)]"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Tersalin!" : "Salin Contoh"}
                  </Button>
                </div>
                <pre
                  className="rounded-xl border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap"
                  style={{
                    background: "var(--sb-surface-1)",
                    borderColor: "var(--sb-hairline)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {EXAMPLE_CV}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
