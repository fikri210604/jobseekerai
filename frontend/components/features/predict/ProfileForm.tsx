"use client";

import { ChevronDown, UserCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/lib/store";
import { indonesiaMapData } from "@/components/shadcnmaps/map-data/indonesia";

const EDUCATION_OPTIONS = [
  { value: "s1", label: "S1 (Bachelor)" },
  { value: "diploma", label: "D3 (Diploma)" },
  { value: "sma_smk", label: "SMA/SMK" },
  { value: "s2", label: "S2 (Master)" },
  { value: "s3", label: "S3 (Ph.D.)" },
  { value: "tidak_ada", label: "Tidak Ada" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "Finance", label: "Finance & Accounting" },
  { value: "Technology", label: "Information Technology" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Marketing", label: "Sales & Marketing" },
  { value: "Operations", label: "Operations" },
  { value: "Design", label: "Design" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "Data", label: "Data" },
];

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
    certificationsCount,
    setCertificationsCount,
    location,
    setLocation,
  } = useUserStore();

  return (
    <section className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-4">
      <div className="mb-8 flex items-center gap-2 border-b border-[var(--sb-hairline)] pb-3">
        <UserCheck size={20} color="var(--sb-indigo)" />
        <h3 className="text-lg font-semibold text-foreground">
          Candidate Profile
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Education Level
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
            Years of Experience
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
              YRS
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Certifications Count
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
              QTY
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Preferred Category
          </label>
          <Select value={preferredCategory} onValueChange={setPreferredCategory}>
            <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Location / City
          </label>
          <Select value={location || "all"} onValueChange={(v) => setLocation(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3">
              <SelectValue placeholder="Semua kota / provinsi" />
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

        <div className="md:col-span-2 lg:col-span-1">
          <label className="mb-2 block text-sm text-muted-foreground">
            Expected Salary (IDR)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-sm text-muted-foreground">
              Rp
            </div>
            <Input
              inputMode="numeric"
              value={formatCurrencyInput(expectedSalary)}
              onChange={(e) => setExpectedSalary(parseCurrencyInput(e.target.value))}
              placeholder="15,000,000"
              className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] pl-10 pr-3 text-right font-mono"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
