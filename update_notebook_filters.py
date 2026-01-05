import json
import nbformat as nbf

nb_path = 'clean_csv.ipynb'
with open(nb_path, 'r') as f:
    nb = nbf.read(f, as_version=4)

# Update Filter Cell (Cell 4 usually) to remove symbol filter
filter_code = """
# Define thresholds
MIN_LINES = 10
MAX_LINES = 150
MAX_CHARS = 5000
MAX_SYMBOLS = 10

# 1. Remove Duplicate URLs first (Aggressive removal: keep=False removes ALL duplicates)
print(f"Total before duplicate removal: {len(df)}")
df = df.drop_duplicates(subset=['url'], keep=False)
print(f"Total after duplicate removal: {len(df)}")

# 2. Apply Filters
cond_lines = (df['line_count'] >= MIN_LINES) & (df['line_count'] <= MAX_LINES)
cond_chars = (df['char_count'] <= MAX_CHARS)
# cond_symbols = (df['symbol_count'] <= MAX_SYMBOLS) # Disabled per request
cond_not_tracklist = (~df['is_tracklist']) # Restored (Numeric lists like "1. Song")
cond_not_annotated = (~df['is_annotated'])
cond_english = (df['language'] == 'en')

# Combine filters (Removed cond_symbols)
df_cleaned = df[cond_lines & cond_chars & cond_not_tracklist & cond_not_annotated & cond_english]

print(f"Songs before cleaning: {len(df)}")
print(f"Songs after cleaning: {len(df_cleaned)}")
print(f"Removed {len(df) - len(df_cleaned)} songs (filters)")

# Show removed samples
removed = df[~(cond_lines & cond_chars & cond_not_tracklist & cond_not_annotated & cond_english)]
if not removed.empty:
    print("\\nSample of REMOVED entries (showing reason):")
    cols = ['title', 'char_count', 'is_tracklist', 'language']
    print(removed[cols].head(10))
"""

# Find and update filter cell
for i, cell in enumerate(nb.cells):
    if cell.cell_type == 'code' and "df_cleaned =" in cell.source and "cond_lines" in cell.source:
        cell.source = filter_code
        break

with open(nb_path, 'w') as f:
    nbf.write(nb, f)

print("Notebook updated: Symbol filter disabled, Tracklist (Numeric) filter kept.")
