"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/lib/store";
import { AIProfileAuditor } from "./AIProfileAuditor";
import { CVGuideModal } from "./CVGuideModal";

export function CVTextarea() {
  const { rawCvText, setRawCvText } = useUserStore();

  return (
    <Card
      className="flex h-full flex-col rounded-xl border-[var(--sb-hairline)]"
      style={{ background: "var(--sb-surface-1)" }}
    >
      <CardHeader className="px-6 pt-6 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] normal-case tracking-widest text-muted-foreground">
            Teks CV / Resume Opsional
          </CardTitle>
          <CVGuideModal />
        </div>
        <CardDescription className="text-[11px]">
          API matching memakai profil terstruktur. Teks CV disimpan sebagai
          konteks tambahan untuk workflow berikutnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-6 pb-6 pt-4 relative">
        <Textarea
          value={rawCvText}
          onChange={(e) => setRawCvText(e.target.value)}
          placeholder={`Nama: Budi Santoso\nPendidikan: S1 Teknik Informatika\nPengalaman: 3 tahun sebagai Software Engineer\nCatatan tambahan: tertarik pada backend, data, dan AI products...`}
          className="min-h-[320px] flex-1 resize-none border-b font-mono text-xs"
          style={{
            borderColor:
              rawCvText.length > 0
                ? "var(--sb-hairline-strong)"
                : "var(--sb-hairline)",
          }}
        />
        <div
          className="mt-2 text-left font-mono text-[10px]"
          style={{
            color:
              rawCvText.length > 0
                ? "var(--sb-emerald)"
                : "var(--sb-ink-faint)",
          }}
        >
          {rawCvText.length} chars
        </div>
        
        {/* Render Auditor Panel Trigger Button */}
        <AIProfileAuditor />
      </CardContent>
    </Card>
  );
}
