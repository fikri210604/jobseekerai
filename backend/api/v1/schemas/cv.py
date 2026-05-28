from pydantic import BaseModel
from typing import Optional

class CVAuditRequest(BaseModel):
    cv_text: str
    user_skills: list[str]

class CVAuditSuggestion(BaseModel):
    type: str
    icon: str
    title: str
    description: str
    action_data: Optional[list[str]] = None

class CVAuditResponse(BaseModel):
    success: bool
    suggestions: list[CVAuditSuggestion]
