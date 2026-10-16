# InsightERP Production Deployment & Operations Guide

This document details the production architecture, start sequence, environment variable specifications, database seeding, health diagnostics, notification dispatch configurations, and pre-flight validation checklists for the **College Student Retention & Academic Advisory Ecosystem**.

---

## 1. Ecosystem Architecture & Services

The ecosystem consists of six coordinated services across two repositories (`FSD` and `ai-dropout-prediction`):

| Service | Technology | Default Port | Repository Directory | Role |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Document Database (ReplicaSet) | 27017 / Cloud | Cloud Atlas | Persistent store for students, faculty, users, meeting requests, assessments, and action logs. |
| **ML Microservice** | Python 3.12 / FastAPI / Uvicorn | 8001 | `ai-dropout-prediction/ml-service` | Hosts the trained XGBoost model, preprocessing pipeline, and SHAP TreeExplainer. |
| **AI Prediction Gateway** | Node.js / Express | 5001 | `ai-dropout-prediction/backend` | API gateway for predictions, session-token sandboxing, and AI Copilot dialogue. |
| **ERP Backend API** | Node.js / Express | 5000 | `FSD/backend` | Core institutional ERP API, 2FA OTP authentication, meeting workflows, and action engine. |
| **ERP Frontend** | React / Vite / Tailwind | 5173 | `FSD/frontend` | Institutional advisory dashboards for Deans, Faculty Mentors, and Students. |
| **AI Predictor UI** | React / Vite / Tailwind | 5174 | `ai-dropout-prediction/frontend` | Standalone prospective student prediction portal & conversational advisor. |

---

## 2. Recommended Service Startup Order

To satisfy runtime health checks and prevent inter-service connection timeouts, services **must** be booted in the following chronological order:

```
[1. MongoDB Atlas] ➔ [2. ML Microservice (8001)] ➔ [3. AI Gateway (5001)] ➔ [4. ERP Backend (5000)] ➔ [5. Frontends (5173 & 5174)]
```

### Startup Commands

#### Step 1: MongoDB
Ensure your MongoDB instance is running locally or your MongoDB Atlas connection string is active.

#### Step 2: ML Microservice (Port 8001)
```powershell
cd "..\ai-dropout-prediction\ml-service"
# Verify Python 3.12/3.14 virtual environment
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

#### Step 3: AI Prediction Gateway (Port 5001)
```powershell
cd "..\ai-dropout-prediction\backend"
npm install
npm start
```

#### Step 4: ERP Backend (Port 5000)
```powershell
cd "..\FSD\backend"
npm install
npm start
```

#### Step 5: Frontends
```powershell
# In terminal A (ERP Portal)
cd "..\FSD\frontend"
npm install
npm run dev

