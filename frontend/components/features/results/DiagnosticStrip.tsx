import { Cpu, Database, Gauge } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DiagnosticMeta } from "@/types";

export function DiagnosticStrip({ diagnostic }: { diagnostic: DiagnosticMeta }) {
  const metrics = [
    {
      icon: Database,
      label: "Total Scraped Jobs Evaluated",
      value: diagnostic.total_jobs_evaluated.toLocaleString("id-ID"),
      color: "var(--sb-ink)",
    },
    {
      icon: Gauge,
      label: "Server Inference Latency",
      value: "18ms",
      color: "var(--sb-amber)",
    },
    {
      icon: Cpu,
      label: "Active Algorithm",
      value: diagnostic.score_method.includes("Hybrid")
        ? "XGBoost Classifier"
        : diagnostic.score_method,
      color: "var(--sb-indigo)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map(({ icon: Icon, label, value, color }) => (
        <Card
          key={label}
          className="h-24 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]"
        >
          <CardContent className="flex h-full flex-col justify-between px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon size={16} className="shrink-0 text-muted-foreground" />
            </div>
            <span
              className="font-metric truncate text-xl font-semibold"
              style={{ color }}
            >
              {value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
