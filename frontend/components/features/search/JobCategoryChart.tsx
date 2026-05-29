"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import {
  getJobCategoryDistribution,
  JobCategoryDistributionItem,
} from "@/lib/api/jobs";
import { BarChart3, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function ChartSkeleton() {
  return (
    <div className="w-full h-80 flex flex-col justify-between animate-pulse px-2 py-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 w-full">
          <div className="h-4 w-28 bg-[var(--sb-surface-2)] rounded" />
          <div className="h-8 bg-[var(--sb-surface-2)] rounded-lg" style={{ width: `${90 - i * 12}%` }} />
        </div>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as JobCategoryDistributionItem;

  return (
    <div
      className="rounded-xl p-4 shadow-xl border backdrop-blur-md z-50 pointer-events-none"
      style={{
        background: "rgba(10, 12, 18, 0.95)",
        borderColor: "var(--sb-hairline-strong)",
        color: "var(--sb-ink)",
        width: "280px",
      }}
    >
      <div className="mb-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          Kategori Utama
        </p>
        <p className="text-sm font-bold text-foreground leading-tight">{data.category}</p>
      </div>

      <div className="mb-3 py-1 border-y border-[var(--sb-hairline)] flex items-baseline gap-2">
        <span className="text-xl font-extrabold text-[var(--sb-indigo)] font-mono">
          {data.count}
        </span>
        <span className="text-[10px] text-muted-foreground">Pekerjaan Aktif</span>
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
          Sub-Kategori Terpopuler
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {data.subcategories.slice(0, 5).map((sub, idx) => (
            <div key={sub.subcategory} className="flex items-center justify-between text-xs gap-3">
              <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                {idx + 1}. {sub.subcategory}
              </span>
              <span className="font-mono text-[10px] font-semibold text-foreground bg-[var(--sb-surface-2)] px-1 py-0.5 rounded border border-[var(--sb-hairline)]">
                {sub.count}
              </span>
            </div>
          ))}
          {data.subcategories.length > 5 && (
            <p className="text-[9px] text-muted-foreground italic text-center mt-1">
              + {data.subcategories.length - 5} sub-kategori lainnya
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobCategoryChart() {
  const [data, setData] = useState<JobCategoryDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getJobCategoryDistribution();
        // Ambil top 8 saja agar diagram terlihat lega dan elegan
        setData(res.slice(0, 8));
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data sebaran kategori");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <ChartSkeleton />;

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Diagram</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--sb-hairline-strong)] rounded-xl bg-[var(--sb-surface-1)]">
        <BarChart3 className="size-10 text-muted-foreground mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground mb-1">Data Tidak Tersedia</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Belum ada data lowongan pekerjaan untuk dianalisis.
        </p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full relative z-10">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(94, 106, 210, 0.4)" />
              <stop offset="100%" stopColor="var(--sb-indigo)" />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--sb-ink-muted)",
              fontSize: 11,
              fontFamily: "var(--font-sans), system-ui, sans-serif",
            }}
          />
          <YAxis
            dataKey="category"
            type="category"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--sb-ink-muted)",
              fontSize: 11,
              fontFamily: "var(--font-sans), system-ui, sans-serif",
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(94, 106, 210, 0.04)" }}
          />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[0, 6, 6, 0]}
            barSize={20}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                className="transition-opacity duration-300 hover:opacity-90 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
