# FastAPI Deployment Plan: Connecting ML Model with Next.js Test App

**Date:** March 25, 2026  
**Status:** Planning Phase  
**Priority:** High

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Test App (Client)                   │
│                     (Port 3000)                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Test Session Flow:                                       │  │
│  │  1. User completes 32 questions                          │  │
│  │  2. Collects: Clicks, Hits, Misses, Score, Accuracy    │  │
│  │  3. On completion → POST /api/v1/predict                │  │
│  │  4. Displays result to user                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                       HTTP POST/GET
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Service (Server)                        │
│                  (Port 8000)                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/v1/predict                                     │  │
│  │   Input: test session metrics (32 questions × 6 measures)│  │
│  │   Validate features → Run RFC model → Return prediction  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ GET /api/v1/health                                       │  │
│  │   Returns: model status, version, feature count          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ GET /api/v1/schema                                       │  │
│  │   Returns: expected input feature names/types            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Model Storage: plos-model.joblib (loaded at startup)          │
│  Thread-safe inference with model caching                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                      File System
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  ML Model Files                                                 │
│  ├── plos-model.joblib (RFC model + metadata)                  │
│  └── requirements.txt (Python dependencies)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Plan

### Phase 1: Setup FastAPI Project Structure

**Directory structure:**

```
plos/
├── plos-api/                    # New FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app initialization
│   │   ├── models.py            # Pydantic request/response schemas
│   │   ├── predictor.py         # ML model loading & inference logic
│   │   └── routers/
│   │       ├── predict.py       # POST /api/v1/predict
│   │       └── health.py        # GET /api/v1/health, GET /api/v1/schema
│   ├── tests/
│   │   ├── test_predict.py      # Unit tests for inference
│   │   └── test_integration.py  # E2E tests with Next.js
│   ├── requirements.txt         # Dependencies
│   ├── .env                     # Environment variables (DB, CORS, etc.)
│   └── run.py                   # Entry point
│
├── plos-model.joblib           # Serialized ML model (from notebook)
└── english-test-app/           # Existing Next.js app
    └── src/app/test/[sessionId]/api/
        └── predict/            # API route that calls FastAPI
```

### Phase 2: Create FastAPI Application

#### 2A. `requirements.txt`

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
scikit-learn==1.3.2
joblib==1.3.2
numpy==1.24.3
pandas==1.5.3
python-dotenv==1.0.0
python-multipart==0.0.6
aiofiles==23.2.1
```

#### 2B. `app/models.py` — Request/Response Schemas

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class PredictRequest(BaseModel):
    """Incoming test session data from Next.js app"""
    session_id: str = Field(..., description="UUID of test session")
    participant_id: Optional[int] = Field(None, description="Participant ID")

    # Demographics (required)
    Gender: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    Nativelang: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    Otherlang: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    Age: int = Field(..., ge=7, le=17, description="Age in years")

    # Performance metrics for Q1-Q32 (each question has 6 measures)
    Clicks1: float
    Hits1: float
    Misses1: float
    Score1: float
    Accuracy1: float
    Missrate1: float

    # ... repeat for Clicks2-Misses32, Score2-Missrate32 ...
    # (Python: can validate dynamically in __init__ or use model_rebuild)

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "participant_id": 123,
                "Gender": 1,
                "Nativelang": 1,
                "Otherlang": 0,
                "Age": 10,
                "Clicks1": 23,
                "Hits1": 22,
                # ... etc
            }
        }


class PredictResponse(BaseModel):
    """Response with prediction result"""
    session_id: str
    probability: float = Field(..., ge=0.0, le=1.0)
    prediction: str = Field(..., description="'Dyslexia Risk' or 'No Risk'")
    confidence: float = Field(..., ge=0.0, le=1.0)
    threshold: float
    model_version: str
    timestamp: datetime


class HealthResponse(BaseModel):
    """Service health status"""
    status: str  # "healthy", "loading", "error"
    model_version: str
    features_count: int
    threshold: float
    message: str


class SchemaResponse(BaseModel):
    """Expected input feature names and types"""
    features: list[str]
    demographic_features: list[str]
    performance_features: list[str]
    questions: list[int]
    measures: list[str]
```

