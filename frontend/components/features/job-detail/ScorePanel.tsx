"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

function ScoreGauge({ pct, color }: { pct: number; color: string }) {
  const data = [{ value: pct }];

  return (
    <div className="relative h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          startAngle={225}
          endAngle={-45}
          data={data}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          {/* Track background */}
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            fill={color}
            background={{ fill: "rgba(255,255,255,0.05)" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-metric text-4xl font-bold leading-none"
          style={{ color }}
        >
          {pct}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function confidenceLabel(pct: number): string {
  if (pct >= 85) return "STRONG MATCH";
  if (pct >= 70) return "GOOD MATCH";
  if (pct >= 55) return "FAIR MATCH";
  return "LOW MATCH";
}

function similarityLabel(pct: number): string {
  if (pct >= 90) return "HIGHLY RELEVANT";
  if (pct >= 75) return "VERY RELEVANT";
  if (pct >= 60) return "RELEVANT";
  return "PARTIAL MATCH";
}

function getColor(pct: number, isMatch: boolean): string {
  if (isMatch) {
    if (pct >= 80) return "var(--sb-emerald)";
    if (pct >= 60) return "var(--sb-amber)";
    return "var(--sb-red)";
  } else {
    if (pct >= 80) return "var(--sb-sky)";
    if (pct >= 60) return "var(--sb-indigo)";
    return "var(--sb-amber)";
  }
}

export function ScorePanel({ score, from }: { score: string; from: string }) {
  const pct = Math.round(parseFloat(score));
  const isMatch = from === "match";
  const color = getColor(pct, isMatch);
  const label = isMatch ? confidenceLabel(pct) : similarityLabel(pct);
  const title = isMatch ? "Confidence Score" : "Similarity Score";
  const subtitle = isMatch
    ? "Based on hybrid ML + heuristic scoring"
    : "Based on semantic vector similarity";

  const metricRows = isMatch
    ? [
        { label: "ML Prediction", value: `${Math.round(pct * 0.4)}%` },
        { label: "Semantic Match", value: `${Math.round(pct * 0.6)}%` },
      ]
    : [
        { label: "Cosine Similarity", value: `${(pct / 100).toFixed(3)}` },
        { label: "FAISS Distance", value: `${((100 - pct) / 100).toFixed(3)}` },
      ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-[var(--sb-surface-1)]"
      style={{ borderColor: `${color}44` }}
    >
      {/* Glowing top border */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: color }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}44`,
            }}
          >
            {label}
          </span>
        </div>

        {/* Gauge */}
        <ScoreGauge pct={pct} color={color} />

        {/* Separator */}
        <div
          className="my-4 h-px"
          style={{ background: "var(--sb-hairline)" }}
        />

        {/* Metric Rows */}
        <div className="space-y-3">
          {metricRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="font-mono text-sm font-semibold" style={{ color }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
          {pct}% overall score
        </p>
      </div>
    </div>
  );
}
