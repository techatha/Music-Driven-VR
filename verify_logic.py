import pandas as pd

try:
    # Load dataset
    df = pd.read_csv("dataset/billboard200.csv")
    
    # Convert Date to datetime
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Filter for year 2025
    df_2025 = df[df['Date'].dt.year == 2025]
    
    # Get unique songs (Song, Artist)
    songs_to_collect = df_2025[['Song', 'Artist']].drop_duplicates().values.tolist()
    
    print(f"✅ Success! Found {len(songs_to_collect)} songs from 2025.")
    if len(songs_to_collect) > 0:
        print("Sample:", songs_to_collect[:3])
    else:
        print("⚠️ No songs found for 2025. Please check if the CSV contains 2025 data.")
        # Check max date
        print(f"Max date in CSV: {df['Date'].max()}")

except Exception as e:
    print(f"❌ Error: {e}")
