# tests/test_search_province_filter.py
"""
Unit test untuk filter wilayah/province pada endpoint GET /api/v1/search
dan service VectorStore.search().

Cakupan test:
    1. Unit test VectorStore.search() dengan province filter (langsung ke service layer)
    2. Integration test endpoint /api/v1/search via FastAPI TestClient

Jalankan:
    cd project-akhir
    python -m pytest backend/tests/test_search_province_filter.py -v
"""

import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ── Fixtures & Helpers ─────────────────────────────────────────────────────────

def _make_job(title: str, location: str) -> dict:
    """Buat dummy job dict dengan field minimal yang dibutuhkan VectorStore."""
    return {
        "title": title,
        "company_name": "PT Test Corp",
        "location": location,
        "via": "LinkedIn",
        "share_link": "https://example.com",
        "source_link": "https://example.com",
        "description": f"{title} di {location}",
        "job_id": f"id-{title[:5].lower().replace(' ', '-')}",
        "detected_extensions": {
            "salary": "",
            "posted_at": "",
            "schedule_type": "Full-time",
        },
    }


# Dataset dummy: campuran lokasi berbeda provinsi
DUMMY_JOBS = [
    _make_job("Data Analyst",        "Bandung, Kota Bandung, Jawa Barat"),
    _make_job("Software Engineer",   "Jakarta Selatan, Kota Jakarta Selatan, DKI Jakarta"),
    _make_job("Data Scientist",      "Bekasi, Kota Bekasi, Jawa Barat"),
    _make_job("Backend Engineer",    "Surabaya, Kota Surabaya, Jawa Timur"),
    _make_job("Product Manager",     "Denpasar, Kota Denpasar, Bali"),
    _make_job("ML Engineer",         "Bandung, Kota Bandung, Jawa Barat"),
    _make_job("DevOps Engineer",     "Jakarta Utara, Kota Jakarta Utara, DKI Jakarta"),
    _make_job("Frontend Developer",  "Malang, Kota Malang, Jawa Timur"),
    _make_job("UI/UX Designer",      "Yogyakarta, Kota Yogyakarta, DI Yogyakarta"),
    _make_job("Cloud Architect",     "Semarang, Kota Semarang, Jawa Tengah"),
]

# Embedding dummy: vector acak dengan dimensi 384 (SBERT paraphrase-multilingual)
np.random.seed(42)
DUMMY_EMBEDDINGS = np.random.rand(len(DUMMY_JOBS), 384).astype("float32")


@pytest.fixture
def mock_vector_store():
    """
    Fixture VectorStore yang sudah di-patch:
    - _jobs berisi DUMMY_JOBS
    - _embeddings berisi DUMMY_EMBEDDINGS
    - embedder.encode() di-mock agar tidak load model SBERT sungguhan
    """
    from backend.services.vector_store import VectorStore

    vs = VectorStore.__new__(VectorStore)
    vs._jobs = DUMMY_JOBS
    vs._embeddings = DUMMY_EMBEDDINGS

    # Mock embedder.encode() → kembalikan vektor random agar cosine similarity tetap berjalan
    with patch("backend.services.vector_store.embedder") as mock_embedder:
        mock_embedder.encode.return_value = np.random.rand(1, 384).astype("float32")
        vs._mock_embedder = mock_embedder
        yield vs


# ══════════════════════════════════════════════════════════════════════════════
# BAGIAN 1 — Unit Test: VectorStore.search() dengan province filter
# ══════════════════════════════════════════════════════════════════════════════

