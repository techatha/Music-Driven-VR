import pandas as pd
import numpy as np
import re
from langdetect import detect, LangDetectException

try:
    print("--- Verifying Cleaning Logic (Final Suite) ---")
    df = pd.read_csv("output/songs_with_lyrics.csv")
    total_raw = len(df)
    print(f"Total songs loaded: {total_raw}")
    
    # 1. Simulate Duplicate Removal
    df_no_dupes = df.drop_duplicates(subset=['url'], keep=False)
    duplicates_removed = total_raw - len(df_no_dupes)
    print(f"Duplicate URLs removed (keep=False): {duplicates_removed}")
    
    # Use the non-duplicate set for further checks
    df = df_no_dupes.copy()
    
    # 2. Metric Recalculation (local simulation)
    # Annotated URLs
    df['is_annotated'] = df['url'].astype(str).str.endswith("annotated")
    
    # Line Count
    df['line_count'] = df['lyrics'].apply(lambda x: len(str(x).split('\n')) if pd.notna(x) else 0)
    
    # Char Count
    df['char_count'] = df['lyrics'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)
    
    # Symbols
    df['symbol_count'] = df['lyrics'].apply(lambda x: str(x).count('-') + str(x).count('>') + str(x).count(':') if pd.notna(x) else 0)
    
    # Tracklists
    def is_tracklist(text):
        if pd.isna(text): return False
        matches = re.findall(r'^\d+\.', str(text), re.MULTILINE)
        return len(matches) > 3
    df['is_tracklist'] = df['lyrics'].apply(is_tracklist)
    
    # Thresholds
    MIN_LINES, MAX_LINES = 10, 150
    MAX_CHARS = 5000
    MAX_SYMBOLS = 10
    
    # Apply filters locally
    cond_lines = (df['line_count'] >= MIN_LINES) & (df['line_count'] <= MAX_LINES)
    cond_chars = (df['char_count'] <= MAX_CHARS)
    cond_symbols = (df['symbol_count'] <= MAX_SYMBOLS)
    cond_tr = (~df['is_tracklist'])
    cond_ann = (~df['is_annotated'])
    
    clean_candidate = df[cond_lines & cond_chars & cond_symbols & cond_tr & cond_ann]
    
    print(f"\n--- Filter Analysis (after removing duplicates) ---")
    print(f"Tracklists detected: {(~cond_tr).sum()}")
    print(f"Annotated URLs left: {(~cond_ann).sum()}")
    print(f"Predicted Clean Count (excluding language check): {len(clean_candidate)}")
    
    # Check actual output file if exists
    try:
        df_out = pd.read_csv("output/songs_with_lyrics_cleaned.csv")
        print(f"\nACTUAL Output File Rows: {len(df_out)}")
        print("Note: Actual file also filters by language='en'")
    except:
        print("\nOutput file not found yet.")

except Exception as e:
    print(f"❌ Error: {e}")
