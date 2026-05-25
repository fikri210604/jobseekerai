# backend/api/dependencies.py
"""
Dependency Injection (DI) layer untuk FastAPI.
Menyediakan instance service ke endpoint (router).
"""

from backend.core.settings import settings, Settings
from backend.services.matcher_service import matcher, MatcherService
from backend.services.vector_store import vector_store, VectorStore

def get_settings() -> Settings:
    """Dependency untuk mendapatkan konfigurasi global."""
    return settings

def get_matcher() -> MatcherService:
    """Dependency untuk mendapatkan instance MatcherService."""
    return matcher

def get_vector_store() -> VectorStore:
    """Dependency untuk mendapatkan instance VectorStore."""
    return vector_store
