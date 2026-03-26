import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Set a sane default for serverless deployments while allowing override via env var.
os.environ.setdefault("MODEL_PATH", str(PROJECT_ROOT / "model" / "plos-model.joblib"))

from app.main import app
