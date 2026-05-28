from pydantic import BaseModel
from typing import Optional

class DistributionItem(BaseModel):
    label: str
    count: int

class SalaryStats(BaseModel):
    count_with_data: int
    avg:    Optional[int] = None
    median: Optional[int] = None
    min:    Optional[int] = None
    max:    Optional[int] = None

class JobDistributionItem(BaseModel):
    province: str
    count: int

class SubCategoryItem(BaseModel):
    subcategory: str
    count: int

class JobCategoryDistributionItem(BaseModel):
    category: str
    count: int
    subcategories: list[SubCategoryItem]

class StatsResponse(BaseModel):
    success:        bool
    status:         str
    total_vectors:  int
    dimension:      Optional[int] = None
    metadata_count: Optional[int] = None
    
    # Market insights
    employment_type_dist:    Optional[list[DistributionItem]] = None
    seniority_dist:          Optional[list[DistributionItem]] = None
    work_arrangement_dist:   Optional[list[DistributionItem]] = None
    education_dist:          Optional[list[DistributionItem]] = None
    top_soft_skills:         Optional[list[DistributionItem]] = None
    top_hard_skills:         Optional[list[DistributionItem]] = None
    salary_stats:            Optional[SalaryStats] = None
    
    # Unified distributions
    job_distribution:        Optional[list[JobDistributionItem]] = None
    job_category_distribution: Optional[list[JobCategoryDistributionItem]] = None
