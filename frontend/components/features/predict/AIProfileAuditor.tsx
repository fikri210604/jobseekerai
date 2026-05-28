"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AuditSuggestion {
  type: string;
  icon: string;
  title: string;
  description: string;
  action_data?: string[];
}

interface AuditResponse {
  success: boolean;
  suggestions: AuditSuggestion[];
}

export function AIProfileAuditor() {
  const { rawCvText, skills, addSkill } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    if (!rawCvText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${base}/api/v1/cv/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: rawCvText,
          user_skills: skills,
        }),
      });

      if (!res.ok) throw new Error("Gagal melakukan audit CV");
      const data: AuditResponse = await res.json();
      setResults(data.suggestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySkills = (newSkills: string[]) => {
    newSkills.forEach((s) => addSkill(s));
    // Remove the suggestion after applying
    setResults((prev) => prev?.filter((s) => s.type !== "skill_ingestion") || null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={handleAudit}
          disabled={!rawCvText.trim()}
          size="sm"
          className="absolute bottom-4 right-4 gap-2 bg-[var(--sb-indigo)] text-white hover:bg-[var(--sb-indigo-hover)] shadow-lg"
          style={{ borderRadius: "99px" }}
        >
          <Sparkles size={14} />
          Audit CV Profile
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-[var(--sb-canvas)]">
        <SheetHeader className="p-6 border-b border-[var(--sb-hairline)] bg-[var(--sb-surface-1)]">
          <SheetTitle className="flex items-center gap-2 normal-case tracking-normal text-lg">
            <Sparkles size={18} className="text-[var(--sb-indigo)]" />
            AI Profile Auditor
          </SheetTitle>
          <SheetDescription className="text-xs">
            Review otomatis terhadap kualitas dan kelengkapan CV Anda untuk Applicant Tracking System (ATS).
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={32} className="animate-spin text-[var(--sb-indigo)] mb-4" />
              <p className="text-sm">Menganalisis teks CV...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-900/10 p-4 border border-red-800/30 text-red-400 text-sm">
              {error}
            </div>
          ) : results?.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sb-emerald-dim)] text-[var(--sb-emerald)] mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">CV Sudah Optimal!</h3>
              <p className="text-xs text-muted-foreground">Kami tidak menemukan celah mayor dalam deskripsi profil Anda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results?.map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="text-xl shrink-0 mt-0.5">{s.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground mb-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {s.description}
                      </p>
                      
                      {s.type === "skill_ingestion" && s.action_data && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApplySkills(s.action_data!)}
                          className="w-full text-xs h-8 gap-2 border-[var(--sb-indigo)] text-[var(--sb-indigo)] hover:bg-[var(--sb-indigo)] hover:text-white"
                        >
                          Tambahkan {s.action_data.length} Skill Otomatis
                          <ArrowRight size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
