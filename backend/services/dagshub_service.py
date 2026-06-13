"""
dagshub_service.py — DagsHub & MLflow Experiment Tracking Service
==================================================================
Modul ini menangani logging model ML dan eksperimen ke DagsHub via MLflow.
Mendukung tracking untuk model XGBoost, Random Forest, dan Logistic Regression
yang digunakan dalam pipeline Job Matching.

Cara penggunaan:
    from backend.services.dagshub_service import DagsHubService
    tracker = DagsHubService()
    tracker.log_model_run(model, params, metrics, model_name="xgboost")
"""

import logging
import os
from pathlib import Path
from typing import Any

import dagshub
import mlflow
import mlflow.sklearn

logger = logging.getLogger(__name__)

# ── Konstanta ─────────────────────────────────────────────────────────────────

_ROOT_DIR = Path(__file__).resolve().parent.parent

# Nama model yang didukung
SUPPORTED_MODELS = ["xgboost", "random_forest", "logistic_regression"]

# Default artifact tags untuk setiap model
MODEL_TAGS = {
    "xgboost": {
        "framework": "xgboost",
        "task": "binary_classification",
        "domain": "job_matching",
    },
    "random_forest": {
        "framework": "sklearn",
        "task": "binary_classification",
        "domain": "job_matching",
    },
    "logistic_regression": {
        "framework": "sklearn",
        "task": "binary_classification",
        "domain": "job_matching",
    },
}


