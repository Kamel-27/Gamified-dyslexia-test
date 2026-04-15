import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Set a sane default for serverless deployments while allowing override via env var.
os.environ.setdefault(
    "MODEL_CONFIG_PATH", str(PROJECT_ROOT / "model" / "question_config.json")
)
os.environ.setdefault("MODEL_DIR", str(PROJECT_ROOT / "model"))

from app.main import app
