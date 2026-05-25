Create a complete, responsive multi-page web application shell for "SkillBridge AI" utilizing a cohesive dark-themed Minimalist SaaS design system based on #02040a (Canvas background) and #0d1117 (Surface 1 card background). All cards must use 12px corners (rounded-lg) and a 1px subtle border (#1f2430). Use Inter font for text, and JetBrains Mono for numbers/metrics.

Generate the following 5 distinct pages/views that users can navigate between:

1. LANDING PAGE VIEW:
- A bold, minimal Hero Section with a stark headline text in weight 600 and negative tracking (-1.8px): "Bridging Talents to Industry Standards via Semantic Intelligence."
- A prominent primary CTA button ("Get Started") in Indigo (#5e6ad2) and a secondary button ("View Documentation") in #0d1117 with a hairline border.
- A horizontal grid showing 5 monochrome corporate partner logos with a 50% opacity.
- A 3-column minimalist grid detailing the technology stack icons: "SBERT Semantic Search", "XGBoost Re-ranking Engine", and "SKKNI Competency Mapping".

2. FORM PREDICTION (DATA INGESTION) VIEW:
- A clean, centralized form layout. Left column holds standard text inputs for User Profile (Education level dropdown, Total experience years numeric input, Expected Salary).
- Right column features a large Textarea component for "Paste Resume Text / CV" and an interactive grid where users can input Hard Skills that render as removable Badge components.
- At the bottom of the form, insert an "Algorithm Configuration Block": A dropdown menu initialized to "XGBoost Classifier (Tuned)" and an adjustable Slider element labeled "Hybrid Weight Matrix (40% ML / 60% Heuristic)".

3. PREDICTION RESULTS & RECOMMENDATION DASHBOARD VIEW:
- Implement a Split-View Layout. 
- Top Header Strip: Display 3 diagnostic metadata cards: "Total Scraped Jobs Evaluated: 1,322", "Server Inference Latency: 18ms", "Active Algorithm: XGBoost Classifier".
- Right Panel (65% width): A vertical stack of Top-10 Recommended Job Cards. Each card features position title, company name, and location badge on the left. The right side of the card must display a large, prominent emerald green (#10b981) Monospace text block showing the Person-Job Fit metric: "70.1% Confidence Score" accompanied by a small horizontal Progress Bar.

4. SEMANTIC SEARCH RESULTS VIEW:
- A dedicated Information Retrieval (IR) screen. Features a large, minimalist semantic search input bar at the top mimicking a terminal interface.
- Below the search bar, display the search results rows. Each item represents a document retrieved from the SBERT vector space. 
- Crucial Metric Placement: Next to each job title, display the exact mathematical coordinate match using an alternative light-blue color token with font-mono typography: "Cosine Similarity: 0.8958".

5. JOB DETAIL & GAP ANALYTICS VIEW:
- Left Column (50% width): Displays full-text job descriptions, application links, and structural recruitment metadata fetched from the database.
- Right Column (50% width): Titled "SKKNI Competency Gap Analysis". Features a fully rendered Radar Chart (Spider Web graphic) from Recharts overlaying the User Skill Vector (solid light blue area) against the Required National Competency Unit codes (outlined emerald green perimeter). Below the chart, list specific missing unit codes as red-tinted alert badges.

All primary action hooks must use Indigo (#5e6ad2), hover micro-animations must shift components smoothly to #161b22, and all numerals must use the Data Monospace style to maintain a strict, precise analytical feel.