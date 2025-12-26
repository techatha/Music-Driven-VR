import json
import sys

try:
    with open('static/assets/3Dmodels/river_boat/scene_fixed.gltf', 'r') as f:
        data = json.load(f)
        print("Extensions Used:", data.get('extensionsUsed', []))
        print("Extensions Required:", data.get('extensionsRequired', []))
except Exception as e:
    print(f"Error: {e}")
