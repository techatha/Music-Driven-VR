import json
import nbformat as nbf

nb_path = 'clean_csv.ipynb'
nb = nbf.v4.new_notebook()

# Cell 1: Install Dependencies
nb.cells.append(nbf.v4.new_code_cell("""
# Install langdetect for language filtering
!pip install langdetect
"""))

# Cell 2: Imports and Load Data
nb.cells.append(nbf.v4.new_code_cell("""
import pandas as pd
import matplotlib.pyplot as plt
import re
from langdetect import detect, LangDetectException

# Load the dataset
df = pd.read_csv("output/songs_with_lyrics.csv")
print(f"Total songs loaded: {len(df)}")
"""))

# Cell 3: Calculate Metrics (Lines, Chats, Symbols, Tracklists, Language)
nb.cells.append(nbf.v4.new_code_cell("""
# 1. Count Lines
def count_lines(text):
    if pd.isna(text):
        return 0
    return len(str(text).split('\\n'))

df['line_count'] = df['lyrics'].apply(count_lines)

# 2. Count Characters
df['char_count'] = df['lyrics'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)

# 3. Detect Tracklists
def is_tracklist(text):
    if pd.isna(text):
        return False
    matches = re.findall(r'^\\d+\\.', str(text), re.MULTILINE)
    return len(matches) > 3

df['is_tracklist'] = df['lyrics'].apply(is_tracklist)

# 4. Count Symbols (-, >, :)
def count_symbols(text):
    if pd.isna(text):
        return 0
    # Count specific symbols
    return str(text).count('-') + str(text).count('>') + str(text).count(':')

df['symbol_count'] = df['lyrics'].apply(count_symbols)

# 5. Detect Language
def detect_language(text):
    if pd.isna(text) or len(str(text).strip()) < 10:
        return 'unknown'
    try:
        # Detect language (returns 'en', 'es', etc.)
        return detect(str(text))
    except LangDetectException:
        return 'error'

print("Detecting languages... (this might take a moment)")
df['language'] = df['lyrics'].apply(detect_language)

# Show statistics
print("\\nStatistics:")
print(df[['line_count', 'char_count', 'symbol_count']].describe())
print(f"\\nTracklists detected: {df['is_tracklist'].sum()}")
print(f"Non-English songs detected: {len(df[df['language'] != 'en'])}")
"""))

# Cell 4: Visualize
nb.cells.append(nbf.v4.new_code_cell("""
fig, ax = plt.subplots(1, 3, figsize=(18, 5))

# Line Counts
ax[0].hist(df['line_count'], bins=50, color='skyblue', edgecolor='black')
ax[0].set_title('Lines Distribution')

# Symbol Counts
ax[1].hist(df['symbol_count'], bins=50, color='gold', edgecolor='black')
ax[1].set_title('Symbol Counts (-, >, :)')

# Language
lang_counts = df['language'].value_counts()
ax[2].bar(lang_counts.index, lang_counts.values, color='lightgreen', edgecolor='black')
ax[2].set_title('Language Distribution')

plt.show()
"""))

# Cell 5: Filter Data
nb.cells.append(nbf.v4.new_code_cell("""
# Define thresholds
MIN_LINES = 10
MAX_LINES = 150
MAX_CHARS = 5000
MAX_SYMBOLS = 10  # Threshold for symbols like -, >, :

# Filter conditions
cond_lines = (df['line_count'] >= MIN_LINES) & (df['line_count'] <= MAX_LINES)
cond_chars = (df['char_count'] <= MAX_CHARS)
cond_symbols = (df['symbol_count'] <= MAX_SYMBOLS)
cond_not_tracklist = (~df['is_tracklist'])
cond_english = (df['language'] == 'en')

df_cleaned = df[cond_lines & cond_chars & cond_symbols & cond_not_tracklist & cond_english]

print(f"Songs before cleaning: {len(df)}")
print(f"Songs after cleaning: {len(df_cleaned)}")
print(f"Removed {len(df) - len(df_cleaned)} songs")

# Show removed samples
removed = df[~(cond_lines & cond_chars & cond_symbols & cond_not_tracklist & cond_english)]
if not removed.empty:
    print("\\nSample of REMOVED entries:")
    print(removed[['title', 'artist', 'symbol_count', 'language']].head(10))
"""))

# Cell 6: Save
nb.cells.append(nbf.v4.new_code_cell("""
df_cleaned.to_csv("output/songs_with_lyrics_cleaned.csv", index=False)
print("Saved cleaned data to output/songs_with_lyrics_cleaned.csv")
"""))

with open(nb_path, 'w') as f:
    nbf.write(nb, f)

print("Notebook populated successfully.")
