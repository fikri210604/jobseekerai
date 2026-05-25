# agent/models/embedder.py
"""
SBERT Embedder — wrapper untuk sentence-transformers.
Mendukung Bahasa Indonesia dan Inggris.
Singleton pattern agar model hanya di-load sekali.
"""

from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from backend.core.settings import settings

class Embedder:
    _instance = None
    _model: SentenceTransformer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)

            backend_dir = Path(__file__).resolve().parents[1]
            local_model_path = backend_dir / "data" / "retrieval" / "sbert_model_lokal"

            if local_model_path.exists():
                cls._instance._model = SentenceTransformer(str(local_model_path))
            else:
                cls._instance._model = SentenceTransformer(settings.sbert_model)
                
        return cls._instance

    def encode(self, texts: list[str] | str) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        return self._model.encode(texts, convert_to_numpy=True)

    def similarity(self, text_a: str, text_b: str) -> float:
        emb_a = self.encode([text_a])
        emb_b = self.encode([text_b])
        score = cosine_similarity(emb_a, emb_b)[0][0]
        return float(np.clip(score, 0.0, 1.0))

    def similarity_batch(self,query: str,candidates: list[str]) -> list[float]:
        query_emb     = self.encode([query])
        candidate_emb = self.encode(candidates)
        scores        = cosine_similarity(query_emb, candidate_emb)[0]
        return [float(np.clip(s, 0.0, 1.0)) for s in scores]

    def build_skill_text(self, profile: dict) -> str:
        parts = []
        if profile.get("hard_skills"):
            parts.append("Skills: " + ", ".join(profile["hard_skills"]))
        if profile.get("tools"):
            parts.append("Tools: " + ", ".join(profile["tools"]))
        if profile.get("soft_skills"):
            parts.append("Soft skills: " + ", ".join(profile["soft_skills"]))
        if profile.get("work_experience"):
            for exp in profile["work_experience"][:3]:    # max 3 pengalaman
                if exp.get("responsibilities"):
                    parts.append(" ".join(exp["responsibilities"][:2]))
        return ". ".join(parts)

    def build_job_text(self, job: dict) -> str:
        parts = [job.get("title", ""), job.get("description", "")]
        if job.get("required_skills"):
            skill_names = [s.get("name", "") for s in job["required_skills"]]
            parts.append("Required skills: " + ", ".join(skill_names))
        return ". ".join(filter(None, parts))


# Singleton instance — import dan gunakan langsung
embedder = Embedder()
