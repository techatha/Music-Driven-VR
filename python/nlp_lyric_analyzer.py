import os
import time
import pickle
from sentence_transformers import SentenceTransformer

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

BUNDLE_PATH = os.path.join(CURRENT_DIR, '..', 'output', 'pickle', 'clustering_bundle_12feb.pkl')
PRESET_PATH = os.path.join(CURRENT_DIR, '..', 'output', 'pickle', 'preset_labels_12feb.pkl')

# load model
with open(BUNDLE_PATH, 'rb') as f:
    bundle = pickle.load(f)
    kmeans = bundle["kmeans_model"]
    reducer = bundle["umap_reducer"]
    sbert_model = SentenceTransformer(bundle["sbert_model_name"])

with open(PRESET_PATH, 'rb') as f:
    preset_map = pickle.load(f)


def nlp_find_main_preset(lyrics):
    """The heavy nlp lifting happens here."""

    vectorized = sbert_model.encode(lyrics)

    time.sleep(10)  # Simulating long process

    analysis_result = {
        "bpm": 120,
        "segments": ["intro", "chorus", "outro"],
        "clusters": [1, 0, 2]  # Example lyric clusters
    }

    return analysis_result

