import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.models import PredictRequest, PredictResponse
from app.predictor import DyslexiaPredictor

router = APIRouter(prefix="/api/v1", tags=["prediction"])


DEFAULT_GROUPS = {
    "G1_7_8": {
        "age_range": [7, 8],
        "questions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 22, 23, 30],
    },
    "G2_9_11": {
        "age_range": [9, 11],
        "questions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30],
    },
    "G3_12_17": {
        "age_range": [12, 17],
        "questions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32],
    },
}


def _resolve_question_config_path() -> Path:
    project_config = Path(__file__).resolve().parents[2] / "model" / "question_config.json"
    if project_config.exists():
        return project_config

    return Path(__file__).resolve().parents[1] / "model" / "question_config.json"


def _load_groups_for_examples() -> dict[str, dict[str, Any]]:
    config_path = _resolve_question_config_path()
    if not config_path.exists():
        return DEFAULT_GROUPS

    try:
        with config_path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        groups = payload.get("groups")
        if isinstance(groups, dict) and groups:
            return groups
    except Exception:
        pass

    return DEFAULT_GROUPS


EXAMPLE_GROUPS = _load_groups_for_examples()


def build_example_payload(group_name: str, profile: str):
    group_cfg = EXAMPLE_GROUPS[group_name]
    age_min, age_max = group_cfg["age_range"]
    questions = [int(question) for question in group_cfg["questions"]]

    age = age_min if profile == "high_risk" else min(age_max, age_min + 1)
    payload: dict[str, float | int | str] = {
        "session_id": f"example-{group_name.lower()}-{profile}",
        "participant_id": 100 + age,
        "Gender": 1 if profile == "high_risk" else 0,
        "Nativelang": 0 if profile == "high_risk" else 1,
        "Otherlang": 1 if profile == "high_risk" else 0,
        "Age": age,
    }

    if profile == "high_risk":
        clicks, hits, misses = 4, 1, 3
    else:
        clicks, hits, misses = 16, 14, 2

    score = hits
    accuracy = hits / clicks
    missrate = misses / clicks

    for question in questions:
        payload[f"Clicks{question}"] = clicks
        payload[f"Hits{question}"] = hits
        payload[f"Misses{question}"] = misses
        payload[f"Score{question}"] = score
        payload[f"Accuracy{question}"] = accuracy
        payload[f"Missrate{question}"] = missrate

    return payload


@router.post(
    "/predict",
    response_model=PredictResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "examples": {
                        "g1_high_risk": {
                            "summary": "G1 (Age 7-8) high-risk profile",
                            "value": build_example_payload("G1_7_8", "high_risk"),
                        },
                        "g2_low_risk": {
                            "summary": "G2 (Age 9-11) low-risk profile",
                            "value": build_example_payload("G2_9_11", "low_risk"),
                        },
                        "g3_high_risk": {
                            "summary": "G3 (Age 12-17) high-risk profile",
                            "value": build_example_payload("G3_12_17", "high_risk"),
                        },
                    }
                }
            }
        }
    },
)
async def predict_dyslexia(request_body: PredictRequest, request: Request):
    predictor: DyslexiaPredictor | None = getattr(request.app.state, "predictor", None)
    if predictor is None or not predictor.is_ready():
        raise HTTPException(
            status_code=503,
            detail=(
                "Model is not loaded. Ensure grouped model files are present "
                "and dependencies (including imbalanced-learn) are installed."
            ),
        )

    payload = request_body.model_dump()
    is_valid, error_message = predictor.validate_payload(payload)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    try:
        result = predictor.predict(payload)
        return PredictResponse(
            session_id=request_body.session_id,
            probability=result.probability,
            threshold=result.threshold,
            prediction=result.prediction,
            confidence=result.confidence,
            age_group=result.age_group,
            model_version=result.model_version,
            timestamp=datetime.now(timezone.utc),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@router.get("/predict/examples")
async def prediction_examples():
    examples: dict[str, dict[str, float | int | str]] = {}
    for group_name in EXAMPLE_GROUPS.keys():
        slug = group_name.lower()
        examples[f"{slug}_high_risk"] = build_example_payload(group_name, "high_risk")
        examples[f"{slug}_low_risk"] = build_example_payload(group_name, "low_risk")

    return examples
