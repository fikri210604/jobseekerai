# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  Step 6: Model Evaluation                                               ║
# ║  Metrik: Precision@K, MAP, NDCG, Confusion Matrix                       ║
# ║  Membandingkan TF-IDF vs SBERT pada 10+ query ground truth              ║
# ╚══════════════════════════════════════════════════════════════════════════╝

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────────────────────
# 6.1  GROUND TRUTH — Anotasi manual untuk 12 query
# ─────────────────────────────────────────────────────────────────────────────
# Format: setiap query punya set judul lowongan yang RELEVAN (ground truth).
# Relevansi ditentukan berdasarkan kecocokan semantik antara query dan judul job.

GROUND_TRUTH = {
    "Data Analyst Python SQL": [
        "Data Analyst Officer",
        "Data Analyst Supervisor",
        "ADMIN DATA ANALYST - MAKASSAR",
        "Data Analyst",
        "Business Analyst",
    ],
    "Software Engineer React TypeScript": [
        "Software Engineer",
        "Frontend Developer",
        "Full Stack Developer",
        "Web Developer",
        "Software Quality Assurance",
    ],
    "Akuntan laporan keuangan": [
        "Finance Associate",
        "Accounting Staff",
        "Finance Staff",
        "Akuntan",
        "Finance and Accounting Staff",
    ],
    "Operator produksi pabrik": [
        "Production Operator",
        "Operator Production",
        "Operator Pabrik",
        "Produksi Operator",
        "Operator Mesin",
    ],
    "Marketing digital media sosial": [
        "Social Media Strategist",
        "Digital Marketing",
        "Marketing Staff",
        "Social Media Specialist",
        "Content Creator",
    ],
    "HRD Rekrutmen Personalia": [
        "HR Recruiter",
        "HRD Staff",
        "Human Resources",
        "Recruitment Staff",
        "HR Generalist",
    ],
    "lowongan teknisi anak sma": [
        "Teknisi Listrik",
        "Electrical Technician",
        "Teknisi",
        "Electrician",
        "Maintenance Technician",
    ],
    "kerja remote admin data entry": [
        "Admin",
        "Data Entry",
        "Administrasi",
        "Admin Data",
        "Staff Admin",
    ],
    "part time barista cafe mahasiswa": [
        "Barista",
        "Waiter",
        "Pramusaji",
        "Crew Store",
        "Server",
    ],
    "fresh graduate management trainee": [
        "Management Trainee",
        "MT",
        "Officer Development Program",
        "ODP",
        "Trainee",
    ],
    "sopir pengiriman barang logistik": [
        "Driver",
        "Pengemudi",
        "Sopir",
        "Kurir",
        "Logistik Driver",
    ],
    "desain grafis bisa pakai canva": [
        "Graphic Designer",
        "Desainer Grafis",
        "UI/UX Designer",
        "Visual Designer",
        "Creative Designer",
    ],
}

TOP_K = 5  # Evaluasi pada top-5 hasil
print(f"✅ Ground truth siap: {len(GROUND_TRUTH)} query, evaluasi pada top-{TOP_K}")


# ─────────────────────────────────────────────────────────────────────────────
# 6.2  FUNGSI METRIK IR
# ─────────────────────────────────────────────────────────────────────────────

def is_relevant(title: str, relevant_titles: list[str]) -> bool:
    """Cek apakah judul hasil pencarian relevan (partial match, case-insensitive)."""
    title_lower = title.lower()
    return any(rel.lower() in title_lower or title_lower in rel.lower()
               for rel in relevant_titles)


def precision_at_k(retrieved: list[str], relevant: list[str], k: int = 5) -> float:
    """
    Precision@K = (jumlah relevan dalam top-K) / K
    """
    top_k = retrieved[:k]
    hits = sum(1 for t in top_k if is_relevant(t, relevant))
    return hits / k if k > 0 else 0.0


def average_precision(retrieved: list[str], relevant: list[str]) -> float:
    """
    Average Precision (AP) untuk satu query.
    AP = rata-rata precision di setiap posisi di mana item relevan ditemukan.
    """
    hits = 0
    score = 0.0
    for i, title in enumerate(retrieved, start=1):
        if is_relevant(title, relevant):
            hits += 1
            score += hits / i
    return score / min(len(relevant), len(retrieved)) if retrieved else 0.0


