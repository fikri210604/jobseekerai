import logging
from collections import Counter
from typing import Dict, Any, List

from backend.services.vector_store import VectorStore, vector_store

logger = logging.getLogger(__name__)

def _to_list(counter: Counter, top_n: int = None) -> list:
    """Helper untuk convert Counter ke list of dict."""
    sorted_items = counter.most_common(top_n) if top_n else counter.most_common()
    return [{"label": k, "count": v} for k, v in sorted_items]

class StatisticService:
    """
    Layanan untuk mengagregasi data statistik dan insight pasar.
    Bertanggung jawab atas caching dan perhitungan sebaran data agar
    VectorStore tetap fokus hanya pada pencarian semantik (Single Responsibility Principle).
    """
    def __init__(self, vs: VectorStore):
        self.vs = vs
        
        # Caches
        self._cached_job_distribution = None
        self._cached_job_category_distribution = None
        self._cached_market_insights = None
        self._cached_job_count = -1

    def _check_cache_invalidation(self):
        """Invalidasi cache jika jumlah data di VectorStore berubah."""
        current_count = len(self.vs._jobs)
        if current_count != self._cached_job_count:
            self._cached_job_distribution = None
            self._cached_job_category_distribution = None
            self._cached_market_insights = None
            self._cached_job_count = current_count

    def get_job_distribution(self) -> list[dict]:
        """Menghitung sebaran lowongan kerja berdasarkan provinsi di Indonesia."""
        self._check_cache_invalidation()
        jobs = self.vs._jobs
        if not jobs:
            return []
            
        if self._cached_job_distribution is not None:
            return self._cached_job_distribution

        # Mapping string provinsi dari dataset ke nama provinsi di shadcnmaps
        province_map = {
            "daerah khusus ibukota jakarta": "Jakarta Raya",
            "jakarta": "Jakarta Raya",
            "daerah istimewa yogyakarta": "Yogyakarta",
            "banten": "Banten",
            "jawa barat": "Jawa Barat",
            "jawa tengah": "Jawa Tengah",
            "jawa timur": "Jawa Timur",
            "bali": "Bali",
            "nusa tenggara barat": "Nusa Tenggara Barat",
            "nusa tenggara timur": "Nusa Tenggara Timur",
            "aceh": "Aceh",
            "sumatera utara": "Sumatera Utara",
            "sumatera barat": "Sumatera Barat",
            "riau": "Riau",
            "kepulauan riau": "Kepulauan Riau",
            "jambi": "Jambi",
            "bengkulu": "Bengkulu",
            "sumatera selatan": "Sumatera Selatan",
            "kepulauan bangka belitung": "Bangka-Belitung",
            "lampung": "Lampung",
            "kalimantan barat": "Kalimantan Barat",
            "kalimantan tengah": "Kalimantan Tengah",
            "kalimantan selatan": "Kalimantan Selatan",
            "kalimantan timur": "Kalimantan Timur",
            "kalimantan utara": "Kalimantan Utara",
            "sulawesi utara": "Sulawesi Utara",
            "gorontalo": "Gorontalo",
            "sulawesi tengah": "Sulawesi Tengah",
            "sulawesi barat": "Sulawesi Barat",
            "sulawesi selatan": "Sulawesi Selatan",
            "sulawesi tenggara": "Sulawesi Tenggara",
            "maluku": "Maluku",
            "maluku utara": "Maluku Utara",
            "papua barat": "Irian Jaya Barat", # shadcnmaps uses Irian Jaya Barat
            "papua": "Papua",
        }

        distribution = {}
        for job in jobs:
            loc = job.get("location", "").lower()
            if not loc or loc == "indonesia":
                continue
                
            parts = [p.strip() for p in loc.split(",")]
            province_str = parts[-1]
            if province_str == "indonesia" and len(parts) > 1:
                province_str = parts[-2]
            
            matched_province = None
            for key, val in province_map.items():
                if key in province_str or key in loc:
                    matched_province = val
                    break
            
            if matched_province:
                distribution[matched_province] = distribution.get(matched_province, 0) + 1

        result = [{"province": k, "count": v} for k, v in distribution.items()]
        self._cached_job_distribution = sorted(result, key=lambda x: x["count"], reverse=True)
        return self._cached_job_distribution

    def get_job_category_distribution(self) -> list[dict]:
        """
        Mengembalikan agregasi jumlah lowongan kerja berdasarkan kategori utama 
        dan sub-kategori yang terurut descending.
        """
        self._check_cache_invalidation()
        jobs = self.vs._jobs
        if not jobs:
            return []
            
        if self._cached_job_category_distribution is not None:
            return self._cached_job_category_distribution
            
        category_map = {}
        for job in jobs:
            cat = job.get("job_category")
            if not cat:
                cat = "Lainnya"
            
            subcat = job.get("job_subcategory")
            if isinstance(subcat, list):
                subcat = ", ".join(str(i) for i in subcat) if subcat else "Umum / General"
            if not subcat or subcat == "None" or subcat == "null" or subcat == "":
                subcat = "Umum / General"
            
            if cat not in category_map:
                category_map[cat] = {"count": 0, "subcategories": {}}
            
            category_map[cat]["count"] += 1
            category_map[cat]["subcategories"][subcat] = category_map[cat]["subcategories"].get(subcat, 0) + 1
            
        result = []
        for cat, data in category_map.items():
            sub_list = [{"subcategory": k, "count": v} for k, v in data["subcategories"].items()]
            sub_list = sorted(sub_list, key=lambda x: x["count"], reverse=True)
            result.append({
                "category": cat,
                "count": data["count"],
                "subcategories": sub_list
            })
            
        self._cached_job_category_distribution = sorted(result, key=lambda x: x["count"], reverse=True)
        return self._cached_job_category_distribution

    def get_market_insights(self, top_n_skills: int = 15) -> dict:
        """
        Mengembalikan semua agregasi distribusi pasar kerja.
        """
        self._check_cache_invalidation()
        jobs = self.vs._jobs
        if not jobs:
            return {}
            
        if self._cached_market_insights is not None:
            return self._cached_market_insights

        emp_counter   = Counter()
        sen_counter   = Counter()
        wa_counter    = Counter()
        edu_counter   = Counter()
        soft_counter  = Counter()
        hard_counter  = Counter()
        
        salaries = []

        for job in jobs:
            if emp := job.get("employment_type"):
                emp_counter[emp] += 1
            if sen := job.get("seniority_level"):
                sen_counter[sen] += 1
            if wa := job.get("work_arrangement"):
                wa_counter[wa] += 1
            if edu := job.get("education_level"):
                edu_counter[edu] += 1
                
            softs = job.get("soft_skills")
            if isinstance(softs, list):
                for s in softs:
                    if str(s).strip(): soft_counter[str(s).title()] += 1
                    
            hards = job.get("hard_skills")
            if isinstance(hards, list):
                for h in hards:
                    if str(h).strip(): hard_counter[str(h).title()] += 1

            if smin := job.get("salary_min"):
                smax = job.get("salary_max") or smin
                salaries.append((smin + smax) / 2)

        salary_stats = None
        if salaries:
            salary_stats = {
                "count_with_data": len(salaries),
                "avg":    int(sum(salaries) / len(salaries)),
                "median": int(sorted(salaries)[len(salaries)//2]),
                "min":    int(min(salaries)),
                "max":    int(max(salaries)),
            }

        self._cached_market_insights = {
            "total_jobs":           len(jobs),
            "employment_type_dist": _to_list(emp_counter),
            "seniority_dist":       _to_list(sen_counter),
            "work_arrangement_dist":_to_list(wa_counter),
            "education_dist":       _to_list(edu_counter),
            "top_soft_skills":      _to_list(soft_counter, top_n_skills),
            "top_hard_skills":      _to_list(hard_counter, top_n_skills),
            "salary_stats":         salary_stats,
        }
        return self._cached_market_insights

    def get_unified_stats(self, top_n_skills: int = 15) -> Dict[str, Any]:
        """
        Mengembalikan semua data statistik (health check + insights + distributions)
        dalam satu response object yang komprehensif.
        """
        stats = self.vs.get_index_stats()
        insights = self.get_market_insights(top_n_skills=top_n_skills)
        job_dist = self.get_job_distribution()
        cat_dist = self.get_job_category_distribution()
        
        return {
            "success": True,
            "status": stats.get("status", "unknown"),
            "total_vectors": stats.get("total_vectors", 0),
            "dimension": stats.get("dimension"),
            "metadata_count": stats.get("jobs_count"),
            
            "employment_type_dist": insights.get("employment_type_dist", []),
            "seniority_dist": insights.get("seniority_dist", []),
            "work_arrangement_dist": insights.get("work_arrangement_dist", []),
            "education_dist": insights.get("education_dist", []),
            "top_soft_skills": insights.get("top_soft_skills", []),
            "top_hard_skills": insights.get("top_hard_skills", []),
            "salary_stats": insights.get("salary_stats"),
            
            "job_distribution": job_dist,
            "job_category_distribution": cat_dist
        }

statistic_service = StatisticService(vector_store)
