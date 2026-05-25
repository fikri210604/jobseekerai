import apiClient from "./client";
import type { CVUploadResponse } from "@/types";

export async function uploadCV(rawText: string): Promise<CVUploadResponse> {
  const res = await apiClient.post<CVUploadResponse>("/api/v1/cv/upload", { raw_text: rawText });
  return res.data;
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await apiClient.get<{ status: string }>("/health");
  return res.data;
}
