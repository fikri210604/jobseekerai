# backend/api/dependencies.py
"""
Dependency Injection (DI) layer untuk FastAPI.
Menyediakan instance service ke endpoint (router).
"""

from typing import Optional
from fastapi import Header, HTTPException, status
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

def verify_api_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")) -> str:
    """Dependency untuk memverifikasi API Key pada header X-API-Key."""
    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing API Key"
        )
    return x_api_key