# In terminal B (AI Predictor Portal)
cd "..\ai-dropout-prediction\frontend"
npm install
npm run dev
```

---

## 3. Environment Variables Reference (FSD Backend)

File location: `FSD/backend/.env` (configured from `.env.example`).

| Variable Name | Required | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `5000` | Port on which the Express ERP server listens. |
| `NODE_ENV` | Yes | `production` or `development` | Operating mode. In `production`, strict security validations and secret length checks are enforced. |
| `MONGO_URI` | Yes | `mongodb+srv://...` | MongoDB connection URI with read/write access. If offline, the ERP falls back to CSV cache. |
| `JWT_SECRET` | Yes | `crypto.randomBytes(32).toString('hex')` | 32+ character HMAC secret used to sign and verify role-based authentication tokens. |
| `API_KEY` | Yes (in prod) | `crypto.randomBytes(32).toString('hex')` | Service-to-service internal API authentication key. |
| `CORS_ORIGINS` | Yes | `https://erp.college.edu,https://ai.college.edu` | Comma-separated list of authorized web origins. Wildcard `*` is explicitly blocked in production. |
| `TRUST_PROXY` | Yes | `1` | Configures Express `trust proxy` level so rate limiters inspect true client IP behind reverse proxies. |
| `AI_SERVICE_BASE_URL`| Yes | `http://localhost:5001` | Base URL of the AI Prediction Gateway for ML scoring and chatbot requests. |
| `AI_SERVICE_API_KEY` | Yes | `sec_f84b1e92d7c04a3e819a6d4e2c71095b` | Secret key sent in `X-API-Key` headers when invoking the AI Gateway. |
| `ERP_SERVICE_API_KEY`| Yes | `erp_srv_9c18d4e7f603a152b820e981c472d03a` | Shared secret key for authenticating incoming crisis meeting requests from AI Copilot. |
| `DEMO_MODE` | No | `false` | When `true`, allows fallback demo credentials. Defaults to `false` in production. |
| `DEMO_PASSWORD` | No | `DemoPass@2026` | Evaluator fallback password (active only when `DEMO_MODE=true` or non-production). |
| `OTP_ENABLED` | Yes | `true` | Enables Two-Factor Email OTP verification upon password validation. |
| `OTP_TTL_SECONDS` | Yes | `300` | Expiration lifetime for 6-digit OTP codes in seconds (5 minutes). |
| `DEMO_SHARED_EMAIL` | Yes | `advising.demo@college.edu` | Fallback recipient inbox for accounts without explicit email fields. |
| `NOTIFY_TRANSPORT` | Yes | `smtp` or `webhook` | Primary alert dispatcher channel (`webhook` for n8n; `smtp` for direct email). |
| `NOTIFY_FALLBACK_SMTP`| No | `true` | Automatically falls back to SMTP if n8n webhook returns non-200. |
| `SMTP_HOST` | If SMTP | `smtp.gmail.com` | Mail server hostname. |
| `SMTP_PORT` | If SMTP | `465` | Mail server port (465 for SSL/TLS, 587 for STARTTLS). |
| `SMTP_USER` | If SMTP | `user@gmail.com` | Authenticated SMTP username / email address. |
| `SMTP_PASS` | If SMTP | `16-digit Google App Password` | SMTP authorization secret / app password. |
| `MAIL_FROM` | If SMTP | `"InsightERP Advising <user@gmail.com>"` | RFC 2822 email sender header. |
| `EMAIL_DRY_RUN` | No | `false` | When `true`, suppresses live email network delivery and logs to mock transport. |
| `N8N_WEBHOOK_URL` | If n8n | `https://n8n.college.edu/webhook/alert` | Webhook target URL for n8n alert workflows. |
| `N8N_WEBHOOK_SECRET` | If n8n | `secret_token_12345` | Shared secret sent in `X-Webhook-Secret` header to n8n. |

---

## 4. Frontend Environment Configuration

### FSD Frontend (`FSD/frontend/.env.production.example`)
```bash
# Production API Base URL (defaults to relative /api when unset)
VITE_API_BASE_URL=https://api.erp.college.edu/api

# Enable Evaluator Quick-Fill Buttons (set to false for live production)
VITE_DEMO_MODE=false
```

### AI Predictor Frontend (`ai-dropout-prediction/frontend/.env.production.example`)
```bash
# Production API Gateway URL
VITE_API_BASE_URL=https://ai-gateway.college.edu/api

# Link back to main Institutional ERP Portal
VITE_ERP_URL=https://erp.college.edu

# Demo Account Assist
VITE_DEMO_MODE=false
```

---

## 5. Production Database Seeding

To seed the initial user accounts, faculty directory, institutional curriculum, and student cohort into MongoDB:

```bash
cd FSD/backend
node scripts/seedDatabase.js
```

### Seeding User Emails
Ensure that every user record created in MongoDB contains an active email address for OTP delivery. If an existing MongoDB record lacks an `email` field, the system seamlessly routes the One-Time Password to `DEMO_SHARED_EMAIL` so users can authenticate without manual database patching.

---

## 6. Health & Warm-Up Diagnostic Endpoints

Before presenting a live demo or deploying to production, verify all subsystem health metrics:

