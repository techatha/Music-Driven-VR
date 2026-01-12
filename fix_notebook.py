
import nbformat

nb_path = "process_csv.ipynb"
nb = nbformat.read(nb_path, as_version=4)

# The code to inject
injection_code = [
    "from sentence_transformers import SentenceTransformer\n",
    "\n",
    "# 0. ENSURE EMBEDDINGS EXIST\n",
    "if 'embeddings' not in globals():\n",
    "    print(\"⏳ Generating Embeddings (this happens once)...\")\n",
    "    model = SentenceTransformer('all-MiniLM-L6-v2')\n",
    "    embeddings = model.encode(corpus)\n",
    "\n"
]

# Find the Optuna cell
found = False
for cell in nb.cells:
    if cell.cell_type == "code" and "def objective(trial):" in "".join(cell.source):
        # Insert code after imports (assuming imports are at top)
        # We can just prepend to source, but let's be nice and put it after imports if possible.
        # Actually, let's just prepend imports + logic to the very top.
        # The existing cell starts with "import optuna..."
        
        # Check if we already added it (idempotency)
        source_str = "".join(cell.source)
        if "ENSURE EMBEDDINGS EXIST" in source_str:
            print("Notebook already patched.")
            found = True
            break
            
        # Prepend
        # We need optuna import first? No, we can import what we need.
        # The cell starts with "import optuna\nfrom sklearn..." using direct source list modification
        
        # Let's splice it in after the existing imports
        current_source = cell.source
        # Find where header ends (simple heuristic: empty line after imports)
        insert_idx = 0
        for i, line in enumerate(current_source):
            if line.strip() == "":
                insert_idx = i + 1
                break
        
        # If no clear break, just insert at top? No, imports first is better style.
        # Actually, let's just insert at index 2 (after sklearn import line)
        if len(current_source) > 2:
            insert_idx = 2
        
        # Actually, inserting at the very top is safest to ensure variable exists before use.
        # But we want imports.
        # Let's insert after "from sklearn.metrics import silhouette_score\n"
        
        if isinstance(current_source, str):
            # It's a single string, split lines? No, just find index.
            # Convert injection to string
            injection_str = "".join(injection_code)
            
            if "silhouette_score" in current_source:
                parts = current_source.split("silhouette_score\n")
                if len(parts) > 1:
                    cell.source = parts[0] + "silhouette_score\n" + injection_str + parts[1]
                else: 
                     # Maybe no newline?
                     cell.source = injection_str + current_source
            else:
                cell.source = injection_str + current_source
        else:
             # It acts like a list
             new_source = []
             inserted = False
             for line in current_source:
                 new_source.append(line)
                 if "silhouette_score" in line and not inserted:
                     new_source.extend(injection_code)
                     inserted = True
             if not inserted:
                 new_source = injection_code + current_source
             cell.source = new_source
        found = True
        print("Patched Optuna cell.")
        break

if found:
    nbformat.write(nb, nb_path)
    print("Saved process_csv.ipynb")
else:
    print("Could not find Optuna cell to patch.")
