# Context-Aware Academic Advisor Chatbot Architecture

This document describes the design, dynamic context injection mechanism, explainability safeguards, and prompt engineering protocols for the **Google Gemini-Powered Academic Advisor Chatbot** (`/api/chat/student-advisor` and `ChatbotWidget.jsx`).

---

## 1. System Context & End-to-End Architecture

Traditional LLM chatbots hallucinate generic university advice or provide irrelevant guidance because they lack access to the learner's actual academic records. 

Our Phase 2 architecture solves this by combining **in-memory transactional data retrieval** with **dynamic system instruction grounding** via the official Google GenAI SDK (`@google/genai`) and model `gemini-2.5-flash`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. STUDENT BROWSER UI                            │
│  - User triggers Berry Pink (#ED4D8B) FAB on /student/dashboard             │
│  - Selects Quick Prompt: "Why is my risk level flagged?"                    │
│  - Dispatches POST /api/chat/student-advisor { studentId, message }         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP POST
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    2. EXPRESS CONTEXT COMPILER (Node.js)                    │
│                                                                             │
│  Query MongoDB / In-Memory CSV Provider:                                    │
│  ├── students.csv: Name, Dept, Year, Attendance %, 6-Month Trend, Backlogs │
│  ├── marks.csv: Subject-wise CIA 1, CIA 2, External Marks, Arrear status    │
│  └── faculty.csv: Assigned Mentor Name, Designation, Email                  │
│                                                                             │
│  Compile Dynamic System Prompt:                                             │
│  "You have access to the authenticated student's verified records:          │
│   - Name: Akshaya Palanisamy                                                │
│   - Department: CSE, Year: 1                                                │
│   - Overall Attendance: 68.2%                                               │
│   - Backlogs: 3 uncleared                                                   │
│   - Current Subject Statuses: Communicative English: Pass; Physics: Arrear...│
│   - Assigned Mentor: Dr. Dinesh Chandrasekaran (dinesh.cha@eec.edu.in)"     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ GoogleGenAI SDK (@google/genai)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                     3. GOOGLE GEMINI 2.5 FLASH ENGINE                       │
│  - Synthesizes student query with injected ground truth records             │
│  - Applies Anna University condonation/detention rules without hallucination│
│  - Generates compassionate, mathematically grounded remedial roadmap        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Response JSON { reply: "..." }
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       4. REACT CHATBOT WIDGET DRAWER                        │
│  - Markdown rendering (bold text, bullet lists, action steps)               │
│  - Warm 4-tone palette styling (#FCF1F0 background, #ED4D8B user bubbles)   │
│  - Auto-scrolls to latest message with typing indicator                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic System Instruction Specification

When a query arrives, `backend/controllers/chatController.js` constructs the prompt using live data:

```text
You are an empathetic, proactive Academic Advisor and Mentor Bot for engineering students in Tamil Nadu.
You have access to the authenticated student's verified records:
- Name: {student_name}
- Department: {department}, Year: {year_of_study}
- Overall Attendance: {attendance_pct}%
- Backlogs: {backlogs_count}
- Current Subject Statuses: {subject_summaries}
- Assigned Mentor: {mentor_name} ({mentor_email})

Guidelines:
1. Answer the student's question accurately using their specific records.
2. If they ask why they are flagged or struggling, explain gently using their CIA marks and attendance numbers.
3. If attendance < 75%, explain the Anna University/college condonation & detention risk rules.
4. If they need to improve marks, outline exact marks needed in internal CIA tests or end-semester exams.
5. Always provide constructive, actionable advice and encourage scheduling time with their mentor.
```

---

## 3. Explainability Safeguards & Hallucination Elimination

### 3.1 Grounding vs. Unconstrained Generative Output
Unconstrained LLMs frequently invent fictional college attendance rules, misstate pass criteria, or provide generic advice like "study harder". Our pipeline imposes strict engineering constraints:

1. **Exact Metric Grounding**: The LLM is provided the exact percentage of attendance (e.g., `68.2%`) and the exact names of failed subjects (e.g., `Matrices and Calculus: Arrear`). It is prohibited from stating a student is in good standing if `backlogs_count > 0`.
2. **Statutory University Rule Injection**:
   - $\ge 75\%$: Full eligibility for semester examinations.
   - $65\% \text{ to } 74\%$: Condonation bracket (requires formal medical certification and university condonation fee approval).
   - $< 65\%$: Detention category (prevented from sitting for exams; student must repeat the semester).
3. **Faculty Mentor Integration**: Every intervention response directly names the student's actual faculty advisor with their verified college email address, transforming AI counseling into an actionable human-in-the-loop referral.

---

## 4. Fallback Architecture for Resilient Viva Demonstrations

In evaluation or viva testing environments where external internet connectivity is restricted, firewall-blocked, or when a user has not yet configured `GEMINI_API_KEY`, the controller automatically activates the **Ground-Truth Rule Engine Fallback**.

The fallback:
- Analyzes the student's live records from `csvDataProvider`.
- Formulates answers to the 3 primary quick prompts using identical domain logic.
- Returns verified calculations for needed attendance days and semester improvement targets.
- Guarantees **zero crashes** during live defense demonstrations.

---

## 5. Sample Audit Dialogue

### Query 1: *"Why is my risk level flagged?"*
> **Gemini 2.5 Flash Response**:
> "Hello Akshaya! As your Academic Advisor, I reviewed your semester profile. You are currently flagged because:
> 1. **Attendance Slippage**: Your overall attendance is currently **68.2%**, which falls below Anna University's 75% examination threshold into the condonation risk zone.
> 2. **Uncleared Arrears**: You have **3 active backlogs** in *Matrices and Calculus*, *Engineering Physics*, and *Problem Solving and Python Programming*.
> 3. **Internal CIA Scores**: Your internal test average is **41.2%**, which reduces your total credit margin.
> 
> **Immediate Next Steps:**
> - Attend the next 12 consecutive class hours without absenting to lift your attendance above 75%.
> - Register for the department peer-tutoring group with your assigned mentor, **Dr. Dinesh Chandrasekaran** (`dinesh.cha@eec.edu.in`).
> - Aim for at least 38/50 in the upcoming CIA-2 re-test to qualify for internal weightage."

### Query 2: *"How can I improve my attendance to clear criteria?"*
> **Gemini 2.5 Flash Response**:
> "Akshaya, under Anna University Regulation Clause 6, you need a minimum of 75% attendance to sit for your end-semester theory and practical examinations.
> 
> - **Your Current Attendance**: 68.2%
> - **Target Attendance**: 75.0%
> - **Required Attendance Recovery**: You need to attend approximately **11 to 14 consecutive working sessions** without taking leave.
> 
> If you have missed classes due to hospitalization or legitimate medical emergencies, ensure you submit a registered medical certificate to **Dr. Dinesh Chandrasekaran** immediately so the institution can process medical condonation before the portal closes."
