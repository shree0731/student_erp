# Security Architecture & Threat Model: InSightERP (FSD)

## 1. Authentication & Authorization Model
InSightERP implements a defense-in-depth security model separating client, API gateway, and backend services.

### User Roles & Permissions
1. **Student (`student`)**:
   - Authorized **only** to read their own student record (`/api/students/:id` where `:id == user.linkedId`) and courses/marks.
   - Prohibited from browsing other students' records or accessing student rosters.
   - Prohibited from accessing `/api/admin/summary` or administrative endpoints.
   - Chat assistant requests are strictly locked to the student's authenticated session.
2. **Mentor (`mentor`)**:
   - Authorized to view **only** mentees assigned to them (`/api/faculty/:id/students` where `mentor_id === user.linkedId`).
   - Blocked with `403 Forbidden` if attempting to query a student not assigned to their roster.
   - Prohibited from accessing `/api/admin/summary` or cross-department institutional records.
3. **Dean / Institution Admin (`admin`)**:
   - Authorized to access administrative KPIs, departmental summaries, and college rosters.

### Token Specification
- Authentication is handled via signed JSON Web Tokens (JWT) using the `HS256` algorithm.
- Standard expiration is set to 1 hour (`1h`).
- Tokens include user role, linked identifier, and username in payload.
- All protected endpoints verify signature and claims via `requireAuth` and `requireRole` middleware.

---

## 2. Threat Model Summary

| Threat Scenario | Attacker Profile | Vector | Security Control | Result |
|---|---|---|---|---|
| **IDOR (Insecure Direct Object Reference)** | Student A | Requests `/api/students/STU_B` | Ownership verification in `studentController.js` comparing `req.user.linkedId` | `403 Forbidden` |
| **Unauthorized Mentor Snooping** | Mentor A | Queries mentee assigned to Mentor B | Mentorship assignment check `student.mentor_id === req.user.linkedId` | `403 Forbidden` |
| **Privilege Escalation** | Student | Calls `/api/admin/summary` | Role validation via `requireRole('admin')` | `403 Forbidden` |
| **Credential Brute Force** | External Attacker | `POST /api/auth/login` | `express-rate-limit` (15 requests per 15 minutes window) + bcrypt cost 10 | `429 Rate Limit Exceeded` |
| **Tampered / Expired Token** | Attacker | Forged signature or expired JWT | Cryptographic verification via `jwt.verify(token, JWT_SECRET)` | `401 Unauthorized` |

---

## 3. Fail-Closed Invariant
The ERP server enforces a strict **fail-closed** architecture:
- If `JWT_SECRET` is missing, empty, or placeholder in production, the server **refuses to start** and terminates execution with code 1.
- If an authorization check encounters unexpected state or missing ownership information, access is rejected by default (`403 Forbidden`).
- If downstream AI services are unreachable, fallback controllers supply resilient local guidance without crashing or exposing raw system exceptions to clients.

---

## 4. Secret Management & Hygiene
- Secrets (`JWT_SECRET`, database connection URIs, API keys) are strictly loaded via `.env` files read into `process.env`.
- Real credentials and `.env` files are ignored by git (`.gitignore` includes `.env`, `*.env`, `db.txt`, `*.key`, `*.pem`).
- Only sanitized `.env.example` templates with non-production placeholders are checked into version control.
