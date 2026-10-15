# InsightERP Email Automation Workflow (n8n)

This directory contains the automated notification pipeline for InsightERP. When parent alerts, meeting requests, or status updates occur in the ERP, the backend dispatches a webhook to n8n, which formats and delivers the notification via SMTP.

> **Note on JSON Import Compatibility**: Differences between n8n engine releases (node type versions, schema variations) can occasionally require tweaks when importing JSON workflows directly. If importing `insighterp-notify.workflow.json` warns of missing or outdated node types in your local n8n version, follow the **Manual Step-by-Step Build** instructions below.

---

## 1. How to Run n8n Locally

### Option A: Via NPX (Recommended for quick evaluation)
Ensure Node.js (v18+) is installed:
```bash
npx n8n
```
n8n will start and be accessible at:
```text
http://localhost:5678
```

### Option B: Via Docker
```bash
docker run -it --rm \
  --name insighterp-n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

---

## 2. Generating a Gmail App Password for SMTP

To allow n8n or direct SMTP to deliver emails through Gmail without compromising account security:

1. Log into your Google Account at [myaccount.google.com](https://myaccount.google.com/).
2. Navigate to **Security** → **How you sign in to Google**.
3. Ensure **2-Step Verification** is turned ON.
4. Click on **App passwords** (or search for "App passwords" in the search bar).
5. In the *App name* field, enter `InsightERP Automation` and click **Create**.
6. Google will generate a 16-character passcode (e.g. `abcd efgh ijkl mnop`).
7. Copy this passcode (without spaces) and use it as `SMTP_PASS` in your environment.

---

## 3. Manual Step-by-Step Workflow Setup in n8n

If building the workflow manually in the n8n canvas:

### Node 1: Webhook Ingestion
- **Node Type**: Webhook
- **HTTP Method**: `POST`
- **Path**: `insighterp-notify`
- **Authentication**: Header Auth
  - **Header Name**: `X-Webhook-Secret`
  - **Header Value**: Must match `N8N_WEBHOOK_SECRET` in your backend `.env`.
- **Response Mode**: `Using 'Respond to Webhook' Node`

### Node 2: Switch on Event Type
- **Node Type**: Switch
- **Mode**: Rules
- **Value 1**: `={{ $json.body.event_type }}`
- **Routing Rules**:
  - Rule 0: Equal to `parent_alert`
  - Rule 1: Equal to `meeting_request_created`
  - Rule 2: Equal to `meeting_status_changed`
  - Rule 3: Equal to `mentor_alert`
  - Rule 4: Equal to `risk_high_detected`

### Node 3: Send Email (SMTP)
- **Node Type**: Send Email (or Email)
- **Credential**: Create an **SMTP** credential:
  - **Host**: `smtp.gmail.com`
  - **Port**: `465` (SSL/TLS)
  - **User**: Your Gmail address
  - **Password**: The 16-character Gmail App Password
- **To Email**: `={{ $('Webhook Ingestion').item.json.body.recipient }}`
- **From Email**: `={{ $('Webhook Ingestion').item.json.body.from || 'no-reply@insighterp.edu' }}`
- **Subject**: `={{ $('Webhook Ingestion').item.json.body.subject }}`
- **Text (Body)**: `={{ $('Webhook Ingestion').item.json.body.body_text }}`

### Node 4: Respond to Webhook
- **Node Type**: Respond to Webhook
- **Respond With**: JSON
- **Response Body**:
  ```json
  {
    "status": "sent",
    "event_id": "={{ $('Webhook Ingestion').item.json.body.event_id }}"
  }
  ```
- **Response Code**: `200`

---

## 4. How to Test the Webhook with cURL

Run the following test command in your terminal while n8n is running:

```bash
curl -X POST http://localhost:5678/webhook/insighterp-notify \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: replace_with_your_n8n_secret" \
  -d '{
    "event_id": "evt-test-001",
    "event_type": "parent_alert",
    "risk_level": "High",
    "student": {
      "id": "STU_MIST_IT_Y3_5559",
      "name": "Bhoomika Gowda",
      "department": "IT",
      "year": 3
    },
    "mentor": {
      "id": "FAC_MIST_IT_333",
      "name": "Dr. Sudha Rajagopalan"
    },
    "recipient": "grouppresentation785@gmail.com",
    "subject": "OFFICIAL ACADEMIC NOTICE: Attendance Deficit Warning",
    "body_text": "Dear Parent/Guardian,\n\nAttendance for your ward Bhoomika Gowda is currently 68.2%, below statutory cutoff.",
    "created_at": "2026-10-15T09:00:00.000Z"
  }'
```

Expected Response:
```json
{
  "status": "sent",
  "event_id": "evt-test-001"
}
```

---

## 5. Resilient Fallback Architecture

If n8n is offline, unreachable, or times out (5s limit):
1. When `NOTIFY_FALLBACK_SMTP=true`, the ERP automatically catches the error and dispatches the email directly through `services/mailer.js`.
2. The transaction is logged in the `NotificationLog` collection with channel `smtp_fallback` and status `sent`.
3. If SMTP fallback is disabled (`NOTIFY_FALLBACK_SMTP=false`), the event status is marked as `failed` with the diagnostic error logged for auditing.
4. The user's original HTTP request (e.g. creating a meeting request) is never blocked or failed.
