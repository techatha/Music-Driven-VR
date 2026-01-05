import json
import nbformat as nbf

nb_path = 'clean_csv.ipynb'
with open(nb_path, 'r') as f:
    nb = nbf.read(f, as_version=4)

# 1. Update Metrics Cell (Cell 3 usually) to include is_tracklist restoration
# We need to find the cell where metrics are calculated and ensure 'is_tracklist' uses the user's preferred logic or our robust one.
# Based on previous interactions, we'll replace the metrics cell entirely to be safe and include everything.

metrics_code = """
# 1. Count Lines
def count_lines(text):
    if pd.isna(text): return 0
    return len(str(text).split('\\n'))

df['line_count'] = df['lyrics'].apply(count_lines)

# 2. Count Characters
df['char_count'] = df['lyrics'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)

# 3. Detect Tracklists
def is_tracklist(text):
    if pd.isna(text): return False
    matches = re.findall(r'^\\d+\\.', str(text), re.MULTILINE)
    return len(matches) > 3

df['is_tracklist'] = df['lyrics'].apply(is_tracklist)

# 4. Count Symbols
def count_symbols(text):
    if pd.isna(text): return 0
    return str(text).count('-') + str(text).count('>') + str(text).count(':')

df['symbol_count'] = df['lyrics'].apply(count_symbols)

# 5. Detect Annotated URLs
def is_annotated(url):
    return str(url).endswith('annotated')

df['is_annotated'] = df['url'].apply(is_annotated)

# 6. Detect Language
def detect_language(text):
    if pd.isna(text) or len(str(text).strip()) < 10: return 'unknown'
    try: return detect(str(text))
    except LangDetectException: return 'error'

print("Detecting languages...")
df['language'] = df['lyrics'].apply(detect_language)

# Show statistics
print("\\nStatistics:")
print(df[['line_count', 'char_count', 'symbol_count']].describe())
print(f"\\nTracklists detected: {df['is_tracklist'].sum()}")
print(f"Annotated URLs detected: {df['is_annotated'].sum()}")
print(f"Non-English songs detected: {len(df[df['language'] != 'en'])}")
"""

# Find and update metrics cell
for i, cell in enumerate(nb.cells):
    if cell.cell_type == 'code' and "def count_lines" in cell.source:
        cell.source = metrics_code
        break

# 2. Update Filter Cell (Cell 4 usually) to include Duplicate URL removal
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
cond_symbols = (df['symbol_count'] <= MAX_SYMBOLS)
cond_not_tracklist = (~df['is_tracklist']) # Restored
cond_not_annotated = (~df['is_annotated'])
cond_english = (df['language'] == 'en')

# Combine ALL filters
df_cleaned = df[cond_lines & cond_chars & cond_symbols & cond_not_tracklist & cond_not_annotated & cond_english]

print(f"Songs before cleaning: {len(df)}")
print(f"Songs after cleaning: {len(df_cleaned)}")
print(f"Removed {len(df) - len(df_cleaned)} songs (filters)")

# Show removed samples
removed = df[~(cond_lines & cond_chars & cond_symbols & cond_not_tracklist & cond_not_annotated & cond_english)]
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

print("Notebook updated: Tracklist logic restored and Duplicate removal added.")
