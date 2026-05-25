import re

SKILL_ALIASES = {
    # Programming Languages
    "python3": "python",
    "py": "python",
    "python programming": "python",
    "js": "javascript",
    "javascripting": "javascript",
    "es6": "javascript",
    "ts": "typescript",
    "go": "golang",
    "go-lang": "golang",
    "golang programming": "golang",
    "kotlin lang": "kotlin",
    "swift lang": "swift",
    "php programming": "php",
    "java programming": "java",
    "c sharp": "c#",
    "c-sharp": "c#",
    "cpp": "c++",
    "c plus plus": "c++",
    
    # Web Frameworks/Tech
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "react-native": "react native",
    "reactnative": "react native",
    "vuejs": "vue",
    "vue.js": "vue",
    "vue js": "vue",
    "angularjs": "angular",
    "angular.js": "angular",
    "angular js": "angular",
    "nodejs": "node.js",
    "node.js": "node.js",
    "node js": "node.js",
    "laravel framework": "laravel",
    "ci": "codeigniter",
    "ci3": "codeigniter",
    "ci4": "codeigniter",
    "django framework": "django",
    "flask framework": "flask",
    "springboot": "spring boot",
    "spring": "spring boot",
    "html5": "html",
    "css3": "css",
    "flutter framework": "flutter",
    "flutter framework/sdk": "flutter",
    
    # Database
    "mysql": "sql",
    "postgresql": "sql",
    "postgres": "sql",
    "sqlite": "sql",
    "mssql": "sql",
    "sql server": "sql",
    
    # DevOps/Cloud
    "docker container": "docker",
    "docker-compose": "docker",
    "k8s": "kubernetes",
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "dev-ops": "devops",
    "cicd": "ci/cd",
    "github": "git",
    "gitlab": "git",
    
    # Data Science/AI
    "ml": "machine learning",
    "machinelearning": "machine learning",
    "ai": "artificial intelligence",
    "artificialintelligence": "artificial intelligence",
    "dl": "deep learning",
    "nlp": "natural language processing",
    "datascience": "data science",
    "data analyst": "data analysis",
    "dataanalysis": "data analysis",
    
    # Design/Product
    "ui ux": "ui/ux",
    "uiux": "ui/ux",
    "user interface": "ui/ux",
    "user experience": "ui/ux",
    "product manager": "product management",
    "pm": "product management",
    "project manager": "project management",
    "pmp": "project management",
    "figma design": "figma",
    "photoshop": "adobe photoshop",
    "ps": "adobe photoshop",
    "illustrator": "adobe illustrator",
    "ai (illustrator)": "adobe illustrator",
    
    # Soft Skills & Others
    "komunikasi": "communication",
    "interpersonal skill": "communication",
    "kerjasama": "teamwork",
    "kerja sama": "teamwork",
    "kolaborasi": "teamwork",
    "pemecahan masalah": "problem solving",
    "berpikir kritis": "critical thinking",
    "manajemen waktu": "time management",
    "negosiasi": "negotiation",
    "presentasi": "public speaking",
    "digitalmarketing": "digital marketing",
    "social media marketing": "digital marketing",
    "search engine optimization": "seo",
    "cybersecurity": "cyber security",
    "information security": "cyber security",
    "qa": "quality assurance",
    "qa engineer": "quality assurance",
    "quality assurance engineer": "quality assurance"
}

def normalize_skill(skill_name: str) -> str:
    if not skill_name:
        return ""
    # Lowercase & strip
    s = skill_name.strip().lower()
    # Normalize spaces
    s = re.sub(r'\s+', ' ', s)
    # Check alias
    return SKILL_ALIASES.get(s, s)
