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


def _resolve_model_path() -> str:
    configured = os.getenv("MODEL_PATH")
    if configured:
        return configured

    project_model = Path(__file__).resolve().parents[1] / "model" / "plos-model.joblib"
    if project_model.exists():
        return str(project_model)

    bundled_model = Path(__file__).resolve().parent / "model" / "plos-model.joblib"
    return str(bundled_model)


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
    model_path = _resolve_model_path()
    try:
        app.state.predictor = DyslexiaPredictor(model_path)
        logger.info("FastAPI ready")
    except Exception as exc:
        logger.exception("Unable to initialize predictor: %s", exc)
        app.state.predictor = None

    yield


app = FastAPI(
    title="Dyslexia Prediction API",
    version="1.0.0",
    description="Prediction service for the PLOS dyslexia model",
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
        "version": "1.0.0",
        "health": "/api/v1/health",
        "docs": "/docs",
    }
