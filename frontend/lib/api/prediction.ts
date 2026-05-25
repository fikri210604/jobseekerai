import apiClient from "./client";
import type { CareerPredictRequest, CareerPrediction } from "@/types";

export async function predictCareer(payload: CareerPredictRequest): Promise<CareerPrediction> {
  const res = await apiClient.post<CareerPrediction>("/api/v1/career/predict", payload);
  return res.data;
}
