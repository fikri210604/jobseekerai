"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IndonesiaMap } from "@/components/shadcnmaps/maps/indonesia";
import { indonesiaMapData } from "@/components/shadcnmaps/map-data/indonesia";
import { getJobDistribution, type JobDistributionItem } from "@/lib/api/jobs";
import type { RegionOverride } from "@/components/shadcnmaps/types";
import { MapControls } from "@/components/shadcnmaps/map-controls";

export function JobDistributionMap() {
  const [data, setData] = useState<JobDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getJobDistribution();
        setData(result);
      } catch (e) {
        console.error("Failed to load job distribution:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const regionOverrides = useMemo(() => {
    if (!data.length) return [];

    const maxCount = Math.max(...data.map((d) => d.count));
    const minCount = Math.min(...data.map((d) => d.count));

    // Simple color scale generator
    const getColorClass = (count: number) => {
      if (count === 0) return "fill-slate-100 dark:fill-slate-800";
      const ratio = (count - minCount) / (maxCount - minCount || 1);
      
      if (ratio > 0.8) return "fill-blue-700 dark:fill-blue-600 hover:fill-blue-800 dark:hover:fill-blue-500";
      if (ratio > 0.6) return "fill-blue-500 dark:fill-blue-500 hover:fill-blue-600 dark:hover:fill-blue-400";
      if (ratio > 0.4) return "fill-blue-400 dark:fill-blue-400 hover:fill-blue-500 dark:hover:fill-blue-300";
      if (ratio > 0.2) return "fill-blue-300 dark:fill-blue-300 hover:fill-blue-400 dark:hover:fill-blue-200";
      return "fill-blue-200 dark:fill-blue-200 hover:fill-blue-300 dark:hover:fill-blue-100";
    };

    const overrides: RegionOverride[] = [];

    indonesiaMapData.regions.forEach((region) => {
      const match = data.find((d) => d.province === region.name);
      const count = match ? match.count : 0;

      overrides.push({
        id: region.id,
        className: `transition-colors duration-300 stroke-background ${getColorClass(count)}`,
        tooltipContent: (
          <div className="flex flex-col gap-1 p-1">
            <span className="font-semibold text-sm">{region.name}</span>
            <span className="text-xs text-muted-foreground">
              {count} Lowongan Tersedia
            </span>
          </div>
        ),
      });
    });

    return overrides;
  }, [data]);

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Sebaran Lowongan per Provinsi</CardTitle>
        <CardDescription>
          Distribusi geografis pekerjaan di seluruh Indonesia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : null}
        
        <div className="w-full h-full absolute inset-0 p-4 flex items-center justify-center">
          <IndonesiaMap
            regions={regionOverrides}
            enableZoom={true}
            showLabels={false}
            className="w-full h-full max-h-[600px] object-contain"
            controls={
              <MapControls className="absolute top-4 right-4" />
            }
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-background/80 p-3 rounded-md backdrop-blur-sm border text-xs">
          <div className="font-semibold">Jumlah Lowongan</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm fill-blue-700 bg-blue-700 dark:bg-blue-600"></div>
            <span>Sangat Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm fill-blue-500 bg-blue-500 dark:bg-blue-500"></div>
            <span>Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm fill-blue-300 bg-blue-300 dark:bg-blue-300"></div>
            <span>Sedang</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm fill-blue-200 bg-blue-200 dark:bg-blue-200"></div>
            <span>Rendah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm fill-slate-100 bg-slate-100 dark:bg-slate-800 border"></div>
            <span>Tidak Ada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