class DagsHubService:
    """
    Service untuk logging eksperimen ML ke DagsHub via MLflow.

    Fitur:
        - Inisialisasi koneksi ke DagsHub repository
        - Log parameter, metrik, dan model ke MLflow experiment
        - Log model artifacts (.pkl) ke DagsHub
        - Support untuk XGBoost, Random Forest, dan Logistic Regression

    Konfigurasi environment (.env):
        DAGSHUB_USERNAME  : Username DagsHub (atau MLFLOW_TRACKING_USERNAME)
        DAGSHUB_TOKEN     : Token DagsHub (atau MLFLOW_TRACKING_PASSWORD)
        DAGSHUB_REPO_OWNER: Pemilik repository DagsHub
        DAGSHUB_REPO_NAME : Nama repository DagsHub
    """

    def __init__(
        self,
        repo_owner: str | None = None,
        repo_name: str | None = None,
        experiment_name: str = "JobSeekerAI - Job Matching",
    ) -> None:
        self.repo_owner = repo_owner or os.getenv("DAGSHUB_REPO_OWNER", "")
        self.repo_name = repo_name or os.getenv("DAGSHUB_REPO_NAME", "")
        self.experiment_name = experiment_name
        self._initialized = False

    # ──────────────────────────────────────────────────────────────────────────
    # 1. INISIALISASI KONEKSI
    # ──────────────────────────────────────────────────────────────────────────

    def initialize(self) -> bool:

        if self._initialized:
            return True

        try:
            if not self.repo_owner or not self.repo_name:
                logger.warning(
                    "DAGSHUB_REPO_OWNER atau DAGSHUB_REPO_NAME tidak diset. "
                    "Tracking ke DagsHub dinonaktifkan."
                )
                return False

            # Inisialisasi DagsHub — otomatis set MLflow tracking URI
            dagshub.init(
                repo_owner=self.repo_owner,
                repo_name=self.repo_name,
                mlflow=True,
            )

            # Set atau buat experiment
            mlflow.set_experiment(self.experiment_name)

            self._initialized = True
            logger.info(
                f"✅ DagsHub terhubung: {self.repo_owner}/{self.repo_name} "
                f"| Experiment: '{self.experiment_name}'"
            )
            return True

        except Exception as e:
            logger.error(f"❌ Gagal menginisialisasi DagsHub: {e}")
            return False

    # ──────────────────────────────────────────────────────────────────────────
    # 2. LOGGING EKSPERIMEN
    # ──────────────────────────────────────────────────────────────────────────

    def log_model_run(
        self,
        model: Any,
        params: dict,
        metrics: dict,
        model_name: str = "model",
        run_name: str | None = None,
        tags: dict | None = None,
        log_artifact_path: str | None = None,
    ) -> str | None:
        if not self._initialized:
            if not self.initialize():
                logger.warning("DagsHub tidak aktif. Logging dilewati.")
                return None

        # Gabungkan default tags dengan custom tags
        all_tags = {**MODEL_TAGS.get(model_name, {}), **(tags or {})}

        _run_name = run_name or f"{model_name}_run"

        try:
            with mlflow.start_run(run_name=_run_name, tags=all_tags) as run:
                run_id = run.info.run_id

                # Log hyperparameter
                mlflow.log_params(params)
                logger.info(f"📊 Params logged: {params}")

                # Log metrik evaluasi
                mlflow.log_metrics(metrics)
                logger.info(f"📈 Metrics logged: {metrics}")

                # Log model sklearn/xgboost jika model diberikan
                if model is not None:
                    mlflow.sklearn.log_model(
                        sk_model=model,
                        artifact_path=model_name,
                        registered_model_name=f"jobseekerai-{model_name}",
                    )

                # Log file .pkl sebagai artifact tambahan (opsional)
                if log_artifact_path:
                    artifact_path = Path(log_artifact_path)
                    if artifact_path.exists():
                        mlflow.log_artifact(str(artifact_path))
                        logger.info(f"📦 Artifact logged: {artifact_path.name}")
                    else:
                        logger.warning(f"File artifact tidak ditemukan: {log_artifact_path}")

                logger.info(
                    f"✅ Run '{_run_name}' selesai. Run ID: {run_id} | "
                    f"Experiment: '{self.experiment_name}'"
                )
                return run_id

        except Exception as e:
            logger.error(f"❌ Gagal logging run ke MLflow/DagsHub: {e}")
            return None

    def log_all_models(
        self,
        models: dict[str, Any],
        params_map: dict[str, dict],
        metrics_map: dict[str, dict],
    ) -> dict[str, str | None]:
        results: dict[str, str | None] = {}

        for model_name, model in models.items():
            params = params_map.get(model_name, {})
            metrics = metrics_map.get(model_name, {})
            run_id = self.log_model_run(
                model=model,
                params=params,
                metrics=metrics,
                model_name=model_name,
            )
            results[model_name] = run_id

        return results

    # ──────────────────────────────────────────────────────────────────────────
    # 3. LOG ARTEFAK TAMBAHAN
    # ──────────────────────────────────────────────────────────────────────────

    def log_dataset_info(
        self,
        n_samples: int,
        n_features: int,
        n_positive: int,
        n_negative: int,
        run_id: str | None = None,
    ) -> None:
        if not self._initialized:
            logger.warning("DagsHub tidak aktif. Dataset info dilewati.")
            return

        dataset_params = {
            "dataset.n_samples": n_samples,
            "dataset.n_features": n_features,
            "dataset.n_positive": n_positive,
            "dataset.n_negative": n_negative,
            "dataset.class_ratio": round(n_positive / max(n_samples, 1), 4),
        }

        try:
            if run_id:
                client = mlflow.tracking.MlflowClient()
                for key, val in dataset_params.items():
                    client.log_param(run_id, key, val)
            else:
                mlflow.log_params(dataset_params)

            logger.info(f"📋 Dataset info logged: {dataset_params}")

        except Exception as e:
            logger.error(f"❌ Gagal logging dataset info: {e}")

    # ──────────────────────────────────────────────────────────────────────────
    # 4. UTILITAS
    # ──────────────────────────────────────────────────────────────────────────

    def get_best_run(self, metric: str = "roc_auc", ascending: bool = False) -> dict | None:
        if not self._initialized:
            logger.warning("DagsHub tidak aktif.")
            return None

        try:
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if not experiment:
                logger.warning(f"Experiment '{self.experiment_name}' tidak ditemukan.")
                return None

            order = "ASC" if ascending else "DESC"
            runs = mlflow.search_runs(
                experiment_ids=[experiment.experiment_id],
                order_by=[f"metrics.{metric} {order}"],
                max_results=1,
            )

            if runs.empty:
                logger.warning("Tidak ada run ditemukan.")
                return None

            best = runs.iloc[0].to_dict()
            logger.info(f"🏆 Best run: {best.get('run_id')} | {metric}={best.get(f'metrics.{metric}')}")
            return best

        except Exception as e:
            logger.error(f"❌ Gagal mengambil best run: {e}")
            return None

dagshub_service = DagsHubService()
