import json

nb_path = 'collect_lyrics.ipynb'

with open(nb_path, 'r') as f:
    nb = json.load(f)

new_source = [
    "# Load dataset\n",
    "df = pd.read_csv(\"dataset/billboard200.csv\")\n",
    "\n",
    "# Convert Date to datetime\n",
    "df['Date'] = pd.to_datetime(df['Date'])\n",
    "\n",
    "# Filter for year 2025\n",
    "df_2025 = df[df['Date'].dt.year == 2025]\n",
    "\n",
    "# Get unique songs (Song, Artist)\n",
    "songs_to_collect = df_2025[['Song', 'Artist']].drop_duplicates().values.tolist()\n",
    "\n",
    "print(f\"Found {len(songs_to_collect)} songs from 2025\")\n"
]

found = False
for cell in nb['cells']:
    # Check by ID first
    if cell.get('id') == "3500a0fa8219a12f":
        cell['source'] = new_source
        found = True
        break
    # Check by content if ID match fails
    if cell['cell_type'] == 'code' and any('songs_to_collect = [' in line for line in cell['source']):
        cell['source'] = new_source
        found = True
        break

if found:
    with open(nb_path, 'w') as f:
        json.dump(nb, f, indent=1)
    print("Notebook updated successfully.")
else:
    print("Target cell not found.")