def dcg_at_k(retrieved: list[str], relevant: list[str], k: int = 5) -> float:
    """
    Discounted Cumulative Gain @K
    DCG = Σ rel_i / log2(i+1)  untuk i=1..K
    """
    dcg = 0.0
    for i, title in enumerate(retrieved[:k], start=1):
        rel = 1.0 if is_relevant(title, relevant) else 0.0
        dcg += rel / np.log2(i + 1)
    return dcg


def ndcg_at_k(retrieved: list[str], relevant: list[str], k: int = 5) -> float:
    """
    Normalized DCG @K = DCG@K / IDCG@K
    IDCG = DCG dalam kondisi ideal (semua item relevan di posisi teratas)
    """
    ideal = relevant[:k]  # Ideal: semua relevan di posisi teratas
    idcg = sum(1.0 / np.log2(i + 1) for i in range(1, min(len(ideal), k) + 1))
    if idcg == 0:
        return 0.0
    return dcg_at_k(retrieved, relevant, k) / idcg


# ─────────────────────────────────────────────────────────────────────────────
# 6.3  JALANKAN EVALUASI — TF-IDF & SBERT
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_model(search_fn, model_name: str, ground_truth: dict, top_k: int = 5):
    """
    Jalankan evaluasi lengkap untuk satu model retrieval.
    
    Returns dict berisi per-query metrics & agregasi MAP, NDCG, Precision@K.
    """
    results = []

    for query, relevant_titles in ground_truth.items():
        try:
            retrieved_items = search_fn(query, top_k=top_k * 2)  # ambil lebih banyak untuk AP
            retrieved_titles = [r["title"] for r in retrieved_items]
        except Exception as e:
            print(f"  ⚠️  Error pada query '{query}': {e}")
            retrieved_titles = []

        p_k   = precision_at_k(retrieved_titles, relevant_titles, k=top_k)
        ap    = average_precision(retrieved_titles, relevant_titles)
        ndcg  = ndcg_at_k(retrieved_titles, relevant_titles, k=top_k)

        # Confusion matrix per-posisi (binary: relevan / tidak)
        binary_actual    = [1 if is_relevant(t, relevant_titles) else 0
                            for t in retrieved_titles[:top_k]]
        binary_predicted = [1] * len(binary_actual)  # model "memprediksi" semua sebagai relevan

        results.append({
            "query":          query,
            "p_at_k":         p_k,
            "ap":             ap,
            "ndcg":           ndcg,
            "retrieved":      retrieved_titles[:top_k],
            "actual_binary":  binary_actual,
        })

    # Agregasi
    map_score  = np.mean([r["ap"]    for r in results])
    ndcg_score = np.mean([r["ndcg"]  for r in results])
    prec_score = np.mean([r["p_at_k"] for r in results])

    print(f"\n{'='*60}")
    print(f"  📊 Hasil Evaluasi: {model_name}")
    print(f"{'='*60}")
    print(f"  MAP (Mean Average Precision) : {map_score:.4f}")
    print(f"  NDCG@{top_k}                 : {ndcg_score:.4f}")
    print(f"  Precision@{top_k}             : {prec_score:.4f}")
    print(f"{'='*60}")

    print(f"\n  📋 Detail per Query:")
    for r in results:
        print(f"  [{r['p_at_k']:.2f} P@K | {r['ap']:.2f} AP | {r['ndcg']:.2f} NDCG] "
              f"'{r['query']}'")

    return {
        "model":        model_name,
        "map":          map_score,
        "ndcg":         ndcg_score,
        "precision_k":  prec_score,
        "per_query":    results,
    }


# ── Evaluasi TF-IDF ──────────────────────────────────────────────────────────
print("🔄 Evaluasi TF-IDF...")
eval_tfidf = evaluate_model(search_tfidf, "TF-IDF (Vector Space Model)", GROUND_TRUTH, TOP_K)

# ── Evaluasi SBERT ───────────────────────────────────────────────────────────
print("\n🔄 Evaluasi SBERT (Semantic Search)...")
eval_sbert = evaluate_model(search_sbert, "SBERT (paraphrase-multilingual)", GROUND_TRUTH, TOP_K)


# ─────────────────────────────────────────────────────────────────────────────
# 6.4  CONFUSION MATRIX — Agregat semua query
# ─────────────────────────────────────────────────────────────────────────────
# Bangun confusion matrix dari binary relevance (top-K per query)