#### 2C. `app/predictor.py` — Model Management

```python
import joblib
import logging
from typing import Tuple, Optional
import numpy as np

logger = logging.getLogger(__name__)

class DyslexyPredictor:
    """Encapsulates ML model loading, validation, and inference"""

    def __init__(self, model_path: str):
        self.model = None
        self.threshold = None
        self.feature_names = None
        self.encoding = None
        self.version = "1.0"

        try:
            self._load_model(model_path)
            logger.info(f"✅ Model loaded successfully. Features: {len(self.feature_names)}")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.model = None

    def _load_model(self, model_path: str):
        """Load serialized RFC model from joblib file"""
        pkg = joblib.load(model_path, compress=True)
        self.model = pkg['model']
        self.threshold = pkg['threshold']
        self.feature_names = pkg['feature_names']
        self.encoding = pkg.get('encoding', {})

    def is_ready(self) -> bool:
        """Check if model loaded successfully"""
        return self.model is not None

    def validate_features(self, data: dict) -> Tuple[bool, str]:
        """
        Validate incoming request has all required features

        Returns:
            (is_valid, error_message)
        """
        missing = [f for f in self.feature_names if f not in data]
        if missing:
            return False, f"Missing features: {missing[:5]}"

        # Check age in range
        if 7 <= data.get('Age', 0) <= 17:
            return False, "Age must be 7-17"

        return True, ""

    def predict(self, features: dict) -> Tuple[float, str]:
        """
        Run inference on single participant

        Returns:
            (probability, prediction_label)
        """
        if not self.is_ready():
            raise RuntimeError("Model not loaded")

        # Convert dict to feature array in correct order
        X = np.array([[features.get(f, 0) for f in self.feature_names]])

        # Get probability for dyslexia class (1)
        prob = self.model.predict_proba(X)[0, 1]

        # Apply threshold
        pred = "Dyslexia Risk" if prob >= self.threshold else "No Risk"

        return prob, pred


# Global predictor instance (initialized at startup)
predictor: Optional[DyslexyPredictor] = None
```

#### 2D. `app/routers/predict.py`

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models import PredictRequest, PredictResponse
from app import predictor

router = APIRouter(prefix="/api/v1", tags=["prediction"])

@router.post("/predict", response_model=PredictResponse)
async def predict_dyslexia(request: PredictRequest):
    """
    Predict dyslexia risk from test session metrics

    **Input:** Test results with Q1-Q32 performance metrics
    **Output:** Dyslexia risk classification + confidence
    """
    if not predictor.is_ready():
        raise HTTPException(status_code=503, detail="Model not ready")

    # Validate features
    request_dict = request.model_dump()
    is_valid, error_msg = predictor.validate_features(request_dict)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Run prediction
    try:
        prob, pred = predictor.predict(request_dict)
        confidence = 1.0 - abs(prob - predictor.threshold)

        return PredictResponse(
            session_id=request.session_id,
            probability=prob,
            prediction=pred,
            confidence=confidence,
            threshold=predictor.threshold,
            model_version=predictor.version,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
```

#### 2E. `app/routers/health.py`

```python
from fastapi import APIRouter
from app.models import HealthResponse, SchemaResponse
from app import predictor

router = APIRouter(prefix="/api/v1", tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health status and model info"""
    if predictor.is_ready():
        return HealthResponse(
            status="healthy",
            model_version=predictor.version,
            features_count=len(predictor.feature_names),
            threshold=predictor.threshold,
            message="Model loaded and ready for inference"
        )
    else:
        return HealthResponse(
            status="error",
            model_version="unknown",
            features_count=0,
            threshold=0.0,
            message="Model failed to load at startup"
        )


@router.get("/schema", response_model=SchemaResponse)
async def get_schema():
    """Expected input schema for /predict endpoint"""
    if not predictor.is_ready():
        return {"error": "Model not loaded"}

    # Extract feature categories
    demographic = ["Gender", "Nativelang", "Otherlang", "Age"]
    performance = [f for f in predictor.feature_names if f not in demographic]

    questions = sorted(set(
        int(f[6:]) for f in performance if f.startswith(('Clicks', 'Hits', 'Misses', 'Score', 'Accuracy', 'Missrate'))
    ))

    measures = ['Clicks', 'Hits', 'Misses', 'Score', 'Accuracy', 'Missrate']

    return SchemaResponse(
        features=predictor.feature_names,
        demographic_features=demographic,
        performance_features=performance,
        questions=questions,
        measures=measures
    )
```

#### 2F. `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from app import predictor as predictor_module
from app.routers import predict, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown"""
    logger.info("🚀 Starting FastAPI service...")

    model_path = os.getenv("MODEL_PATH", "./plos-model.joblib")
    predictor_module.predictor = predictor_module.DyslexyPredictor(model_path)

    yield

    logger.info("🛑 Shutting down FastAPI service")


app = FastAPI(
    title="Dyslexia Prediction API",
    description="RFC model from Rello et al. (PLOS ONE 2020)",
    version="1.0",
    lifespan=lifespan
)

# CORS: Allow Next.js app at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router)
app.include_router(health.router)


@app.get("/")
async def root():
    return {
        "service": "Dyslexia Risk Prediction API",
        "version": "1.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
```

#### 2G. `run.py` (Entry Point)

```python
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info"
    )
```

---

### Phase 3: Integrate with Next.js Test App

#### 3A. Create Next.js API Route: `src/app/api/v1/predict/route.ts`

```typescript
// API route that forwards test session to FastAPI
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call FastAPI /api/v1/predict
    const response = await fetch(`${FASTAPI_URL}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status },
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to predict: ${error.message}` },
      { status: 500 },
    );
  }
}
```

#### 3B. Update Test Session Handler: `src/app/test/[sessionId]/page.tsx`

In the **finishing phase** (after all 32 questions completed), call the prediction endpoint:

```typescript
// In your test session completion handler:

