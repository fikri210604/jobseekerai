// ============================================================
// SkillBridge AI — Global State Store (Zustand)
// Stores: userProfileState | predictionResultState | semanticSearchState
// ============================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  ParsedCV,
  MatchResult,
  MatchResponse,
  SearchResult,
  SearchResponse,
  SkillGapReport,
  CareerPrediction,
  AlgorithmConfig,
  AlgorithmType,
  DiagnosticMeta,
} from "@/types";

// -----------------------------------------------------------
// 1. User Profile Store
//    Menyimpan input form pengguna sebelum dikirim ke backend
// -----------------------------------------------------------

interface UserProfileState {
  rawCvText: string;
  skills: string[];
  softSkills: string[];
  education: ParsedCV["education"];
  experienceYears: number;
  expectedSalary: number;
  preferredCategory: string;
  certificationsCount: number;
  location: string;
  algorithmConfig: AlgorithmConfig;
  isFormReady: boolean;

  setRawCvText: (text: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setSkills: (skills: string[]) => void;
  addSoftSkill: (skill: string) => void;
  removeSoftSkill: (skill: string) => void;
  setSoftSkills: (skills: string[]) => void;
  setEducation: (edu: ParsedCV["education"]) => void;
  setExperienceYears: (years: number) => void;
  setExpectedSalary: (salary: number) => void;
  setPreferredCategory: (category: string) => void;
  setCertificationsCount: (count: number) => void;
  setLocation: (location: string) => void;
  setAlgorithmConfig: (config: Partial<AlgorithmConfig>) => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  setHybridWeight: (weight: number) => void;
  resetProfile: () => void;
}

const defaultAlgorithmConfig: AlgorithmConfig = {
  algorithm: "xgboost_tuned",
  hybrid_weight: 0.4,
};

const defaultProfileState = {
  rawCvText: "",
  skills: [],
  softSkills: [],
  education: "s1" as ParsedCV["education"],
  experienceYears: 0,
  expectedSalary: 5_000_000,
  preferredCategory: "Technology",
  certificationsCount: 0,
  location: "Jakarta",
  algorithmConfig: defaultAlgorithmConfig,
  isFormReady: false,
};

export const useUserStore = create<UserProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultProfileState,

        setRawCvText: (text) => set({ rawCvText: text }),

        addSkill: (skill) => {
          const normalized = skill.trim().toLowerCase();
          if (!normalized || get().skills.includes(normalized)) return;
          set((s) => ({ skills: [...s.skills, normalized] }));
        },

        removeSkill: (skill) =>
          set((s) => ({ skills: s.skills.filter((sk) => sk !== skill) })),

        setSkills: (skills) => set({ skills }),
        addSoftSkill: (skill) => {
          const normalized = skill.trim().toLowerCase();
          if (!normalized || get().softSkills.includes(normalized)) return;
          set((s) => ({ softSkills: [...s.softSkills, normalized] }));
        },

        removeSoftSkill: (skill) =>
          set((s) => ({ softSkills: s.softSkills.filter((sk) => sk !== skill) })),

        setSoftSkills: (softSkills) => set({ softSkills }),
        setEducation: (edu) => set({ education: edu }),
        setExperienceYears: (years) => set({ experienceYears: years }),
        setExpectedSalary: (salary) => set({ expectedSalary: salary }),
        setPreferredCategory: (preferredCategory) => set({ preferredCategory }),
        setCertificationsCount: (certificationsCount) =>
          set({ certificationsCount }),
        setLocation: (location) => set({ location }),

        setAlgorithmConfig: (config) =>
          set((s) => ({
            algorithmConfig: { ...s.algorithmConfig, ...config },
          })),

        setAlgorithm: (algorithm) =>
          set((s) => ({
            algorithmConfig: { ...s.algorithmConfig, algorithm },
          })),

        setHybridWeight: (weight) =>
          set((s) => ({
            algorithmConfig: { ...s.algorithmConfig, hybrid_weight: weight },
          })),

