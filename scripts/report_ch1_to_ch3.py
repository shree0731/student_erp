import docx
from docx.shared import Inches, Pt, RGBColor
from report_styles import (
    add_chapter_heading, add_section_heading, add_subsection_heading,
    add_body_paragraph, add_bullet_item, style_table, add_table_title
)

def build_chapters_1_to_3(doc):
    """Builds Chapters 1, 2, and 3 with full academic depth and technical rigor."""

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_chapter_heading(doc, 1, "Introduction")

    add_section_heading(doc, "1.1", "Overview")
    add_body_paragraph(
        doc,
        "Higher educational institutions operate in an increasingly data-intensive environment, managing vast volumes "
        "of academic, administrative, and demographic information across multiple semesters and academic cohorts. "
        "Within engineering education, student retention and timely degree completion represent primary barometers "
        "of institutional efficacy, academic quality, and societal value. Despite significant investments in modern campus "
        "facilities and digital learning infrastructure, undergraduate engineering programs globally and across India "
        "continue to witness alarming rates of student disengagement, course backlogs, semester non-progression, and dropout."
    )
    add_body_paragraph(
        doc,
        "Historically, college administrations have relied on conventional Enterprise Resource Planning (ERP) systems to "
        "maintain digital registers of enrollment, semester marks, fee transactions, and faculty workload. However, these "
        "traditional ERP platforms operate strictly as passive record-keeping silos. They are designed for post-hoc administrative "
        "audits rather than proactive pedagogical intervention. By the time a student's terminal semester examination results "
        "are published or an attendance shortage is formally flagged at the end of a semester, the critical window for effective "
        "mentorship, academic counseling, and remedial instruction has already elapsed."
    )
    add_body_paragraph(
        doc,
        "The Student Retention Ecosystem developed in this project fundamentally redefines the institutional ERP architecture. "
        "By synthesizing modern full-stack web engineering with real-time predictive machine learning and event-driven automation, "
        "the system transitions academic administration from retrospective failure cataloging to proactive, continuous student "
        "support. Built on a resilient multi-tier microservice model, the ecosystem integrates a high-performance React 18 user "
        "interface, an Express.js business gateway, an intelligent Python FastAPI inference engine utilizing Extreme Gradient "
        "Boosting (XGBoost) and SHapley Additive exPlanations (SHAP), and an automated n8n workflow pipeline for instant, "
        "multi-stakeholder communications."
    )

    add_section_heading(doc, "1.2", "Background of the Project")
    add_body_paragraph(
        doc,
        "Under the academic regulations of Anna University and autonomous engineering colleges in Tamil Nadu, students must "
        "satisfy strict multi-dimensional criteria to maintain regular academic standing and secure eligibility for semester "
        "examinations. Specifically, students are required to achieve a minimum cumulative attendance of 75% in each course, "
        "pass continuous internal assessments (CIA), and systematically clear prerequisite theory and laboratory subjects. "
        "Failure to meet the attendance threshold results in detention, requiring the student to repeat the entire semester in "
        "a subsequent academic year, while unresolved arrears compound academic anxiety and substantially elevate the probability "
        "of eventual dropout."
    )
    add_body_paragraph(
        doc,
        "In typical college environments, a single faculty mentor is assigned between 20 and 35 undergraduate mentees. Mentors "
        "are tasked with reviewing attendance sheets, verifying internal test marks, monitoring hostel or day-scholar welfare, "
        "and conducting periodic counseling sessions. In practice, faculty members face overwhelming administrative workloads, "
        "forcing them to manually correlate disparate data points across paper registers, spreadsheet exports, and isolated ERP tabs. "
        "Subtle yet decisive early warning indicators—such as rapid attendance decay over consecutive months, deteriorating internal "
        "test averages in core analytical subjects, or prolonged non-attendance at scheduled mentor meetings—invariably slip through "
        "the cracks until catastrophic failure occurs."
    )

    add_section_heading(doc, "1.3", "Problem Definition")
    add_body_paragraph(
        doc,
        "Conventional institutional information systems suffer from three fundamental architectural and functional deficiencies:"
    )
    add_bullet_item(
        doc,
        "Existing campus databases store demographic profiles, monthly attendance trends, internal marks, and university examination "
        "outcomes across unlinked schemas or standalone spreadsheets, creating informational silos that prevent holistic risk evaluation.",
        "Data Fragmentation and Siloing"
    )
    add_bullet_item(
        doc,
        "Risk identification is almost entirely retrospective. Conventional ERP software calculates failure statistics only after "
        "official semester grade sheets are published. Consequently, faculty mentors have zero algorithmic foresight to intervene "
        "during the crucial 4th to 8th instructional weeks when attendance slippage and conceptual deficits first manifest.",
        "Absence of Early Warning Predictive Intelligence"
    )
    add_bullet_item(
        doc,
        "Even when academic distress is recognized by faculty, communication channels between mentors, students, department heads, "
        "and parents remain disjointed, manual, and unlogged. There is no automated, auditable event loop that triggers targeted "
        "counseling, schedules tutorial interventions, or dispatches timely notifications to parents without excessive administrative friction.",
        "Lack of Closed-Loop Intervention Automation"
    )

    add_section_heading(doc, "1.4", "Objectives of the Project")
    add_body_paragraph(
        doc,
        "The overarching objective of this project is to conceptualize, engineer, rigorously test, and validate an integrated, "
        "intelligent Student Retention ERP Ecosystem that addresses these challenges through the following concrete milestones:"
    )
    add_bullet_item(
        doc,
        "Design and construct a modular, multi-tier Enterprise Resource Planning portal supporting secure, role-based workflows for "
        "Institutional Administrators, Faculty Mentors, and Students using React 18, Vite, Express.js, and MongoDB.",
        "1. Full-Stack ERP Development"
    )
    add_bullet_item(
        doc,
        "Train, calibrate, and deploy a supervised machine-learning model (tuned XGBoost) on an extensive institutional dataset of 9,200 "
        "engineering students and 352,753 mark records, classifying student dropout vulnerability into calibrated Low, Medium, and High risk tiers.",
        "2. Predictive Microservice Engineering"
    )
    add_bullet_item(
        doc,
        "Integrate Tree SHAP (SHapley Additive exPlanations) within the real-time inference pipeline to generate local, student-specific "
        "risk driver attributions, empowering faculty mentors to immediately understand the exact mathematical drivers behind every risk classification.",
        "3. Explainable AI (XAI) Integration"
    )
    add_bullet_item(
        doc,
        "Develop an event-driven webhook automation pipeline utilizing n8n and Nodemailer SMTP to execute instant, auditable parent communication "
        "alerts and faculty meeting notifications with robust server-side idempotency, rate-limiting, and recipient resolution.",
        "4. Automated Communication Workflows"
    )
    add_bullet_item(
        doc,
        "Embed an empathetic AI Academic Advisor Copilot within the student and mentor interfaces equipped with a strict rule-based crisis "
        "safety filter and bilingual English/transliterated distress detection, ensuring compassionate guidance and emergency helpline redirection.",
        "5. Intelligent Conversational Support"
    )
    add_bullet_item(
        doc,
        "Enforce zero-crash architectural resilience through graceful fallback mechanisms that allow the ERP portal to continue functioning seamlessly "
        "using local cached data and historical baselines whenever the external machine learning service is offline or unreachable.",
        "6. High Availability and Fault Tolerance"
    )

    add_section_heading(doc, "1.5", "Scope of the Project")
    add_body_paragraph(
        doc,
        "The functional scope of this project encompasses the entire student lifecycle within four-year undergraduate engineering "
        "curricula across multiple academic disciplines (Computer Science, Information Technology, Artificial Intelligence, Electronics, "
        "Electrical, Mechanical, Civil, and allied branches). The system monitors student performance across 8 consecutive semesters, "
        "tracking 16 distinct academic and demographic indicators. The administrative scope spans three primary stakeholder roles:"
    )
    add_bullet_item(
        doc,
        "Provides campus-wide executive visibility into aggregate retention rates, department-level health metrics, high-risk cohort "
        "concentrations, curriculum effectiveness, and institutional meeting request resolution statistics across 4 college units.",
        "Administrative Scope"
    )
    add_bullet_item(
        doc,
        "Equips faculty with an intelligent dashboard displaying assigned mentees prioritized by predictive risk level, live AI risk assessments, "
        "interactive attendance decay trajectories, single-upsert clinical counseling notes, and one-click parent communication dispatches.",
        "Faculty Mentorship Scope"
    )
    add_bullet_item(
        doc,
        "Furnishes students with a transparent portal displaying personal attendance vs. Anna University's 75% cutoff, semester GPA progression, "
        "subject-wise internal marks, a meeting scheduling interface with assigned mentors, and 24/7 access to the AI Academic Copilot.",
        "Student Engagement Scope"
    )

    add_section_heading(doc, "1.6", "Motivation")
    add_body_paragraph(
        doc,
        "The motivation behind this project stems from the severe academic, financial, and psychological consequences of undergraduate "
        "engineering dropout. For students and their families, academic failure or detention represents immense emotional distress, lost "
        "career opportunities, and severe financial hardship, particularly for first-generation learners and rural students from low-income "
        "backgrounds. For academic institutions, student attrition damages National Institutional Ranking Framework (NIRF) rankings, "
        "reduces NBA/NAAC accreditation scores, and reflects systemic mentorship failure."
    )
    add_body_paragraph(
        doc,
        "By leveraging modern data science and event automation, technology can bridge the gap between academic distress and faculty "
        "intervention. Providing faculty mentors with actionable, explainable early warnings transforms counseling from a ceremonial end-of-term "
        "formality into a timely, compassionate, life-changing intervention."
    )

    add_section_heading(doc, "1.7", "Significance of the Project")
    add_body_paragraph(
        doc,
        "The significance of the Student Retention Ecosystem lies in its practical applicability, architectural elegance, and ethical "
        "engineering design. Unlike academic research models that exist purely as theoretical Jupyter notebooks evaluated on offline CSVs, "
        "this project delivers a complete, deployable, enterprise-grade software system. Key contributions include:"
    )
    add_bullet_item(
        doc,
        "Demonstrates a seamless microservice bridge between an asynchronous Express.js Node.js server and a synchronous Python FastAPI "
        "predictive engine executing real-time XGBoost inference with sub-250ms latency.",
        "Microservice Interoperability"
    )
    add_bullet_item(
        doc,
        "Replaces black-box predictions with granular SHAP feature attributions directly rendered within the mentor UI, establishing trust "
        "and transparency in algorithmic decision support.",
        "Empirical Explainability"
    )
    add_bullet_item(
        doc,
        "Integrates a strict, bilingual crisis detection engine that monitors student conversational input for indicators of severe emotional "
        "distress or self-harm, providing an essential ethical safety net rarely present in commercial ERP systems.",
        "Ethical AI and Student Safety"
    )

    add_section_heading(doc, "1.8", "Organization of the Report")
    add_body_paragraph(
        doc,
        "The remainder of this report is systematically organized into eleven cohesive chapters:"
    )
    add_bullet_item(doc, "Surveys existing literature in Educational Data Mining, examines limitations of current ERP platforms, and articulates the proposed architectural advantages.", "Chapter 2 – Related Work and Literature Review")
    add_bullet_item(doc, "Details functional and non-functional requirements, hardware/software specifications, technology stack rationale, use case specifications, and feasibility analyses.", "Chapter 3 – System Analysis and Requirements")
    add_bullet_item(doc, "Presents architectural designs, multi-tier workflows, database schemas, UML class/use case/sequence diagrams, DFDs, ER diagrams, and security protocols.", "Chapter 4 – System Design and Architecture")
    add_bullet_item(doc, "Chronicles the implementation of the React frontend, Express API gateway, MongoDB persistence, FastAPI ML engine, n8n automation, and two-factor OTP security.", "Chapter 5 – Complete Project Implementation")
    add_bullet_item(doc, "Documents inter-service communication protocols, API integration, data flow pipelines, resilient fallback logic, and resolved engineering challenges.", "Chapter 6 – Integration and System Workflow")
    add_bullet_item(doc, "Outlines testing methodologies, verification frameworks, unit/integration testing strategies, AST logic guards, and validation metrics.", "Chapter 7 – Software Testing and Validation")
    add_bullet_item(doc, "Presents exhaustive test case execution tables, boundary value analyses, fault injection results, and test suite verification outcomes.", "Chapter 8 – Test Cases and Results")
    add_bullet_item(doc, "Analyzes empirical model evaluation metrics, confusion matrices, SHAP feature rankings, and administrative impact benchmarks.", "Chapter 9 – Results and Discussion")
    add_bullet_item(doc, "Provides a step-by-step end-to-end user demonstration sequence accompanied by comprehensive project screenshot placeholders.", "Chapter 10 – Project Demonstration and Screenshots")
    add_bullet_item(doc, "Summarizes achieved objectives, project contributions, current limitations, and prospective avenues for future enhancement.", "Chapter 11 – Conclusion and Future Enhancements")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: RELATED WORK AND LITERATURE REVIEW
    # =========================================================================
    add_chapter_heading(doc, 2, "Related Work and Literature Review")

    add_section_heading(doc, "2.1", "Introduction")
    add_body_paragraph(
        doc,
        "The application of data mining, statistical learning, and artificial intelligence in education—broadly termed Educational "
        "Data Mining (EDM) and Learning Analytics (LA)—has emerged as a vibrant domain of computational research over the past two decades. "
        "This chapter examines foundational theoretical retention frameworks, critiques modern predictive modeling methodologies, "
        "analyzes the architectural limitations of commercial academic ERPs, and presents a comparative benchmark substantiating "
        "the novelty and superiority of the proposed Student Retention Ecosystem."
    )

    add_section_heading(doc, "2.2", "Literature Review")
    add_body_paragraph(
        doc,
        "The theoretical foundation of student departure research is rooted in Vincent Tinto's seminal Student Integration Model (1975, 1993). "
        "Tinto posited that student persistence is primarily a function of academic integration (grade performance, intellectual development) "
        "and social integration (peer relations, faculty-student interactions). When either axis experiences prolonged alienation, student "
        "institutional commitment decays, precipitating voluntary withdrawal or academic dismissal. In the context of engineering education, "
        "Seymour and Hewitt (1997) demonstrated that student attrition is rarely due to intellectual inadequacy alone; rather, pacing issues, "
        "poor advisory feedback loops, conceptual bottlenecks in foundational mathematics and physics, and unsupportive faculty interactions "
        "serve as the predominant catalysts for engineering departure."
    )
    add_body_paragraph(
        doc,
        "With the proliferation of digital campus repositories, researchers turned to machine learning algorithms to model student dropout risk. "
        "Romero and Ventura (2010, 2020) provided comprehensive surveys of Educational Data Mining, classifying predictive techniques into "
        "decision trees, logistic regression, naive Bayes classifiers, neural networks, and support vector machines. Early works by Kotsiantis et al. "
        "(2003, 2011) evaluated distance learning student datasets, demonstrating that ensemble methods such as AdaBoost and Random Forests "
        "consistently outperformed individual weak learners by mitigating variance and accommodating noisy feature distributions."
    )
    add_body_paragraph(
        doc,
        "Chen and Guestrin (2016) introduced Extreme Gradient Boosting (XGBoost), a scalable end-to-end tree boosting algorithm that incorporates "
        "a sparsity-aware split finding algorithm, distributed weighted quantile sketches, and explicit algorithmic regularization (L1/L2 penalties) "
        "to prevent overfitting. Recent empirical studies by Agrusti et al. (2020) and Rastrollo-Guerrero et al. (2020) confirmed that gradient "
        "boosted decision trees achieve state-of-the-art predictive accuracy on tabular educational records, outperforming traditional logistic "
        "regressions and deep neural architectures when handling heterogeneous categorical and numerical academic indicators."
    )
    add_body_paragraph(
        doc,
        "A critical limitation identified across educational AI literature is the 'black-box' opacity of ensemble models. When an algorithm "
        "classifies an undergraduate as 'High Risk' without interpretable rationales, academic counselors and faculty mentors exhibit reluctance "
        "to act upon algorithmic recommendations. Lundberg and Lee (2017) addressed this fundamental challenge by introducing SHAP (SHapley "
        "Additive exPlanations), a game-theoretic approach that assigns each feature an importance value representing its marginal contribution "
        "to a particular prediction. Applying Tree SHAP to educational early warning systems enables granular, patient-chart-like explainability, "
        "transforming raw probabilities into actionable diagnostic profiles."
    )

    add_section_heading(doc, "2.3", "Existing System")
    add_body_paragraph(
        doc,
        "In the vast majority of engineering institutions currently operating in India and internationally, student lifecycle management "
        "is conducted through traditional, commercially available campus ERP solutions (e.g., SAP Campus Management, Oracle PeopleSoft Campus, "
        "TCS iON Digital Campus, or bespoke proprietary PHP/MySQL portals). These legacy systems are architectured around monolithic, "
        "tabular database schemas designed primarily to record daily attendance, generate fee receipts, issue hall tickets, and produce "
        "semester grade marksheets."
    )
    add_body_paragraph(
        doc,
        "Under the existing operational workflow, faculty enter attendance hourly or daily. If a student's attendance falls below the mandated "
        "75% threshold, the system flags the student only during the final semester audit—typically one week prior to practical or end-semester "
        "examinations. Similarly, examination cells publish semester GPA and backlog lists weeks after the conclusion of academic instruction. "
        "Faculty mentors manually sift through voluminous PDF rosters to identify failing students, and any subsequent parent contact is made "
        "via ad-hoc, unrecorded telephone calls or physical postal letters."
    )

    add_section_heading(doc, "2.4", "Limitations of Existing Systems")
    add_bullet_item(doc, "Monolithic ERPs maintain no predictive capabilities. They merely log failures after they have occurred, rendering proactive counseling impossible.", "Strictly Retrospective Nature")
    add_bullet_item(doc, "Existing systems treat attendance as a static percentage rather than a dynamic time-series, failing to detect rapid month-over-month attendance drops.", "Inability to Detect Trend Trajectories")
    add_bullet_item(doc, "Commercial ERPs do not incorporate Explainable AI, offering no mechanism to identify whether failure is driven by attendance, arrears, or continuous internals.", "Lack of Algorithmic Transparency")
    add_bullet_item(doc, "When high risk is flagged, mentors must manually draft emails or make phone calls outside the system without audit trails, delivery tracking, or automated escalation.", "Fragmented Intervention Loops")
    add_bullet_item(doc, "Students have no access to contextual guidance, academic distress support, or safe conversational channels to voice anxiety without fear of administrative penalty.", "Absence of Student Copilot Support")
    add_bullet_item(doc, "Monolithic architectures suffer from high downtime; a database query failure or server overload locks out all administrative, faculty, and student portals simultaneously.", "Monolithic Vulnerability")

    add_section_heading(doc, "2.5", "Proposed System")
    add_body_paragraph(
        doc,
        "The proposed Student Retention Ecosystem resolves each of these limitations through an intelligent, loosely coupled, "
        "microservice-oriented design. The system continuously aggregates multidimensional academic indicators—including admission cutoff marks, "
        "semester GPA progression, active arrears, continuous internal assessment performance, assignment marks, mentor meeting attendance, "
        "family income, and monthly attendance decay vectors."
    )
    add_body_paragraph(
        doc,
        "These features are dynamically fed into a dedicated Python FastAPI predictive engine hosting a tuned XGBoost classifier. "
        "The microservice computes calibrated dropout probabilities, assigns a definitive risk tier (Low, Medium, or High), and computes "
        "exact SHAP feature importance vectors for the student's profile. The Express.js backend seamlessly presents these live assessments "
        "to faculty mentors, alongside a zero-crash fallback engine that serves pre-computed cached baselines during microservice maintenance."
    )
    add_body_paragraph(
        doc,
        "Crucially, the ecosystem closes the intervention loop through event-driven automation: students can initiate mentor meeting requests "
        "directly or through an AI Academic Advisor Copilot; mentors review categorized meeting queues and can trigger authenticated parent "
        "alerts dispatched instantly via n8n webhooks or direct SMTP fallback with server-side rate-limiting and audit logging."
    )

    add_section_heading(doc, "2.6", "Advantages of the Proposed System")
    add_bullet_item(doc, "Flags vulnerable students during early instructional weeks, enabling targeted tutorial and remedial intervention.", "Real-Time Early Warning")
    add_bullet_item(doc, "Faculty understand the precise reasons driving risk classifications via interactive SHAP contribution plots.", "Explainable Decision Support")
    add_bullet_item(doc, "Automates the entire dispatch of parent alerts and meeting notifications via n8n with auditable delivery logs.", "Automated Multi-Channel Communication")
    add_bullet_item(doc, "Guarantees zero ERP crashes during network timeouts or ML microservice restarts via graceful degradation.", "Architectural Resilience")
    add_bullet_item(doc, "Features rule-based distress filters capable of recognizing acute academic anxiety and crisis expressions in English, Hindi, and Tamil.", "Ethical Conversational Safety")

    add_section_heading(doc, "2.7", "Comparative Analysis")
    add_body_paragraph(
        doc,
        "Table 2.1 presents a rigorous feature-by-feature comparative evaluation contrasting conventional academic ERPs with the "
        "implemented Student Retention Ecosystem."
    )

    add_table_title(doc, "2.1", "Comparative Analysis of Dropout Prediction Systems")
    comp_tbl = doc.add_table(rows=1, cols=3)
    comp_tbl.rows[0].cells[0].paragraphs[0].text = "EVALUATION CRITERIA"
    comp_tbl.rows[0].cells[1].paragraphs[0].text = "CONVENTIONAL CAMPUS ERP"
    comp_tbl.rows[0].cells[2].paragraphs[0].text = "PROPOSED RETENTION ECOSYSTEM"

    criteria = [
        ("Architecture Paradigm", "Monolithic MVC (PHP/Java/.NET)", "Tiered Microservices (React + Express + FastAPI)"),
        ("Predictive Intelligence", "None (Static SQL record queries)", "Tuned XGBoost Supervised Classification"),
        ("Risk Classification", "Post-exam failure lists only", "Calibrated Low / Medium / High Risk tiers"),
        ("Explainability (XAI)", "Not Supported (Opaque)", "Tree SHAP Local Feature Attribution"),
        ("Attendance Analysis", "Static cumulative % cutoff (<75%)", "Continuous attendance decay trajectory (m1 to mN)"),
        ("Intervention Automation", "Manual phone calls / paper letters", "Event-driven n8n webhooks & SMTP fallback"),
        ("Student Advisory", "Manual in-person queues", "AI Academic Copilot with Crisis Safety Filter"),
        ("Security Protocol", "Single-factor username/password", "Two-Factor Email OTP with HMAC-SHA256 & Locking"),
        ("Fault Resilience", "Database outage halts entire portal", "Zero-crash fallback with cached local baselines"),
        ("UI/UX Design", "Dense, legacy administrative tables", "Light-purple institutional design with dark accents")
    ]
    style_table(comp_tbl, [Inches(1.8), Inches(2.2), Inches(2.3)])
    for crit, conv, prop in criteria:
        r = comp_tbl.add_row()
        r.cells[0].paragraphs[0].text = crit
        r.cells[1].paragraphs[0].text = conv
        r.cells[2].paragraphs[0].text = prop

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: SYSTEM ANALYSIS AND REQUIREMENTS
    # =========================================================================
    add_chapter_heading(doc, 3, "System Analysis and Requirements")

    add_section_heading(doc, "3.1", "System Analysis")
    add_body_paragraph(
        doc,
        "System analysis involves a comprehensive investigation into the functional workflows, organizational roles, data lifecycles, "
        "and operational constraints of engineering institutions. In autonomous engineering colleges affiliated with Anna University, "
        "academic operations are governed by structured semester schedules typically spanning 90 instructional working days. "
        "Throughout this cycle, attendance must be recorded accurately, continuous internal assessments (CIA-1, CIA-2, CIA-3) must be "
        "conducted and mapped to course outcomes (COs), and faculty mentorship sessions must be documented."
    )
    add_body_paragraph(
        doc,
        "The analysis revealed that institutional stakeholders operate under distinct informational requirements: Executive Administrators "
        "require aggregated, multi-campus comparative visibility to direct resource allocation; Faculty Mentors require individualized, "
        "actionable cohort dossiers that highlight academic vulnerability without information overload; and Students require clear, transparent "
        "feedback on their academic trajectory paired with accessible, stigma-free counseling request mechanisms."
    )

    add_section_heading(doc, "3.2", "Functional Requirements")
    add_body_paragraph(
        doc,
        "Functional requirements delineate the specific capabilities, operations, and behaviors that the system must perform. "
        "Table 3.1 details the functional requirements categorized by system user role and subsystem."
    )

    add_table_title(doc, "3.1", "Functional Requirements Specification by User Role")
    fr_tbl = doc.add_table(rows=1, cols=4)
    fr_tbl.rows[0].cells[0].paragraphs[0].text = "REQ ID"
    fr_tbl.rows[0].cells[1].paragraphs[0].text = "SUBSYSTEM"
    fr_tbl.rows[0].cells[2].paragraphs[0].text = "ACTOR"
    fr_tbl.rows[0].cells[3].paragraphs[0].text = "FUNCTIONAL REQUIREMENT DESCRIPTION"

    fr_items = [
        ("FR-01", "Authentication", "All Users", "Support role-based login with email 2FA OTP verification, cooldown, and attempt locking."),
        ("FR-02", "Institutional Analytics", "Admin", "Render multi-campus aggregate metrics, department risk breakdowns, and meeting counts."),
        ("FR-03", "Cohort Oversight", "Mentor", "Display roster of assigned mentees sorted by dropout risk, attendance %, and backlogs."),
        ("FR-04", "Student Dossier", "Mentor", "View complete academic profile, attendance decay graph, marks history, and live AI assessment."),
        ("FR-05", "Clinical Notes", "Mentor", "Create and upsert private counseling notes with 2000-character validation and empty clearing."),
        ("FR-06", "Parent Alert", "Mentor/Admin", "Dispatch automated parent alert emails via n8n webhook with live delivery status tracking."),
        ("FR-07", "Meeting Management", "Student/Mentor", "Allow students to request meetings and mentors to transition status (Ack, Sched, Resolve)."),
        ("FR-08", "Academic Copilot", "Student", "Interactive chatbot offering contextual GPA/attendance advice and automated meeting booking."),
        ("FR-09", "Crisis Safety Filter", "Student/System", "Intercept acute distress messages and inject verified national crisis helplines immediately."),
        ("FR-10", "AI Prediction Engine", "ML Service", "Execute XGBoost inference, calculate class probabilities, and output top SHAP risk drivers."),
        ("FR-11", "Resilient Fallback", "Backend", "Catch ML service timeouts gracefully and serve baseline data without HTTP 500 crashes.")
    ]
    style_table(fr_tbl, [Inches(0.8), Inches(1.2), Inches(1.1), Inches(3.2)])
    for req_id, sub, actor, desc in fr_items:
        r = fr_tbl.add_row()
        r.cells[0].paragraphs[0].text = req_id
        r.cells[1].paragraphs[0].text = sub
        r.cells[2].paragraphs[0].text = actor
        r.cells[3].paragraphs[0].text = desc

    add_section_heading(doc, "3.3", "Non-Functional Requirements")
    add_body_paragraph(
        doc,
        "Non-functional requirements specify the operational quality attributes, constraints, and performance benchmarks "
        "governing system execution. Table 3.2 outlines these parameters."
    )

    add_table_title(doc, "3.2", "Non-Functional Requirements and System Quality Attributes")
    nfr_tbl = doc.add_table(rows=1, cols=3)
    nfr_tbl.rows[0].cells[0].paragraphs[0].text = "ATTRIBUTE"
    nfr_tbl.rows[0].cells[1].paragraphs[0].text = "TARGET BENCHMARK"
    nfr_tbl.rows[0].cells[2].paragraphs[0].text = "ENGINEERING IMPLEMENTATION"

    nfr_items = [
        ("Performance", "< 300 ms API response time", "FastAPI asynchronous endpoints and indexed MongoDB query execution."),
        ("Inference Latency", "< 250 ms for live ML prediction", "Optimized XGBoost Booster C++ core and pre-compiled TreeExplainer."),
        ("Availability", "99.9% uptime for ERP core", "Graceful fallback architecture ensuring zero crashes during microservice downtime."),
        ("Security", "Zero credential/OTP leaks", "HMAC-SHA256 OTP hashing, constant-time compare, and timing-attack prevention."),
        ("Rate Limiting", "10 login requests / minute / IP", "Express-rate-limit brute-force protection with automated sliding window."),
        ("Data Integrity", "Zero duplicate dispatches", "UUID idempotency keys on all automated notifications and meeting relays."),
        ("Usability", "Modern, accessible UI", "Vite/React responsive layout adhering to institutional light-purple design standards."),
        ("Auditability", "100% notification traceability", "Persistent NotificationLog recording recipient, channel, timestamp, and status.")
    ]
    style_table(nfr_tbl, [Inches(1.2), Inches(2.1), Inches(3.0)])
    for attr, bench, impl in nfr_items:
        r = nfr_tbl.add_row()
        r.cells[0].paragraphs[0].text = attr
        r.cells[1].paragraphs[0].text = bench
        r.cells[2].paragraphs[0].text = impl

    add_section_heading(doc, "3.4", "Hardware Requirements")
    add_body_paragraph(
        doc,
        "The hardware specifications for development, testing, and deployment are summarized in Table 3.3."
    )

    add_table_title(doc, "3.3", "Hardware and Development Environment Specifications")
    hw_tbl = doc.add_table(rows=1, cols=3)
    hw_tbl.rows[0].cells[0].paragraphs[0].text = "COMPONENT"
    hw_tbl.rows[0].cells[1].paragraphs[0].text = "MINIMUM DEVELOPMENT REQUIREMENT"
    hw_tbl.rows[0].cells[2].paragraphs[0].text = "RECOMMENDED PRODUCTION ENVIRONMENT"

    hw_items = [
        ("Processor (CPU)", "Intel Core i5 / AMD Ryzen 5 (4 Cores)", "Intel Xeon / AMD EPYC (8+ Cores, 2.8 GHz+)"),
        ("System Memory (RAM)", "8 GB DDR4 RAM", "16 GB – 32 GB DDR4/DDR5 ECC RAM"),
        ("Storage (Disk)", "256 GB SSD (Solid State Drive)", "512 GB NVMe SSD (RAID-1 configuration)"),
        ("Network Interface", "100 Mbps Ethernet / Wi-Fi", "1 Gbps Full-Duplex Dedicated Uplink"),
        ("Display Resolution", "1366 x 768 pixels", "1920 x 1080 pixels (Full HD)")
    ]
    style_table(hw_tbl, [Inches(1.5), Inches(2.4), Inches(2.4)])
    for comp, dev, prod in hw_items:
        r = hw_tbl.add_row()
        r.cells[0].paragraphs[0].text = comp
        r.cells[1].paragraphs[0].text = dev
        r.cells[2].paragraphs[0].text = prod

    add_section_heading(doc, "3.5", "Software Requirements")
    add_bullet_item(doc, "Windows 11 / Ubuntu Linux 22.04 LTS / macOS Sonoma", "Operating System")
    add_bullet_item(doc, "Node.js v18.x or v20.x LTS runtime with npm v9.x+", "Backend Runtime")
    add_bullet_item(doc, "Python 3.10+ / 3.11+ (FastAPI, Uvicorn, XGBoost, Scikit-Learn, SHAP, Joblib)", "Machine Learning Runtime")
    add_bullet_item(doc, "MongoDB Community Edition v6.0+ / MongoDB Atlas with in-memory fallback", "Database Engine")
    add_bullet_item(doc, "React 18.2 with Vite 5.x, Lucide-React icons, React Router DOM v6", "Frontend Framework")
    add_bullet_item(doc, "n8n workflow automation server (self-hosted Docker / Cloud instance)", "Automation Orchestrator")
    add_bullet_item(doc, "Nodemailer transport over TLS (Port 465 / 587) with dry-run support", "SMTP Email Transport")
    add_bullet_item(doc, "Visual Studio Code with ESLint, Jest, Supertest, Pytest, and Postman", "IDE and Testing Tools")

    add_section_heading(doc, "3.6", "Technology Stack")
    add_body_paragraph(
        doc,
        "The selection of the technology stack was guided by principles of high concurrency, decoupled microservices, "
        "rapid UI rendering, and scientific computing robustness. Table 3.4 details the full technology stack."
    )

    add_table_title(doc, "3.4", "Comprehensive Software Technology Stack Matrix")
    tech_tbl = doc.add_table(rows=1, cols=3)
    tech_tbl.rows[0].cells[0].paragraphs[0].text = "TIER / SUBSYSTEM"
    tech_tbl.rows[0].cells[1].paragraphs[0].text = "TECHNOLOGY SELECTED"
    tech_tbl.rows[0].cells[2].paragraphs[0].text = "TECHNICAL JUSTIFICATION AND RATIONALE"

    tech_items = [
        ("Frontend UI", "React 18 + Vite 5", "Virtual DOM diffing, component modularity, instant Hot Module Replacement, and 8.8s build time."),
        ("ERP Backend Gateway", "Node.js + Express.js", "Non-blocking event-driven I/O ideal for proxying REST microservices and handling high concurrent sessions."),
        ("Predictive ML Engine", "Python FastAPI + Uvicorn", "Asynchronous ASGI framework with native Pydantic data validation and sub-millisecond route dispatching."),
        ("Machine Learning Core", "XGBoost (Extreme Gradient Boosting)", "State-of-the-art accuracy on tabular academic data with built-in regularization and class weighting."),
        ("Explainable AI (XAI)", "Tree SHAP (SHapley Explanations)", "Mathematically rigorous Shapley value attribution computing local feature contributions for faculty."),
        ("Primary Database", "MongoDB (NoSQL)", "Flexible document schema supporting nested marks arrays, attendance trend vectors, and dynamic indexes."),
        ("Resilient Persistence", "In-Memory Dual Stores", "Permits offline testing and zero-crash fallback execution without hard MongoDB daemon dependencies."),
        ("Workflow Automation", "n8n Engine", "Visual, low-code, event-driven webhook orchestrator decoupling email dispatching from ERP request threads."),
        ("Email Delivery", "Nodemailer (SMTP)", "Industry-standard SMTP client supporting TLS encryption, retry loops, and simulated dry-run logging."),
        ("Automated Testing", "Jest + Supertest", "Comprehensive test framework providing snapshot, assertion, and HTTP integration testing across 10 suites.")
    ]
    style_table(tech_tbl, [Inches(1.4), Inches(1.8), Inches(3.1)])
    for tier, tech, just in tech_items:
        r = tech_tbl.add_row()
        r.cells[0].paragraphs[0].text = tier
        r.cells[1].paragraphs[0].text = tech
        r.cells[2].paragraphs[0].text = just

    add_section_heading(doc, "3.7", "Feasibility Study")
    add_bullet_item(doc, "The development team possesses extensive expertise in React, Node.js, Python, and machine learning. All chosen frameworks are mature, open-source, and extensively documented.", "Technical Feasibility")
    add_bullet_item(doc, "The entire ecosystem is built using open-source, permissive technologies (MIT/Apache 2.0). Deployment requires no expensive enterprise proprietary licensing, resulting in near-zero software acquisition cost.", "Economic Feasibility")
    add_bullet_item(doc, "The system mimics existing academic terminology (CIA, Arrears, CGPA, Attendance Cutoff) and streamlines mentor workflows. Training required for faculty is minimal.", "Operational Feasibility")
    add_bullet_item(doc, "The project was structured across iterative phases (Dataset preparation, Model training, ERP development, Microservice integration, 2FA security hardening, and Automated testing), completing on schedule.", "Schedule Feasibility")

    add_section_heading(doc, "3.8", "Use Case Description")
    add_body_paragraph(
        doc,
        "Table 3.5 formalizes the core use cases implemented across the system."
    )

    add_table_title(doc, "3.5", "Detailed Tabular Use Case Specification")
    uc_tbl = doc.add_table(rows=1, cols=4)
    uc_tbl.rows[0].cells[0].paragraphs[0].text = "USE CASE ID"
    uc_tbl.rows[0].cells[1].paragraphs[0].text = "ACTOR"
    uc_tbl.rows[0].cells[2].paragraphs[0].text = "PRE-CONDITIONS"
    uc_tbl.rows[0].cells[3].paragraphs[0].text = "POST-CONDITIONS / SUCCESS OUTCOME"

    uc_data = [
        ("UC-01: Two-Factor Login", "All Users", "Valid credentials and active email", "OTP generated, verified; JWT issued; user redirected to role dashboard."),
        ("UC-02: Institutional Overview", "Admin", "Admin authentication token", "Aggregate campus health, department risk distributions, and meeting metrics rendered."),
        ("UC-03: Roster Risk Triage", "Mentor", "Mentor authentication token", "Mentees displayed ordered by risk; low-attendance flags (<75%) prominently highlighted."),
        ("UC-04: Live AI Assessment", "Mentor", "Valid student ID selected", "FastAPI microservice returns calibrated risk tier, probabilities, and top SHAP drivers."),
        ("UC-05: Mentor Notes Upsert", "Mentor", "Mentor token; student dossier open", "Single note created/updated; text >2000 chars rejected; empty text clears note."),
        ("UC-06: Parent Alert Dispatch", "Mentor", "Student attendance or risk deficit", "n8n webhook invoked; email sent to parent/guardian; event logged in NotificationLog."),
        ("UC-07: Meeting Lifecycle", "Student / Mentor", "Active mentee-mentor relationship", "Request created by student; mentor acknowledges, schedules slot, or resolves request."),
        ("UC-08: Academic Copilot", "Student", "Student portal session active", "Contextual advice generated; meeting booked via chat; crisis distress safely handled.")
    ]
    style_table(uc_tbl, [Inches(1.2), Inches(1.1), Inches(1.5), Inches(2.5)])
    for ucid, act, pre, post in uc_data:
        r = uc_tbl.add_row()
        r.cells[0].paragraphs[0].text = ucid
        r.cells[1].paragraphs[0].text = act
        r.cells[2].paragraphs[0].text = pre
        r.cells[3].paragraphs[0].text = post

    add_section_heading(doc, "3.9", "System Constraints and Assumptions")
    add_bullet_item(doc, "The student's institutional email address must be active to receive time-sensitive 2FA One-Time Passwords.", "Email Connectivity")
    add_bullet_item(doc, "The predictive model expects academic indicators within normalized domain boundaries (e.g., attendance 0-100%, GPA 0-10, year 1-4).", "Data Formatting")
    add_bullet_item(doc, "In environments where MongoDB daemon is not running, the system gracefully engages in-memory collections populated from seeded datasets.", "Persistence Flexibility")
    add_bullet_item(doc, "The crisis safety filter operates as a supportive academic first-aid mechanism and is not a substitute for clinical psychiatric care.", "Ethical Boundary")

    doc.add_page_break()
