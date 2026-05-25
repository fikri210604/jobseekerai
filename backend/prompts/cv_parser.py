# agent/prompts/cv_parser.py
"""
Prompt untuk parsing CV — mengubah raw text hasil OCR
menjadi JSON terstruktur yang siap diproses pipeline berikutnya.
"""

CV_PARSE_PROMPT = """
You are a professional CV parser for the Indonesian job market.

Given the raw text extracted from a CV (possibly from OCR), extract all information
and return it as a clean, structured JSON object.

Raw CV Text:
\"\"\"
{raw_text}
\"\"\"

Return a JSON object with EXACTLY this structure:
{{
  "personal_info": {{
    "full_name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "city/province or null",
    "linkedin_url": "string or null",
    "portfolio_url": "string or null"
  }},
  "education": [
    {{
      "degree": "SMA | D3 | S1 | S2 | S3",
      "major": "string",
      "institution": "string",
      "graduation_year": integer_or_null,
      "gpa": float_or_null
    }}
  ],
  "work_experience": [
    {{
      "job_title": "string",
      "company": "string",
      "start_date": "Month YYYY or null",
      "end_date": "Month YYYY or Sekarang",
      "duration_months": integer_or_null,
      "responsibilities": ["string", "string"]
    }}
  ],
  "hard_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": [
    {{
      "name": "string",
      "issuer": "string or null",
      "year": integer_or_null
    }}
  ],
  "languages": [
    {{
      "language": "string",
      "proficiency": "Native | Fluent | Intermediate | Basic"
    }}
  ],
  "organizations": [
    {{
      "name": "string",
      "role": "string",
      "period": "string or null"
    }}
  ],
  "total_experience_years": float,
  "suggested_job_titles": ["Title 1", "Title 2", "Title 3"],
  "ocr_confidence_notes": "string describing suspected OCR errors, or null"
}}

Parsing rules:
- Normalize skill names to standard industry terms (e.g., "ms word" → "Microsoft Word", "js" → "JavaScript")
- For total_experience_years: calculate from work_experience durations, return 0.0 if fresh graduate
- suggested_job_titles: max 3, must be realistic based on the full profile
- ocr_confidence_notes: flag words that look like OCR misreads (e.g., "G0jek" instead of "Gojek")
- If a section is not found in the CV, return empty array [] or null accordingly
- Return ONLY valid JSON, no explanation, no markdown code blocks
""".strip()


def build_cv_parse_prompt(raw_text: str) -> str:
    """Inject raw text ke dalam template prompt."""
    return CV_PARSE_PROMPT.format(raw_text=raw_text)