class TestVectorStoreProvinceFilter:

    def test_no_filter_returns_all_passing_threshold(self, mock_vector_store):
        """Tanpa filter province, semua hasil di atas threshold dikembalikan."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search("engineer", top_k=50, threshold=0.0)
        assert len(results) == len(DUMMY_JOBS), \
            f"Harusnya mengembalikan semua {len(DUMMY_JOBS)} hasil, dapat {len(results)}"

    def test_filter_jawa_barat_only_returns_jawa_barat_jobs(self, mock_vector_store):
        """Filter 'Jawa Barat' hanya mengembalikan lowongan berlokasi di Jawa Barat."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "data analyst", top_k=50, threshold=0.0, province="Jawa Barat"
            )

        assert len(results) > 0, "Harusnya ada hasil untuk Jawa Barat"
        for r in results:
            assert "jawa barat" in r["location"].lower(), \
                f"Job '{r['title']}' di '{r['location']}' tidak seharusnya muncul (bukan Jawa Barat)"

    def test_filter_bali_only_returns_bali_jobs(self, mock_vector_store):
        """Filter 'Bali' hanya mengembalikan lowongan berlokasi di Bali."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "product manager", top_k=50, threshold=0.0, province="Bali"
            )

        assert len(results) > 0, "Harusnya ada hasil untuk Bali"
        for r in results:
            assert "bali" in r["location"].lower(), \
                f"Job '{r['title']}' di '{r['location']}' tidak seharusnya muncul (bukan Bali)"

    def test_filter_nonexistent_province_returns_empty(self, mock_vector_store):
        """Filter provinsi yang tidak ada di data mengembalikan list kosong."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province="Kalimantan Utara"
            )

        assert results == [], \
            f"Filter wilayah yang tidak ada seharusnya mengembalikan [], dapat {results}"

    def test_filter_is_case_insensitive(self, mock_vector_store):
        """Filter wilayah case-insensitive: 'jawa barat' == 'Jawa Barat' == 'JAWA BARAT'."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results_lower = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province="jawa barat"
            )
            results_upper = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province="JAWA BARAT"
            )
            results_title = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province="Jawa Barat"
            )

        assert len(results_lower) == len(results_upper) == len(results_title), \
            "Filter harus case-insensitive"

    def test_empty_province_string_treated_as_no_filter(self, mock_vector_store):
        """Province kosong ('') sama dengan tidak ada filter."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results_no_filter = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province=None
            )
            results_empty_str = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province=""
            )

        assert len(results_no_filter) == len(results_empty_str), \
            "Province '' harus sama dengan province=None"

    def test_filter_respects_top_k_limit(self, mock_vector_store):
        """Hasil yang dikembalikan tidak melebihi top_k meskipun ada banyak cocok."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "engineer", top_k=1, threshold=0.0, province="Jawa Barat"
            )

        assert len(results) <= 1, f"Hasil melebihi top_k=1, dapat {len(results)}"

    def test_filter_result_has_similarity_score(self, mock_vector_store):
        """Setiap hasil yang lolos filter harus memiliki field similarity_score."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "data", top_k=50, threshold=0.0, province="Jawa Barat"
            )

        for r in results:
            assert "similarity_score" in r, "Field similarity_score harus ada di setiap hasil"
            assert 0.0 <= r["similarity_score"] <= 1.0, \
                f"similarity_score harus 0-1, dapat {r['similarity_score']}"

    def test_filter_dki_jakarta_excludes_other_provinces(self, mock_vector_store):
        """Filter DKI Jakarta tidak boleh mengembalikan lowongan dari Jawa Barat, Jawa Timur, dll."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            results = mock_vector_store.search(
                "engineer", top_k=50, threshold=0.0, province="DKI Jakarta"
            )

        non_jakarta = [r for r in results if "dki jakarta" not in r["location"].lower()]
        assert non_jakarta == [], \
            f"Hasil non-Jakarta bocor ke hasil DKI Jakarta: {[r['location'] for r in non_jakarta]}"


# ══════════════════════════════════════════════════════════════════════════════
# BAGIAN 2 — Integration Test: Endpoint GET /api/v1/search
# ══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def test_client(mock_vector_store):
    """
    FastAPI TestClient dengan VectorStore yang sudah di-mock.
    Menggunakan dependency_overrides agar tidak perlu benar-benar load model SBERT & FAISS.
    """
    from backend.main import app
    from backend.api.dependencies import get_vector_store

    app.dependency_overrides[get_vector_store] = lambda: mock_vector_store

    with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
        with TestClient(app) as client:
            yield client

    app.dependency_overrides.clear()


class TestSearchEndpointProvinceFilter:

    def test_search_without_province_returns_results(self, test_client, mock_vector_store):
        """GET /api/v1/search?q=engineer — tanpa province, mengembalikan hasil."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            resp = test_client.get("/api/v1/search", params={"q": "engineer", "limit": 20})

        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["province_filter"] is None
        assert body["total"] == len(body["data"])

    def test_search_with_valid_province_filters_correctly(self, test_client, mock_vector_store):
        """GET /api/v1/search?q=engineer&province=Jawa Barat — hanya hasil Jawa Barat."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            resp = test_client.get(
                "/api/v1/search",
                params={"q": "engineer", "limit": 20, "province": "Jawa Barat"}
            )

        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["province_filter"] == "Jawa Barat"

        for item in body["data"]:
            assert "jawa barat" in item["location"].lower(), \
                f"Location '{item['location']}' tidak termasuk Jawa Barat"

    def test_search_nonexistent_province_returns_empty_data(self, test_client, mock_vector_store):
        """GET /api/v1/search?q=engineer&province=Kalimantan Utara — data kosong, bukan error."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            resp = test_client.get(
                "/api/v1/search",
                params={"q": "engineer", "limit": 20, "province": "Kalimantan Utara"}
            )

        assert resp.status_code == 200, f"Status harus 200, bukan 404 atau 500"
        body = resp.json()
        assert body["success"] is True
        assert body["data"] == [], \
            "Wilayah yang tidak ada datanya harus mengembalikan list kosong, bukan error"
        assert body["total"] == 0

    def test_search_missing_query_returns_422(self, test_client):
        """GET /api/v1/search tanpa ?q= harus mengembalikan 422 Unprocessable Entity."""
        resp = test_client.get("/api/v1/search", params={"province": "Jawa Barat"})
        assert resp.status_code == 422

    def test_search_response_structure(self, test_client, mock_vector_store):
        """Response harus memiliki semua field yang diharapkan sesuai SearchResponse schema."""
        with patch("backend.services.vector_store.embedder", mock_vector_store._mock_embedder):
            resp = test_client.get(
                "/api/v1/search",
                params={"q": "data analyst", "limit": 5, "province": "Jawa Barat"}
            )

        assert resp.status_code == 200
        body = resp.json()
        required_fields = {"success", "total", "query", "threshold", "province_filter", "data"}
        assert required_fields.issubset(body.keys()), \
            f"Field yang hilang: {required_fields - body.keys()}"
