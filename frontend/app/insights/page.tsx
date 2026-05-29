// frontend/app/insights/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart2, BrainCircuit, TrendingUp, Briefcase, GraduationCap, Banknote, Wifi } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DistItem { label: string; count: number }
interface SalaryStats {
  count_with_data: number;
  avg?: number;
  median?: number;
  min?: number;
  max?: number;
}
interface MarketInsights {
  total_vectors: number;
  employment_type_dist: DistItem[];
  seniority_dist: DistItem[];
  work_arrangement_dist: DistItem[];
  education_dist: DistItem[];
  top_soft_skills: DistItem[];
  top_hard_skills: DistItem[];
  salary_stats: SalaryStats;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const PALETTE = [
  "#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899",
  "#8b5cf6","#06b6d4","#84cc16","#f97316","#14b8a6",
  "#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(n);

const fmtRp = (n?: number) =>
  n ? `Rp ${new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(n)}` : "—";

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { label, name, value } = payload[0];
  return (
    <div className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{label || name}</p>
      <p className="text-[var(--sb-indigo)]">{value} lowongan</p>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-[var(--sb-hairline)] pb-3">
      <Icon size={16} className="text-[var(--sb-indigo)]" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-5 ${className}`}>
      {children}
    </div>
  );
}

function DonutChart({ data, title, icon }: { data: DistItem[]; title: string; icon: React.ElementType }) {
  const total = data.reduce((a, b) => a + b.count, 0);
  return (
    <Card>
      <SectionTitle icon={icon} title={title} />
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            dataKey="count"
            nameKey="label"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-[11px] text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Total: <span className="font-semibold text-foreground">{total.toLocaleString("id-ID")}</span> lowongan
      </p>
    </Card>
  );
}

function HorizontalBar({ data, title, icon }: { data: DistItem[]; title: string; icon: React.ElementType }) {
  const chartData = data.map((d) => ({ name: d.label, count: d.count }));
  return (
    <Card>
      <SectionTitle icon={icon} title={title} />
      <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 32)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--sb-hairline)" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-5">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [data, setData] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${base}/api/v1/stats?top_n=15`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <Badge
          className="mb-3 rounded px-2 py-0.5 normal-case tracking-normal font-medium text-[10px]"
          style={{
            background: "var(--sb-emerald-dim)",
            color: "var(--sb-emerald)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          Data Analytics
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground" style={{ letterSpacing: "-0.04em" }}>
          Market Insights
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Analisis distribusi pasar kerja dari{" "}
          <span className="font-semibold text-foreground">
            {data ? data.total_vectors.toLocaleString("id-ID") : "—"}
          </span>{" "}
          lowongan kerja Indonesia yang telah diproses.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Salary summary stats */}
      {(loading || data) && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
          ) : (
            <>
              <StatCard label="Total Lowongan" value={data!.total_vectors.toLocaleString("id-ID")} sub="dalam dataset" />
              <StatCard label="Rata-rata Gaji" value={fmtRp(data!.salary_stats?.avg)} sub="per bulan" />
              <StatCard label="Median Gaji" value={fmtRp(data!.salary_stats?.median)} sub="per bulan" />
              <StatCard
                label="Data Gaji Tersedia"
                value={`${Math.round(((data!.salary_stats?.count_with_data || 0) / data!.total_vectors) * 100)}%`}
                sub={`${data!.salary_stats?.count_with_data || 0} lowongan`}
              />
            </>
          )}
        </div>
      )}

      {/* Pie charts row */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <ChartSkeleton key={i} />)
        ) : data ? (
          <>
            <DonutChart data={data.employment_type_dist || []} title="Employment Type" icon={Briefcase} />
            <DonutChart data={data.seniority_dist || []} title="Seniority Level" icon={TrendingUp} />
            <DonutChart data={data.work_arrangement_dist || []} title="Work Arrangement" icon={Wifi} />
          </>
        ) : null}
      </div>

      {/* Skills bar charts row */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <ChartSkeleton key={i} />)
        ) : data ? (
          <>
            <HorizontalBar data={data.top_soft_skills || []} title="Top 15 Soft Skills yang Dibutuhkan" icon={BrainCircuit} />
            <HorizontalBar data={data.top_hard_skills || []} title="Top 15 Hard Skills yang Dibutuhkan" icon={BarChart2} />
          </>
        ) : null}
      </div>

      {/* Education distribution */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <ChartSkeleton key={i} />)
        ) : data ? (
          <>
            <DonutChart data={data.education_dist || []} title="Persyaratan Pendidikan" icon={GraduationCap} />
            <Card>
              <SectionTitle icon={Banknote} title="Distribusi Gaji (Salary Stats)" />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <StatCard label="Gaji Minimum" value={fmtRp(data.salary_stats?.min)} sub="dalam dataset" />
                <StatCard label="Gaji Maksimum" value={fmtRp(data.salary_stats?.max)} sub="dalam dataset" />
                <StatCard label="Rata-rata" value={fmtRp(data.salary_stats?.avg)} sub="per bulan" />
                <StatCard label="Median" value={fmtRp(data.salary_stats?.median)} sub="per bulan" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                * Berdasarkan{" "}
                <span className="font-semibold text-foreground">{data.salary_stats?.count_with_data || 0}</span>{" "}
                dari {data.total_vectors.toLocaleString("id-ID")} lowongan yang mencantumkan informasi gaji.
              </p>
            </Card>
          </>
        ) : null}
      </div>
    </main>
  );
}
