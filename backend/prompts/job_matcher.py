# agent/prompts/job_matcher.py
"""
Prompt untuk job matching — mencocokkan profil user
dengan daftar lowongan dan mengembalikan top N matches.
"""

JOB_MATCH_PROMPT = """
You are a job matching engine specialized in the Indonesian labor market.

Given the user's skill profile and a list of available job openings, rank and return
the top {top_n} best-matched jobs with detailed match reasoning.

User Profile:
\"\"\"
{user_profile_json}
\"\"\"

Available Job Openings:
\"\"\"
{job_listings_json}
\"\"\"

Return a JSON array of the top {top_n} matches:
[
  {{
    "job_id": "string",
    "job_title": "string",
    "company": "string",
    "location": "string",
    "match_score": float_0_to_100,
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill3", "skill4"],
    "bonus_skills": ["skills user has that exceed requirements"],
    "match_summary": "One concise sentence explaining why this job fits the user.",
    "recommendation_tag": "Strong Match | Good Match | Stretch Goal"
  }}
]

Matching rules:
- Prioritize hard_skills and tools over soft_skills in scoring
- Give extra weight to certifications that are explicitly required by the job
- match_score must be realistic — do not inflate scores above actual skill overlap
- missing_skills: only list skills explicitly required by the job posting
- bonus_skills: list user skills that go beyond what the job requires
- recommendation_tag:
    "Strong Match"  → match_score >= 75
    "Good Match"    → match_score 50–74
    "Stretch Goal"  → match_score < 50
- Sort results descending by match_score
- Return ONLY valid JSON array, no explanation outside the array
""".strip()


def build_job_match_prompt(
    user_profile: dict,
    job_listings: list,
    top_n: int = 5,
) -> str:
    import json
    return JOB_MATCH_PROMPT.format(
        user_profile_json=json.dumps(user_profile, ensure_ascii=False, indent=2),
        job_listings_json=json.dumps(job_listings, ensure_ascii=False, indent=2),
        top_n=top_n,
    )