const finishSession = async () => {
  // Gather metrics (already done)
  const sessionMetrics = buildQuestionMetrics(/* ... */);

  // Structure for API
  const predictRequest = {
    session_id: sessionId,
    participant_id: participantId,
    Gender: sessionMetrics.demographics.gender,
    Nativelang: sessionMetrics.demographics.nativeL,
    Otherlang: sessionMetrics.demographics.otherL,
    Age: sessionMetrics.demographics.age,
    ...sessionMetrics.questionMetrics, // Clicks1-32, Hits1-32, etc.
  };

  // Call prediction API
  try {
    const response = await fetch("/api/v1/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictRequest),
    });

    if (!response.ok) throw new Error("Prediction failed");

    const prediction = await response.json();

    // Display result to user
    setSessionResult({
      prediction: prediction.prediction,
      probability: prediction.probability,
      confidence: prediction.confidence,
    });

    // Save result to database/file
    await saveSessionResult(sessionData, prediction);
  } catch (error) {
    console.error("❌ Prediction error:", error);
    setSessionError(`Could not generate prediction: ${error.message}`);
  }
};
```

#### 3C. Environment Configuration

**`.env.local` (Next.js):**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**`.env` (FastAPI):**

```
MODEL_PATH=../plos-model.joblib
API_PORT=8000
RELOAD=true
FRONTEND_URL=http://localhost:3000
```

---

## 3. Deployment Scenarios

### Scenario A: Local Development

```sh
# Terminal 1: FastAPI
cd plos-api
pip install -r requirements.txt
python run.py
# Server listening on http://localhost:8000

# Terminal 2: Next.js
cd english-test-app
npm run dev
# App listening on http://localhost:3000
```

### Scenario B: Docker Compose (Containerized)

**`docker-compose.yml`:**

```yaml
version: "3.8"

services:
  fastapi:
    build: ./plos-api
    ports:
      - "8000:8000"
    volumes:
      - ./plos-model.joblib:/app/plos-model.joblib:ro
    environment:
      - MODEL_PATH=/app/plos-model.joblib
      - API_PORT=8000
    command: python run.py

  nextjs:
    build: ./english-test-app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - fastapi
```

### Scenario C: Production Deployment (Cloud)

**AWS/GCP/Azure:**

- FastAPI → Cloud Run / EC2 / App Service (port 8000)
- Next.js → Vercel / Netlify / CloudFront (port 443)
- Environment: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- SSL/TLS: Reverse proxy (Nginx) → FastAPI
- Monitoring: CloudWatch / Stackdriver logs

---

## 4. Testing Plan

### Unit Tests: `tests/test_predict.py`

```python
import pytest
from app.models import PredictRequest, PredictResponse
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify service health check"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['features_count'] == 196


