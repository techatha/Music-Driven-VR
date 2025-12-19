import os
import sys
import tensorflow as tf

# --- PATCHING START ---
# Must patch BEFORE importing tensorflow_estimator because it reads these at import time.

# 1. Patch ESTIMATOR_API_NAME
try:
    from tensorflow.python.util import tf_export
    if not hasattr(tf_export, "ESTIMATOR_API_NAME"):
        print("Patching ESTIMATOR_API_NAME...")
        tf_export.ESTIMATOR_API_NAME = "estimator"

    # 2. Patch API_ATTRS for 'estimator'
    # Ensure 'estimator' is a valid key in the API registries if they exist
    if hasattr(tf_export, "API_ATTRS") and "estimator" not in tf_export.API_ATTRS:
        print("Patching API_ATTRS['estimator']...")
        class MockAttr:
            names = []
        tf_export.API_ATTRS["estimator"] = MockAttr()

    if hasattr(tf_export, "API_ATTRS_V1") and "estimator" not in tf_export.API_ATTRS_V1:
        print("Patching API_ATTRS_V1['estimator']...")
        class MockAttr:
            names = []
        tf_export.API_ATTRS_V1["estimator"] = MockAttr()
        
except ImportError as e:
    print(f"Patching warning: {e}")

# --- PATCHING END ---

import tensorflow_estimator

# Inject estimator back into tensorflow module if missing
sys.modules["tensorflow.estimator"] = tensorflow_estimator
if not hasattr(tf, "estimator"):
    tf.estimator = tensorflow_estimator

# Now run spleeter
from spleeter.__main__ import entrypoint

if __name__ == "__main__":
    sys.exit(entrypoint())
