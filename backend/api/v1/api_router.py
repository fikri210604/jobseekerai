# backend/api/v1/api_router.py
from fastapi import APIRouter
from backend.api.v1.endpoints import match, search, jobs, skills, cv, stats

api_router = APIRouter()

api_router.include_router(match.router, prefix="/match", tags=["Matching"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(cv.router, prefix="/cv", tags=["CV"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics"])

# Placeholder untuk endpoint auth (belum diimplementasi secara full logic)
# api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
