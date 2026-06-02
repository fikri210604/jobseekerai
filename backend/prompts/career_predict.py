# agent/prompts/career_predict.py
"""
Prompt untuk prediksi karir dan rekomendasi upskilling.
Digunakan sebagai konteks naratif pelengkap output ML model.
"""

CAREER_PREDICT_PROMPT = """
You are a career strategist and workforce analyst for the Indonesian job market.

Given the user's current profile and ML model predictions, generate a comprehensive
career development narrative and upskilling roadmap.

User Profile:
\"\"\"
{user_profile_json}
\"\"\"

ML Model Predictions:
\"\"\"
{ml_predictions_json}
\"\"\"

Top Skill Demand Trends (next 6 months):
\"\"\"
{skill_trends_json}
\"\"\"

Return a JSON object with EXACTLY this structure:
{{
  "career_narrative": "3-4 sentence personalized career story based on their profile.",
  "current_level": "Junior | Mid | Senior | Lead | Executive",
  "predicted_next_role": "Most likely next job title in 1-2 years",
  "predicted_roles_ladder": [
    {{
      "role": "job title",
      "timeframe": "e.g., 6-12 months",
      "key_requirement": "most critical skill to unlock this role"
    }}
  ],
  "trending_skills_to_learn": [
    {{
      "skill": "skill name",
      "demand_growth": "e.g., +34% in 6 months",
      "relevance_to_user": "why this skill matters for their career path",
      "urgency": "high | medium | low"
    }}
  ],
  "upskilling_roadmap": [
    {{
      "phase": integer,
      "title": "phase title e.g., Foundation",
      "duration_weeks": integer,
      "focus_skills": ["skill1", "skill2"],
      "resources": [
        {{
          "name": "course/resource name",
          "platform": "Dicoding | Coursera | YouTube | etc",
          "url": "url or null",
          "is_free": boolean,
          "duration_hours": integer_or_null
        }}
      ]
    }}
  ],
  "industry_insight": "1-2 sentences about the Indonesian market outlook for their field.",
  "confidence_score": float_0_to_1
}}

Guidelines:
- career_narrative: personalized, encouraging but realistic — mention their actual skills
- predicted_roles_ladder: max 3 steps, realistic progression
- trending_skills_to_learn: max 4, prioritize skills with high demand AND relevance to user
- upskilling_roadmap: max 3 phases, practical and achievable
- Prioritize Indonesian platforms: Dicoding, MySkill, Skill Academy, RevoU
- Return ONLY valid JSON, no explanation outside the object
""".strip()


CAREER_SUMMARY_PROMPT = """
You are JobSeeker AI. Summarize this career analysis into 3 concise bullet points
in {language} that a user can immediately act on. Be specific, not generic.

Career Analysis:
\"\"\"
{career_analysis_json}
\"\"\"

Return a JSON array of exactly 3 strings:
["bullet point 1", "bullet point 2", "bullet point 3"]

Return ONLY valid JSON array.
""".strip()


def build_career_predict_prompt(
    user_profile: dict,
    ml_predictions: dict,
    skill_trends: list,
) -> str:
    import json
    return CAREER_PREDICT_PROMPT.format(
        user_profile_json=json.dumps(user_profile, ensure_ascii=False, indent=2),
        ml_predictions_json=json.dumps(ml_predictions, ensure_ascii=False, indent=2),
        skill_trends_json=json.dumps(skill_trends, ensure_ascii=False, indent=2),
    )


def build_career_summary_prompt(career_analysis: dict, language: str = "Indonesian") -> str:
    import json
    return CAREER_SUMMARY_PROMPT.format(
        career_analysis_json=json.dumps(career_analysis, ensure_ascii=False, indent=2),
        language=language,
    )