| Endpoint | Method | Auth | Response | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `http://localhost:5000/health` | `GET` | None | `{ "status": "healthy", "system": "FSD College ERP" }` | Shallow container liveness probe. |
| `http://localhost:5000/api/health/deep` | `GET` | None | `{ "status": "ready", "mongo": true, "ai_gateway": true, "ml_service": true, "smtp_configured": true, "latency": { ... } }` | Deep subsystem readiness check verifying end-to-end connectivity without exposing secrets. |
| `http://localhost:5001/health` | `GET` | None | `{ "status": "healthy", "service": "ai-dropout-prediction-gateway" }` | AI Gateway shallow health check. |
| `http://127.0.0.1:8001/health` | `GET` | None | `{ "status": "ok", "service": "ml_dropout_prediction", "model_loaded": true }` | ML microservice and XGBoost artifact verification. |

---

## 7. Notification & Parent Alert Options

InsightERP provides a dual-channel notification engine:

### Option A: Direct SMTP Delivery
Set `NOTIFY_TRANSPORT=smtp` with standard Gmail/Outlook App Password credentials. When a student is assessed as High risk or when a faculty mentor dispatches a parent alert, the system directly renders and sends an HTML academic notice withAnna University advising policies.

### Option B: Hosted n8n Workflow
Set `NOTIFY_TRANSPORT=webhook`, `N8N_WEBHOOK_URL`, and `N8N_WEBHOOK_SECRET`. The ERP dispatches a structured JSON payload containing student metrics, risk category, and parent contact details to your n8n workflow for custom multi-channel notifications (WhatsApp, SMS, Slack, Email). If n8n times out or fails, the system automatically falls back to SMTP (`NOTIFY_FALLBACK_SMTP=true`).

### Safe Dry-Run Mode
Setting `EMAIL_DRY_RUN=true` allows full end-to-end testing without dispatching real emails. The parent alert status on the UI explicitly displays `"Logged (dry run)"`, never false `"Sent"` statuses.

---

## 8. Pre-Flight Verification & Smoke-Test Checklist

Run this 5-minute pre-flight checklist prior to evaluator demonstrations:

- [ ] **Subsystems Live**: Invoke `GET /api/health/deep` on the ERP backend. Ensure `mongo`, `ai_gateway`, `ml_service`, and `smtp_configured` return `true` with latency < 50ms.
- [ ] **2FA Login Flow**: Log in as `mentor` / `DemoPass@2026`. Verify OTP prompt appears and a 6-digit code arrives in the configured inbox. Enter code and confirm dashboard loads.
- [ ] **New Student Assessment**: In the Mentor Dashboard, click **Assess new student**, select an example from the demo selector, and submit. Confirm real XGBoost score, SHAP drivers, and probability bar appear.
- [ ] **Automated Actions**: Confirm that High risk assessment automatically generates an urgent meeting in the inbox and logs `dispatch_mentor_alert` and `dispatch_parent_alert`.
- [ ] **Live Polling**: Open Student Details for the newly assessed mentee and confirm the **Actions taken** card polls and displays every 15 seconds.
- [ ] **Chatbot Distress Handshake**: In Baymate student chat, type `"I want to drop out of college"`. Confirm the AI advisor grounds the response in mentor support and dispatches a crisis meeting request to the ERP inbox.

---

## 9. Known Operational Limits & Mitigations

1. **Free-Tier Cloud Sleep**: If deploying to free tiers (Render, Fly.io, HuggingFace Spaces), services may spin down after 15 minutes of inactivity. Call `GET /api/health/deep` 60 seconds before your demonstration to warm up the containers.
2. **Reverse Proxy Rate Limiting**: Behind Cloudflare or Nginx, ensure `TRUST_PROXY=1` is set so client IP rate limiters protect the server without false 429 lockouts for all campus users.
3. **Shared Demo Inbox**: For live multi-user evaluations where individual student email addresses are not wired to active mailboxes, `DEMO_SHARED_EMAIL` catches all OTPs in a single monitorable inbox.
