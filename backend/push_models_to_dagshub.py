import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup basic logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Import the service
from services.dagshub_service import dagshub_service

def main():
    print("🚀 Memulai proses push model .pkl ke DagsHub...")
    
    # Inisialisasi service (akan membaca dari .env secara otomatis)
    if not dagshub_service.initialize():
        print("❌ Gagal menginisialisasi DagsHub. Pastikan .env sudah benar.")
        return

    # Tentukan path ke folder models
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    
    # Daftar model yang akan dipush
    models_to_push = [
        {"name": "xgboost", "filename": "xgboost.pkl"},
        {"name": "random_forest", "filename": "random_forest.pkl"},
        {"name": "logistic_regression", "filename": "logistic_regression.pkl"}
    ]
    
    for model_info in models_to_push:
        model_name = model_info["name"]
        pkl_path = models_dir / model_info["filename"]
        
        if not pkl_path.exists():
            print(f"⚠️ File tidak ditemukan: {pkl_path}. Melewati...")
            continue
            
        print(f"\n📦 Memproses model: {model_name}")
        print(f"File path: {pkl_path}")
        

        run_id = dagshub_service.log_model_run(
            model=None,
            params={},  # Kosong karena model sudah dilatih
            metrics={}, # Kosong karena metrik tidak dihitung ulang
            model_name=model_name,
            run_name=f"Upload_PKL_{model_name}",
            log_artifact_path=str(pkl_path)
        )
        
        if run_id:
            print(f"✅ Model {model_name} berhasil di-push dengan Run ID: {run_id}")
        else:
            print(f"❌ Gagal mempush model {model_name}")

    print("\n🎉 Proses selesai! Silakan cek tab 'Experiments' atau 'MLflow' di repository DagsHub kamu.")

if __name__ == "__main__":
    main()