def build_confusion_data(eval_result: dict):
    """Kumpulkan semua binary label dari seluruh query."""
    y_true, y_pred = [], []
    gt_map = {q: rel for q, rel in GROUND_TRUTH.items()}

    for r in eval_result["per_query"]:
        relevant = gt_map[r["query"]]
        for title in r["retrieved"]:
            y_pred.append(1)  # model selalu mengembalikan sebagai "retrieved"
            y_true.append(1 if is_relevant(title, relevant) else 0)
    return np.array(y_true), np.array(y_pred)


fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle(f"Confusion Matrix — Top-{TOP_K} Retrieved Results\n(1=Relevan, 0=Tidak Relevan)",
             fontsize=13, fontweight="bold")

for ax, eval_res in zip(axes, [eval_tfidf, eval_sbert]):
    y_true, y_pred = build_confusion_data(eval_res)
    cm = confusion_matrix(y_true, [1] * len(y_true), labels=[0, 1])

    # Hitung TP, FP, FN, TN secara manual
    TP = int(np.sum((y_true == 1)))
    FP = int(np.sum((y_true == 0)))
    FN = 0  # tidak bisa dihitung tanpa tahu total relevan di corpus
    TN = 0

    cm_display = np.array([[TN, FP], [FN, TP]])

    sns.heatmap(cm_display, annot=True, fmt="d", cmap="Blues",
                xticklabels=["Predicted: Tidak Relevan", "Predicted: Relevan"],
                yticklabels=["Actual: Tidak Relevan", "Actual: Relevan"],
                ax=ax, cbar=False, linewidths=0.5)
    ax.set_title(f"{eval_res['model']}\nTP={TP}, FP={FP}", fontsize=10)
    ax.set_xlabel("Prediksi Model")
    ax.set_ylabel("Ground Truth")

plt.tight_layout()
plt.savefig("../data/retrieval/eval_confusion_matrix.png", dpi=150, bbox_inches="tight")
plt.show()
print("✅ Confusion matrix disimpan.")


# ─────────────────────────────────────────────────────────────────────────────
# 6.5  VISUALISASI PERBANDINGAN — MAP, NDCG, Precision@K
# ─────────────────────────────────────────────────────────────────────────────

metrics       = ["MAP", f"NDCG@{TOP_K}", f"Precision@{TOP_K}"]
tfidf_scores  = [eval_tfidf["map"], eval_tfidf["ndcg"], eval_tfidf["precision_k"]]
sbert_scores  = [eval_sbert["map"], eval_sbert["ndcg"], eval_sbert["precision_k"]]

x = np.arange(len(metrics))
width = 0.35

fig, ax = plt.subplots(figsize=(9, 5))
bars1 = ax.bar(x - width/2, tfidf_scores, width, label="TF-IDF",
               color="#4C72B0", alpha=0.85, edgecolor="white")
bars2 = ax.bar(x + width/2, sbert_scores, width, label="SBERT",
               color="#DD8452", alpha=0.85, edgecolor="white")

for bar in bars1 + bars2:
    h = bar.get_height()
    ax.annotate(f"{h:.3f}", xy=(bar.get_x() + bar.get_width() / 2, h),
                xytext=(0, 4), textcoords="offset points",
                ha="center", va="bottom", fontsize=9, fontweight="bold")

ax.set_ylabel("Score", fontsize=11)
ax.set_title("Perbandingan Metrik Evaluasi: TF-IDF vs SBERT\n"
             f"(Ground Truth: {len(GROUND_TRUTH)} query, Top-{TOP_K})",
             fontsize=12, fontweight="bold")
ax.set_xticks(x)
ax.set_xticklabels(metrics, fontsize=11)
ax.set_ylim(0, 1.1)
ax.legend(fontsize=11)
ax.grid(axis="y", alpha=0.3)
ax.spines[["top", "right"]].set_visible(False)

plt.tight_layout()
plt.savefig("../data/retrieval/eval_metrics_comparison.png", dpi=150, bbox_inches="tight")
plt.show()
print("✅ Grafik perbandingan metrik disimpan.")


# ─────────────────────────────────────────────────────────────────────────────
# 6.6  VISUALISASI PER-QUERY — NDCG & AP
# ─────────────────────────────────────────────────────────────────────────────

queries_short = [q[:30] + "..." if len(q) > 30 else q
                 for q in GROUND_TRUTH.keys()]

tfidf_ap   = [r["ap"]   for r in eval_tfidf["per_query"]]
sbert_ap   = [r["ap"]   for r in eval_sbert["per_query"]]
tfidf_ndcg = [r["ndcg"] for r in eval_tfidf["per_query"]]
sbert_ndcg = [r["ndcg"] for r in eval_sbert["per_query"]]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 9), sharex=True)

