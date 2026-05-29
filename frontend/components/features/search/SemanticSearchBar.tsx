"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchStore } from "@/lib/store";
import { semanticSearch } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indonesiaMapData } from "@/components/shadcnmaps/map-data/indonesia";

const SUGGESTION_QUERIES = [
  "data scientist machine learning python",
  "backend engineer fastapi postgresql",
  "nlp engineer large language model",
  "cloud architect gcp kubernetes",
  "product manager fintech agile",
];

export function SemanticSearchBar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    query, setQuery,
    setResults,
    isSearching, setSearching,
    error, setError,
    hasSearched, clearSearch,
  } = useSearchStore();

  const [jobValue, setJobValue] = useState(query);
  const [locationValue, setLocationValue] = useState("all");
  const [showValidationError, setShowValidationError] = useState(false);

  const jobInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only focus if we are on the search page
    if (pathname === "/search") {
      jobInputRef.current?.focus();
    }
  }, [pathname]);

  const executeSearch = async (job: string, loc: string) => {
    if (!job.trim()) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);

    setQuery(job.trim());
    setSearching(true);

    if (pathname !== "/search") {
      router.push("/search");
    }

    try {
      const response = await semanticSearch({
        query: job.trim(),
        top_k: 10,
        province: loc !== "all" ? loc : null,
      });
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(jobValue, locationValue);
    }
  };

  return (
    <div className="w-full">
      {showValidationError && (
        <Alert variant="warning" className="mx-auto w-full max-w-4xl mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Silahkan isi kolom pencarian terlebih dahulu
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mx-auto w-full max-w-4xl mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      <div className={`mx-auto w-full max-w-4xl rounded-xl border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)] p-2 shadow-[0_0_40px_-18px_rgba(94,106,210,0.65)] ${pathname === "/search" ? "mb-6" : ""}`}>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] px-3">
            <Search size={17} className="text-muted-foreground shrink-0" />
            <Input
              ref={jobInputRef}
              value={jobValue}
              onChange={(e) => setJobValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
              placeholder="Nama pekerjaan, skill, atau perusahaan"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] px-3">
            <MapPin size={17} className="text-muted-foreground shrink-0" />
            <Select value={locationValue} onValueChange={(val) => setLocationValue(val)}>
              <SelectTrigger className="h-12 border-0 bg-transparent px-0 text-sm focus:ring-0 focus:ring-offset-0 shadow-none w-full">
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
          <Button
            onClick={() => executeSearch(jobValue, locationValue)}
            disabled={isSearching || (!jobValue.trim() && locationValue === "all")}
            className="h-12 rounded-lg normal-case tracking-normal min-w-[120px]"
            style={{ background: "var(--sb-indigo)", color: "#fff" }}
          >
            {isSearching ? <Spinner className="size-4 mr-2" /> : "Cari"}
            {!isSearching && <ArrowRight size={15} className="ml-2" />}
          </Button>
        </div>
      </div>

      {/* Suggestion chips */}
      {!hasSearched && pathname === "/search" && (
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {SUGGESTION_QUERIES.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="xs"
              onClick={() => {
                setJobValue(q);
                setLocationValue("all");
                executeSearch(q, "all");
              }}
              className="rounded-md normal-case tracking-normal font-normal text-muted-foreground"
            >
              {q}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
