"use client";

import { ChevronDown, UserCheck, Briefcase } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useUserStore } from "@/lib/store";
import { indonesiaMapData } from "@/components/shadcnmaps/map-data/indonesia";
import { CATEGORY_OPTIONS, SUBCATEGORY_MAP } from "@/lib/categories";

const EDUCATION_OPTIONS = [
  { value: "s1", label: "S1 (Sarjana)" },
  { value: "diploma", label: "D3 (Diploma)" },
  { value: "sma_smk", label: "SMA/SMK" },
  { value: "s2", label: "S2 (Magister)" },
  { value: "s3", label: "S3 (Doktoral)" },
  { value: "tidak_ada", label: "Tidak Ada" },
] as const;

const WORK_ARRANGEMENT_OPTIONS = [
  { value: "Full-time", label: "Penuh Waktu" },
  { value: "Part-time", label: "Paruh Waktu" },
  { value: "Contract", label: "Kontrak" },
  { value: "Internship", label: "Magang" },
  { value: "Remote", label: "Jarak Jauh (Remote)" },
  { value: "Hybrid", label: "Hibrida (Hybrid)" },
] as const;

function formatCurrencyInput(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCurrencyInput(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

export function ProfileForm() {
  const {
    education,
    setEducation,
    experienceYears,
    setExperienceYears,
    expectedSalary,
    setExpectedSalary,
    preferredCategory,
    setPreferredCategory,
    preferredSubcategory,
    setPreferredSubcategory,
    certificationsCount,
    setCertificationsCount,
    location,
    setLocation,
    workArrangement,
    setWorkArrangement,
  } = useUserStore();

  return (
    <section className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-4">
      <div className="mb-8 flex items-center gap-2 border-b border-[var(--sb-hairline)] pb-3">
        <UserCheck size={20} color="var(--sb-indigo)" />
        <h3 className="text-lg font-semibold text-foreground">
          Profil Kandidat
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Tingkat Pendidikan
          </label>
          <Select
            value={education}
            onValueChange={(v) => setEducation(v as typeof education)}
          >
            <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Lama Pengalaman
          </label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              step={1}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] pl-3 pr-12 text-right font-mono"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm text-muted-foreground">
              THN
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Jumlah Sertifikasi
          </label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              value={certificationsCount}
              onChange={(e) => setCertificationsCount(Number(e.target.value))}
              className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] pl-3 pr-12 text-right font-mono"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sm text-muted-foreground">
              JML
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:col-span-2 md:grid-cols-2">
          {/* Target Kategori */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase size={14} className="text-muted-foreground" />
              Target Bidang / Kategori
            </label>
            <Select
              value={preferredCategory}
              onValueChange={setPreferredCategory}
            >
              <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
                <SelectValue placeholder="Pilih Kategori Industri" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Subkategori */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase size={14} className="text-muted-foreground" />
              Spesialisasi / Sub Kategori
            </label>
            <Select
              value={preferredSubcategory}
              onValueChange={setPreferredSubcategory}
              disabled={!preferredCategory || !SUBCATEGORY_MAP[preferredCategory as keyof typeof SUBCATEGORY_MAP]}
            >
              <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
                <SelectValue placeholder="Pilih Spesialisasi Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                {preferredCategory && SUBCATEGORY_MAP[preferredCategory as keyof typeof SUBCATEGORY_MAP]?.map((sub) => (
                  <SelectItem key={sub.value} value={sub.value} className="text-sm">
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Lokasi / Kota Domisili
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
              <SelectValue placeholder="Pilih Provinsi..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kota / provinsi</SelectItem>
              {indonesiaMapData.regions.map((region) => (
                <SelectItem key={region.id} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Tipe Pekerjaan
          </label>
          <Select value={workArrangement} onValueChange={setWorkArrangement}>
            <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORK_ARRANGEMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <label>Gaji yang Diharapkan (IDR)</label>
            <span className="font-mono font-medium text-foreground">
              Rp {expectedSalary.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="mt-4 px-2">
            <Slider
              value={[expectedSalary]}
              min={0}
              max={50000000}
              step={500000}
              onValueChange={(val) => setExpectedSalary(val[0])}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
              <span>Rp 0</span>
              <span>Rp 50Jt+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