idx = np.arange(len(queries_short))

# AP per query
ax1.plot(idx, tfidf_ap, "o--", color="#4C72B0", label="TF-IDF AP", linewidth=1.5, markersize=6)
ax1.plot(idx, sbert_ap, "s-",  color="#DD8452", label="SBERT AP",  linewidth=1.5, markersize=6)
ax1.set_ylabel("Average Precision", fontsize=10)
ax1.set_title("Average Precision per Query", fontsize=11, fontweight="bold")
ax1.set_ylim(0, 1.05)
ax1.legend()
ax1.grid(alpha=0.3)
ax1.spines[["top", "right"]].set_visible(False)

# NDCG per query
ax2.plot(idx, tfidf_ndcg, "o--", color="#4C72B0", label=f"TF-IDF NDCG@{TOP_K}", linewidth=1.5, markersize=6)
ax2.plot(idx, sbert_ndcg, "s-",  color="#DD8452", label=f"SBERT NDCG@{TOP_K}",  linewidth=1.5, markersize=6)
ax2.set_ylabel(f"NDCG@{TOP_K}", fontsize=10)
ax2.set_title(f"NDCG@{TOP_K} per Query", fontsize=11, fontweight="bold")
ax2.set_ylim(0, 1.05)
ax2.legend()
ax2.grid(alpha=0.3)
ax2.spines[["top", "right"]].set_visible(False)

ax2.set_xticks(idx)
ax2.set_xticklabels(queries_short, rotation=35, ha="right", fontsize=8)

plt.tight_layout()
plt.savefig("../data/retrieval/eval_per_query.png", dpi=150, bbox_inches="tight")
plt.show()
print("✅ Grafik per-query disimpan.")


# ─────────────────────────────────────────────────────────────────────────────
# 6.7  RINGKASAN TABEL FINAL
# ─────────────────────────────────────────────────────────────────────────────

import pandas as pd

summary_df = pd.DataFrame([
    {
        "Model":          "TF-IDF (Vector Space)",
        "MAP":            round(eval_tfidf["map"], 4),
        f"NDCG@{TOP_K}":  round(eval_tfidf["ndcg"], 4),
        f"Precision@{TOP_K}": round(eval_tfidf["precision_k"], 4),
    },
    {
        "Model":          "SBERT (Semantic Search)",
        "MAP":            round(eval_sbert["map"], 4),
        f"NDCG@{TOP_K}":  round(eval_sbert["ndcg"], 4),
        f"Precision@{TOP_K}": round(eval_sbert["precision_k"], 4),
    },
])
summary_df = summary_df.set_index("Model")

print("\n" + "="*55)
print("  📊 TABEL RINGKASAN EVALUASI MODEL")
print("="*55)
print(summary_df.to_string())
print("="*55)

winner = "SBERT" if eval_sbert["map"] > eval_tfidf["map"] else "TF-IDF"
print(f"\n  🏆 Model terbaik berdasarkan MAP: {winner}")

# ─────────────────────────────────────────────────────────────────────────────


# ─────────────────────────────────────────────────────────────────────────────
# 6.8  TESTING QUERY SECARA LANGSUNG
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*55)
print("  🔍 TESTING QUERY (MANUAL CHECK)")
print("="*55)

test_queries = [
    'lowongan teknisi anak sma',
    'kerja remote admin data entry',
    'part time barista cafe mahasiswa',
    'fresh graduate management trainee',
    'sopir pengiriman barang logistik',
]

for q in test_queries:
    print(f"\n🔍 Query: '{q}'")
    print("-" * 60)
    
    try:
        tfidf_res = search_tfidf(q, top_k=3)
        print("TF-IDF Results:")
        for i, r in enumerate(tfidf_res, 1):
            print(f"  {i}. [{r.get('similarity_score', 0):.3f}] {r.get('title', '')} @ {r.get('company_name', '')}")
    except Exception as e:
        print(f"TF-IDF error: {e}")
        
    try:
        sbert_res = search_sbert(q, top_k=3) # Assume search_sbert or search is available
        print("\nSBERT Results:")
        for i, r in enumerate(sbert_res, 1):
            print(f"  {i}. [{r.get('similarity_score', 0):.3f}] {r.get('title', '')} @ {r.get('company_name', '')}")
    except Exception as e:
        print(f"\nSBERT error: {e}")
        
    print("=" * 60)
