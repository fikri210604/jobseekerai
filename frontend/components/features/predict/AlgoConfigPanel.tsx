"use client";

import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/lib/store";
import type { AlgorithmType } from "@/types";

const ALGORITHM_OPTIONS: { value: AlgorithmType; label: string }[] = [
  { value: "xgboost_tuned", label: "XGBoost Classifier (Tuned)" },
  { value: "random_forest", label: "Random Forest" },
  { value: "logistic_regression", label: "Logistic Regression" },
];

export function AlgoConfigPanel() {
  const { algorithmConfig, setAlgorithm, setHybridWeight } = useUserStore();

  const mlPct = Math.round(algorithmConfig.hybrid_weight * 100);
  const heuristicPct = 100 - mlPct;

  return (
    <Card
      className="mt-6 rounded-xl border-[var(--sb-hairline)]"
      style={{ background: "var(--sb-surface-1)" }}
    >
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="flex items-center gap-2 text-[10px] normal-case tracking-widest text-muted-foreground">
          <SlidersHorizontal size={13} style={{ color: "var(--sb-indigo)" }} />
          Algorithm Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Algorithm selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Classification Algorithm
            </label>
            <Select
              value={algorithmConfig.algorithm}
              onValueChange={(v) => setAlgorithm(v as AlgorithmType)}
            >
              <SelectTrigger className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] text-sm h-10 px-3 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALGORITHM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="font-mono">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hybrid weight slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Hybrid Weight Matrix
              </label>
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--sb-indigo)" }}
              >
                {mlPct}% ML · {heuristicPct}% Heuristic
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[mlPct]}
              onValueChange={([v]) => setHybridWeight(v / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0% ML</span>
              <span>100% ML</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
