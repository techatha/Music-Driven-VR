from spleeter.separator import Separator
import os
import tempfile

temp_path = "../dataset/test_shazam_chandelier.mp3"
if os.path.exists(temp_path):
    print("Starting Spleeter test...")
    separator = Separator('spleeter:2stems')
    out_dir = os.path.join(tempfile.gettempdir(), "test_spleeter")
    separator.separate_to_file(temp_path, out_dir)
    print("Done! Check", out_dir)
else:
    print("File not found")