        resetProfile: () => set(defaultProfileState),
      }),
      {
        name: "skillbridge-user-profile",
        partialize: (s) => ({
          skills: s.skills,
          softSkills: s.softSkills,
          education: s.education,
          experienceYears: s.experienceYears,
          expectedSalary: s.expectedSalary,
          preferredCategory: s.preferredCategory,
          certificationsCount: s.certificationsCount,
          location: s.location,
          algorithmConfig: s.algorithmConfig,
        }),
      }
    ),
    { name: "UserProfileStore" }
  )
);

// -----------------------------------------------------------
// 2. Prediction Results Store
//    Menyimpan hasil dari POST /api/v1/recommend/jobs
// -----------------------------------------------------------

interface PredictionResultsState {
  results: MatchResult[];
  diagnostic: DiagnosticMeta | null;
  isLoading: boolean;
  error: string | null;
  hasResults: boolean;

  setResults: (response: MatchResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export const useResultsStore = create<PredictionResultsState>()(
  devtools(
    (set) => ({
      results: [],
      diagnostic: null,
      isLoading: false,
      error: null,
      hasResults: false,

      setResults: (response) =>
        set({
          results: response.recommendations,
          diagnostic: {
            total_jobs_evaluated: response.total_jobs_evaluated,
            recommendations_count: response.recommendations_count,
            score_method: response.score_method,
          },
          hasResults: response.recommendations.length > 0,
          error: null,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),

      clearResults: () =>
        set({
          results: [],
          diagnostic: null,
          hasResults: false,
          error: null,
          isLoading: false,
        }),
    }),
    { name: "PredictionResultsStore" }
  )
);

// -----------------------------------------------------------
// 3. Semantic Search Store
//    Menyimpan hasil dari GET /api/v1/retrieval/search
// -----------------------------------------------------------

interface SemanticSearchState {
  query: string;
  results: SearchResult[];
  total: number;
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;

  setQuery: (query: string) => void;
  setResults: (response: SearchResponse) => void;
  setSearching: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SemanticSearchState>()(
  devtools(
    (set) => ({
      query: "",
      results: [],
      total: 0,
      isSearching: false,
      error: null,
      hasSearched: false,

      setQuery: (query) => set({ query }),

      setResults: (response) =>
        set({
          results: response.data,
          total: response.total,
          hasSearched: true,
          error: null,
          isSearching: false,
        }),

      setSearching: (loading) => set({ isSearching: loading }),
      setError: (error) => set({ error, isSearching: false }),

      clearSearch: () =>
        set({
          query: "",
          results: [],
          total: 0,
          hasSearched: false,
          error: null,
          isSearching: false,
        }),
    }),
    { name: "SemanticSearchStore" }
  )
);

// -----------------------------------------------------------
// 4. Skill Gap Store (untuk job detail page)
// -----------------------------------------------------------

interface SkillGapState {
  report: SkillGapReport | null;
  isLoading: boolean;
  error: string | null;

  setReport: (report: SkillGapReport) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearReport: () => void;
}

export const useSkillGapStore = create<SkillGapState>()(
  devtools(
    (set) => ({
      report: null,
      isLoading: false,
      error: null,

      setReport: (report) => set({ report, error: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
      clearReport: () => set({ report: null, error: null }),
    }),
    { name: "SkillGapStore" }
  )
);

// -----------------------------------------------------------
// 5. Career Prediction Store
// -----------------------------------------------------------

interface CareerPredictionState {
  prediction: CareerPrediction | null;
  isLoading: boolean;
  error: string | null;

  setPrediction: (prediction: CareerPrediction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCareerStore = create<CareerPredictionState>()(
  devtools(
    (set) => ({
      prediction: null,
      isLoading: false,
      error: null,

      setPrediction: (prediction) =>
        set({ prediction, error: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    { name: "CareerPredictionStore" }
  )
);
