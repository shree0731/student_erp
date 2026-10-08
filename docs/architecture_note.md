# Architecture Note: Single Consolidated AI Service Integration

## 1. Architectural Consolidation Overview

The collegiate ERP (`FSD/`) was previously configured with two parallel prediction and chatbot mechanisms:
1. **The Intended Product Integration**: `backend/services/aiServiceClient.js` calling the standalone `ai-dropout-prediction` microservice platform (port 5001).
2. **A Redundant Internal Model**: An internal `FSD/ml-service` (port 8001) and duplicate `FSD/backend/controllers/chatController.js`.

Both microservices attempted to bind to **port 8001**, creating port collisions and model discrepancy risks. The redundant internal service has been **completely removed**. The ERP now consumes the standalone `ai-dropout-prediction` microservice as its single source of truth for both:
- **ML Dropout Risk Predictions & SHAP Explainability** (`/api/predict` via `aiServiceClient.getPrediction`)
- **Contextual Intervention Chatbot** (`/api/chat` via `aiServiceClient.sendChatMessage`)

---

## 2. Decoupled Service Architecture

```
[FSD ERP Frontend] (:5173)
       │
       ▼ (HTTP REST /api/*)
[FSD ERP Express Backend] (:5000)
       │
       ├─► [MongoDB Atlas / CSV Fallback] (Student records, marks, curriculum)
       │
       ▼ (X-API-Key Protected REST calls via services/aiServiceClient.js)
[Standalone AI Platform Gateway] (:5001 - Express)
       │
       ├─► POST /api/predict (SHAP feature drivers + risk probability)
       ├─► POST /api/chat (Intervention counseling & mentor scheduling)
       │
       ▼ (Internal Microservice Communication)
[FastAPI ML Engine] (:8001 - Python 3.10+)
       ├─► Serialized XGBoost Pipeline (Cost-sensitive weighted)
       ├─► TreeExplainer SHAP Attribution Engine
       └─► Gemini LLM Intervention Agent
```

---

## 3. Key Design Principles

1. **Pluggable Enterprise Integration**: The ERP acts as an authentic institutional consumer of an external predictive AI service. It does not train or run machine learning models internally.
2. **Zero-Crash Resilient Degradation**: If the standalone AI service is ever offline or unreachable, `aiServiceClient.js` intercepts timeouts (5s strict timeout) and provides a structured fallback response (`source: 'fallback'`). The mentor dashboard cleanly renders **Offline Resilient Mode** with verified baseline institutional records.
3. **Consolidated Chatbot (Option A)**: Rather than running a parallel Gemini chatbot inside the ERP with duplicate keys and prompts, the ERP delegates all student intervention queries to the standalone AI site's `/api/chat` endpoint. This guarantees unified counsel, central meeting request tracking in MongoDB Atlas, and consistent explanations.
