"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { RadarDataPoint } from "@/types";

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs border"
      style={{
        background: "var(--sb-surface-2)",
        borderColor: "var(--sb-hairline-strong)",
        color: "var(--sb-ink)",
      }}
    >
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SkillRadarChart({ data }: { data: RadarDataPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="var(--sb-hairline)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--sb-ink-muted)", fontSize: 10, fontFamily: "monospace" }}
          />
          <Radar
            name="Your Skills"
            dataKey="user_score"
            stroke="var(--sb-sky)"
            fill="var(--sb-sky)"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Radar
            name="Required (SKKNI)"
            dataKey="required_score"
            stroke="var(--sb-emerald)"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "10px", color: "var(--sb-ink-muted)" }} iconSize={8} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
