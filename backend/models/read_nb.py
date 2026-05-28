import json, sys

sys.stdout.reconfigure(encoding="utf-8")

with open("backend/models/modelling.ipynb", encoding="utf-8") as f:
    nb = json.load(f)

for i, cell in enumerate(nb["cells"]):
    src = "".join(cell["source"])
    cell_type = cell["cell_type"]
    print(f"=== Cell {i} [{cell_type}] ===")
    print(src[:3000])
    print()