def test_schema_endpoint():
    """Verify feature schema endpoint"""
    response = client.get("/api/v1/schema")
    assert response.status_code == 200
    data = response.json()
    assert len(data['featured']) == 196
    assert 'Gender' in data['demographic_features']
    assert 32 == len(data['questions'])


def test_predict_valid_request():
    """Test prediction with valid input"""
    request_body = {
        "session_id": "test-123",
        "participant_id": 999,
        "Gender": 1,
        "Nativelang": 1,
        "Otherlang": 0,
        "Age": 10,
        # ... all 192 performance features ...
    }

    response = client.post("/api/v1/predict", json=request_body)
    assert response.status_code == 200
    data = response.json()
    assert "probability" in data
    assert 0.0 <= data["probability"] <= 1.0
    assert data["prediction"] in ["Dyslexia Risk", "No Risk"]


def test_predict_missing_features():
    """Test prediction with incomplete request"""
    request_body = {
        "session_id": "test-123",
        "Gender": 1,
        # Missing many required fields
    }

    response = client.post("/api/v1/predict", json=request_body)
    assert response.status_code == 400
    assert "Missing" in response.json()["detail"]


def test_predict_invalid_age():
    """Test age validation"""
    request_body = {
        "session_id": "test-123",
        "Age": 25,  # Outside valid range [7, 17]
        # ...
    }

    response = client.post("/api/v1/predict", json=request_body)
    assert response.status_code == 400
```

### Integration Tests: `tests/test_integration.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_entire_session_flow():
    """
    Simulate:
    1. User completes test (Next.js)
    2. Next.js calls FastAPI /api/v1/predict
    3. FastAPI returns prediction
    4. Result displayed to user
    """
    # Simulate test metrics from 32 questions
    session_metrics = {
        "session_id": "integration-test-1",
        "participant_id": 500,
        "Gender": 0,
        "Nativelang": 1,
        "Otherlang": 1,
        "Age": 12,
    }

    # Add Q1-Q32 metrics
    for q in range(1, 33):
        session_metrics[f"Clicks{q}"] = 20 + (q % 5)
        session_metrics[f"Hits{q}"] = 18 + (q % 5)
        session_metrics[f"Misses{q}"] = 2 - (q % 3)
        session_metrics[f"Score{q}"] = 18 + (q % 5)
        session_metrics[f"Accuracy{q}"] = 0.85 + (q % 10) * 0.01
        session_metrics[f"Missrate{q}"] = 0.15 - (q % 10) * 0.01

    # Predict
    response = client.post("/api/v1/predict", json=session_metrics)
    assert response.status_code == 200

    prediction = response.json()
    assert prediction["prediction"] in ["Dyslexia Risk", "No Risk"]
    assert prediction["confidence"] > 0.0
```

---

## 5. Data Flow Diagram

```
Next.js (Port 3000)
       │
       │ User completes 32 questions
       │
       ├─ Collects metrics: Clicks, Hits, Misses, Score, Accuracy, Missrate
       │  (per question: Q1-Q32)
       │
       └─ POST /api/v1/predict
          {
            session_id: UUID,
            participant_id: int,
            Gender: 0|1,
            Nativelang: 0|1,
            Otherlang: 0|1,
            Age: 7-17,
            Clicks1-32: float,
            Hits1-32: float,
            Misses1-32: float,
            Score1-32: float,
            Accuracy1-32: float,
            Missrate1-32: float
          }
                ↓
    FastAPI (Port 8000)
                │
                ├─ Validate features (all 196 present, correct ranges)
                ├─ Load plos-model.joblib from memory
                ├─ RFC.predict_proba(X) → probability ∈ [0, 1]
                ├─ Apply threshold (0.24)
                └─ Return:
                   {
                     session_id: UUID,
                     probability: 0.42,
                     prediction: "No Risk",
                     confidence: 0.58,
                     threshold: 0.24,
                     model_version: "1.0",
                     timestamp: ISO8601
                   }
                ↓
    Next.js (display to user)
                │
                ├─ Show: "Dyslexia Risk Assessment: No Risk (58% confidence)"
                ├─ Save result to database/file
                └─ Offer: Print certificate, view detailed feedback
