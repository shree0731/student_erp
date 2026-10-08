# InSightERP: Academic Student Retention & Early Warning Ecosystem

InSightERP is an enterprise academic management platform integrated with an explainable machine learning early-warning engine to prevent undergraduate student dropout across engineering departments.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client Tier
        FE["React / Vite Frontend\n(Port 5173)\nRole-Guarded Dashboards"]
    end

    subgraph ERP Core Tier
        EB["Node.js / Express ERP Backend\n(Port 5000)\nJWT Auth • RBAC • Input Sanitization"]
        DB[("MongoDB Database\n(student_dropout_erp)\nUsers • Students • Marks • Faculty")]
    end

    subgraph AI Early Warning Tier
        AB["AI Microservice Express Gateway\n(Port 5001)\nFail-Closed API Key • Rate Limiting"]
        ML["FastAPI ML Microservice\n(Port 8001)\nTuned XGBoost • SHAP Explainability"]
        MODELS[("Single-Source Artifacts\ndropout_model.pkl\npreprocessor.pkl")]
    end

    FE -->|"JWT Bearer Auth"| EB
    EB -->|"Mongoose ODM"| DB
    EB -->|"X-API-Key Protected Proxy"| AB
    AB -->|"HTTP REST"| ML
    ML -->|"joblib.load"| MODELS
```

---

## 2. Quickstart & Local Setup

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- MongoDB (Local community instance or Atlas connection)

### Step 1: Clone and Configure Environment
```bash
# In project root:
cd backend
cp .env.example .env
```
Edit `backend/.env` with your desired configuration:
- Set `JWT_SECRET` (e.g. run `openssl rand -base64 32`).
- Set `AI_SERVICE_URL=http://localhost:5001` and `AI_SERVICE_API_KEY`.
- Set `MONGO_URI`.

### Step 2: Seed the Database
```bash
cd backend
npm install
node scripts/seedDb.js
```
This loads curriculum data, faculty records, course marks, and students, creating bcrypt-hashed demo accounts:
- **Admin**: `admin` / (password from `DEMO_PASSWORD` or printed at seed time)
- **Faculty Mentor**: `mentor`
- **Student**: `student`

### Step 3: Run the Servers
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

---

## 3. Running Verification Tests
Execute the comprehensive test runner to verify authentication, ownership controls, feature parity, and Vite production bundle validity:

```powershell
# Windows PowerShell:
.\run_tests.ps1

# Linux / macOS:
chmod +x run_tests.sh
./run_tests.sh
```

Or run individual unit suites:
```bash
cd backend
npm test
```

---

## 4. Security & Role Invariants
- **Student Role**: Strictly scoped to reading their own student profile, marks, and context-grounded AI advisor messages (`403 Forbidden` if querying other students).
- **Mentor Role**: Scoped only to students assigned under their mentor ID.
- **Admin Role**: Authorized for institutional summary metrics and global roster.
- **Fail-Closed Principle**: If `JWT_SECRET` is unset, the server refuses to start.
- Full details documented in [docs/security.md](docs/security.md).
