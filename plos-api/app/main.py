import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.predictor import DyslexiaPredictor
from app.routers.health import router as health_router
from app.routers.predict import router as predict_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _resolve_model_config() -> tuple[str, str]:
    configured_config = os.getenv("MODEL_CONFIG_PATH")
    configured_model_dir = os.getenv("MODEL_DIR")

    if configured_config:
        config_path = Path(configured_config).expanduser().resolve()
    else:
        project_config = (
            Path(__file__).resolve().parents[1] / "model" / "question_config.json"
        )
        if project_config.exists():
            config_path = project_config
        else:
            config_path = (
                Path(__file__).resolve().parent / "model" / "question_config.json"
            )

    if configured_model_dir:
        model_dir = Path(configured_model_dir).expanduser().resolve()
    else:
        model_dir = config_path.parent

    return str(config_path), str(model_dir)


def _resolve_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    if configured.strip():
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    return [
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    config_path, model_dir = _resolve_model_config()
    try:
        app.state.predictor = DyslexiaPredictor(config_path=config_path, model_dir=model_dir)
        logger.info("FastAPI ready")
    except Exception as exc:
        logger.exception("Unable to initialize predictor: %s", exc)
        app.state.predictor = None

    yield


app = FastAPI(
    title="Dyslexia Prediction API",
    version="2.0.0",
    description=(
        "Age-grouped dyslexia screening prediction service using grouped "
        "Lexora models (G1 7-8, G2 9-11, G3 12-17)."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_resolve_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)


@app.get("/")
async def root():
    return {
        "service": "dyslexia-predictor",
        "version": "2.0.0",
        "health": "/api/v1/health",
        "docs": "/docs",
    }