```

---

## 6. API Contract (OpenAPI/Swagger)

**Available at:** `http://localhost:8000/docs` (Swagger UI)  
**RedDoc:** `http://localhost:8000/redoc`

### Endpoint Summary

| Method | Path              | Input          | Output          | Purpose                 |
| ------ | ----------------- | -------------- | --------------- | ----------------------- |
| GET    | `/`               | —              | ServiceInfo     | API overview            |
| GET    | `/api/v1/health`  | —              | HealthResponse  | Service & model status  |
| GET    | `/api/v1/schema`  | —              | SchemaResponse  | Expected input features |
| POST   | `/api/v1/predict` | PredictRequest | PredictResponse | Run inference           |

---

## 7. Error Handling & Observability

### Error Codes

| Code | Scenario                                  | Response                              |
| ---- | ----------------------------------------- | ------------------------------------- |
| 200  | Prediction successful                     | PredictResponse with result           |
| 400  | Invalid request (missing/wrong features)  | `{"error": "Missing features: ..."`   |
| 422  | Validation error (e.g., Age out of range) | Pydantic validation detail            |
| 503  | Model not loaded                          | `{"error": "Model not ready"}`        |
| 500  | Internal error (prediction failed)        | `{"error": "Prediction failed: ..."}` |

### Logging

FastAPI logs to stdout:

```
INFO:     2026-03-25 14:30:00.123 | 🚀 Starting FastAPI service...
INFO:     2026-03-25 14:30:01.456 | ✅ Model loaded successfully. Features: 196
INFO:     2026-03-25 14:30:05.789 | POST /api/v1/predict - 200 OK (12ms)
INFO:     2026-03-25 14:30:10.321 | POST /api/v1/predict - 400 Bad Request (5ms) - Missing features
```

### Metrics to Track

- **Prediction latency:** p50, p95, p99 (target <50ms)
- **Error rate:** % of requests failing validation or inference
- **Model load time:** seconds to start service
- **Feature coverage:** % of requests with all 196 features

---

## 8. Security Considerations

| Risk                | Mitigation                                                  |
| ------------------- | ----------------------------------------------------------- |
| Unauthorized access | CORS restricted to Next.js domain; consider API key in prod |
| Invalid input       | Pydantic validation + custom logic in `validate_features()` |
| Model tampering     | Load model from secure path; version in model metadata      |
| Slow requests       | Set timeout; async handlers; request size limits            |
| Data privacy        | Don't log raw participant IDs; encrypt data at rest         |

---

## 9. Rollout Timeline

### Week 1

- ✅ Create FastAPI project structure
- ✅ Implement request/response models
- ✅ Implement predictor & main app
- ✅ Write unit tests

### Week 2

- ✅ Integrate with Next.js test app
- ✅ End-to-end testing (local dev)
- ✅ Docker containerization
- ✅ Documentation & README

### Week 3

- ⏳ Staging deployment
- ⏳ Performance testing (load, latency)
- ⏳ Security review
- ⏳ Production deployment

---

## 10. Maintenance & Monitoring Checklist

- [ ] FastAPI service auto-restarts on failure
- [ ] Model file versioned in git (or model registry)
- [ ] Logging aggregated to central store (CloudWatch, ELK, Datadog)
- [ ] Predictions sampled & validated against test set monthly
- [ ] API performance SLA: <100ms p95 latency
- [ ] On-call runbook for model/service failures

---

## 11. Quick Start Commands

```bash
# Setup FastAPI
mkdir plos-api
cd plos-api
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run locally
python run.py
# → Service at http://localhost:8000
# → Docs at http://localhost:8000/docs

# Test the API
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", ...}'

# Next.js (separate terminal)
cd ../english-test-app
npm run dev
# → App at http://localhost:3000
```

---

## 12. References

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Pydantic Validation:** https://docs.pydantic.dev/
- **Original Paper:** Rello et al., PLOS ONE 15(12), 2020
- **Model Notebook:** `plos_model.ipynb` (this directory)
