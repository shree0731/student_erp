import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from report_styles import (
    add_chapter_heading, add_section_heading, add_body_paragraph,
    add_bullet_item, style_table, style_prelim_table, add_table_title
)

def build_preliminary_pages(doc):
    """Builds Title Page, Bonafide Certificate, Viva-Voce Certificate, Abstract, Acknowledgement,
    Table of Contents, List of Figures, List of Tables, and List of Abbreviations."""

    # =========================================================================
    # 1. TITLE PAGE (Page 1)
    # =========================================================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(24)
    r = p_title.add_run("STUDENT RETENTION ECOSYSTEM:\nAI-DRIVEN DROPOUT PREDICTION AND EVENT-AUTOMATED ACADEMIC INTERVENTION ERP")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(18)
    p_sub.paragraph_format.space_after = Pt(18)
    r = p_sub.add_run("A PROJECT REPORT\n\nSubmitted by\n\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    r_names = p_sub.add_run("[STUDENT NAME 1] ([REGISTRATION NUMBER 1])\n[STUDENT NAME 2] ([REGISTRATION NUMBER 2])\n[STUDENT NAME 3] ([REGISTRATION NUMBER 3])\n[STUDENT NAME 4] ([REGISTRATION NUMBER 4])")
    r_names.font.name = 'Times New Roman'
    r_names.font.size = Pt(12)
    r_names.font.bold = True

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_before = Pt(20)
    p_deg.paragraph_format.space_after = Pt(24)
    r = p_deg.add_run("in partial fulfillment for the award of the Degree\nof\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.italic = True

    r_be = p_deg.add_run("BACHELOR OF ENGINEERING\nin\n[DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING]")
    r_be.font.name = 'Times New Roman'
    r_be.font.size = Pt(13)
    r_be.font.bold = True

    p_col = doc.add_paragraph()
    p_col.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_col.paragraph_format.space_before = Pt(36)
    p_col.paragraph_format.space_after = Pt(0)
    r = p_col.add_run("EASWARI ENGINEERING COLLEGE\n(AN AUTONOMOUS INSTITUTION) – AFFILIATED TO ANNA UNIVERSITY, CHENNAI\nRAMAPURAM, CHENNAI – 600 089\n\n[MONTH YEAR]")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # 2. BONAFIDE CERTIFICATE (Page 2)
    # =========================================================================
    p_c_head = doc.add_paragraph()
    p_c_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_head.paragraph_format.space_before = Pt(24)
    p_c_head.paragraph_format.space_after = Pt(6)
    r = p_c_head.add_run("EASWARI ENGINEERING COLLEGE\nRAMAPURAM, CHENNAI – 600 089")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_bon = doc.add_paragraph()
    p_bon.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bon.paragraph_format.space_before = Pt(18)
    p_bon.paragraph_format.space_after = Pt(24)
    r = p_bon.add_run("BONAFIDE CERTIFICATE")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_bon_body = doc.add_paragraph()
    p_bon_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_bon_body.paragraph_format.space_before = Pt(12)
    p_bon_body.paragraph_format.space_after = Pt(18)
    p_bon_body.paragraph_format.line_spacing = 1.5
    r = p_bon_body.add_run(
        "Certified that this project report titled \"STUDENT RETENTION ECOSYSTEM: AI-DRIVEN DROPOUT PREDICTION "
        "AND EVENT-AUTOMATED ACADEMIC INTERVENTION ERP\" is the bonafide work of "
        "\"[STUDENT NAME 1] ([REGISTRATION NUMBER 1]), [STUDENT NAME 2] ([REGISTRATION NUMBER 2]), "
        "[STUDENT NAME 3] ([REGISTRATION NUMBER 3]), and [STUDENT NAME 4] ([REGISTRATION NUMBER 4])\", "
        "who carried out the project work under my supervision in partial fulfillment of the requirements "
        "for the award of the Degree of Bachelor of Engineering in [DEPARTMENT NAME] of Easwari Engineering "
        "College (Autonomous), affiliated to Anna University, Chennai."
    )
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    # Signatures table
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(80)

    sig_tbl = doc.add_table(rows=1, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1 = sig_tbl.cell(0, 0)
    c2 = sig_tbl.cell(0, 1)
    c1.width = Inches(3.1)
    c2.width = Inches(3.1)

    p_sig1 = c1.paragraphs[0]
    p_sig1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_sig1.add_run("HEAD OF THE DEPARTMENT\n\n[NAME OF HOD]\nProfessor & Head\nDepartment of [DEPARTMENT]\nEaswari Engineering College\nChennai – 600 089")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True

    p_sig2 = c2.paragraphs[0]
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig2.add_run("SUPERVISOR / PROJECT GUIDE\n\n[NAME OF GUIDE]\n[DESIGNATION OF GUIDE]\nDepartment of [DEPARTMENT]\nEaswari Engineering College\nChennai – 600 089")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # 3. CERTIFICATE OF VIVA-VOCE EXAMINATION (Page 3)
    # =========================================================================
    p_v_head = doc.add_paragraph()
    p_v_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_v_head.paragraph_format.space_before = Pt(24)
    p_v_head.paragraph_format.space_after = Pt(6)
    r = p_v_head.add_run("EASWARI ENGINEERING COLLEGE\n(AN AUTONOMOUS INSTITUTION)\nRAMAPURAM, CHENNAI – 600 089")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_viva = doc.add_paragraph()
    p_viva.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_viva.paragraph_format.space_before = Pt(18)
    p_viva.paragraph_format.space_after = Pt(24)
    r = p_viva.add_run("Certificate of Viva-Voce Examination")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_v_body = doc.add_paragraph()
    p_v_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_v_body.paragraph_format.space_before = Pt(12)
    p_v_body.paragraph_format.space_after = Pt(18)
    p_v_body.paragraph_format.line_spacing = 1.5
    r = p_v_body.add_run(
        "This is to certify that the Viva-Voce Examination of the Project Work entitled "
        "\"STUDENT RETENTION ECOSYSTEM: AI-DRIVEN DROPOUT PREDICTION AND EVENT-AUTOMATED ACADEMIC INTERVENTION ERP\" "
        "submitted by [STUDENT NAME] (Reg. No. [REGISTRATION NUMBER]) in partial fulfillment of the requirements "
        "for the award of the degree of BACHELOR OF ENGINEERING was conducted on ________________ (Date) in "
        "the Department of [DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING], Easwari Engineering College, "
        "Ramapuram – Chennai."
    )
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    p_v_sp = doc.add_paragraph()
    p_v_sp.paragraph_format.space_before = Pt(90)

    viva_tbl = doc.add_table(rows=1, cols=2)
    viva_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    vc1 = viva_tbl.cell(0, 0)
    vc2 = viva_tbl.cell(0, 1)
    vc1.width = Inches(3.1)
    vc2.width = Inches(3.1)

    pv1 = vc1.paragraphs[0]
    pv1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = pv1.add_run("Internal Examiner\n\nName: _______________________\nDesignation: _________________\nAddress: _____________________\n_____________________________\n\nDate: ________________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)

    pv2 = vc2.paragraphs[0]
    pv2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = pv2.add_run("External Examiner\n\nName: _______________________\nDesignation: _________________\nAddress: _____________________\n_____________________________\n\nDate: ________________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)

    doc.add_page_break()

    # =========================================================================
    # 4. ABSTRACT (Page 4)
    # =========================================================================
    p_abs_h = doc.add_paragraph()
    p_abs_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_h.paragraph_format.space_before = Pt(24)
    p_abs_h.paragraph_format.space_after = Pt(18)
    r = p_abs_h.add_run("ABSTRACT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(
        doc,
        "Student attrition in higher engineering education is a critical academic and administrative concern, "
        "compounded by fragmented institutional data, late identification of academic difficulties, and a lack of "
        "automated, closed-loop intervention mechanisms. Traditional Enterprise Resource Planning (ERP) systems "
        "function merely as passive relational data repositories, displaying retrospective grades and attendance records "
        "only after terminal semester failures or non-condonable attendance deficits have already occurred."
    )
    add_body_paragraph(
        doc,
        "To address these systemic shortcomings, this project implements the Student Retention Ecosystem—a production-grade, "
        "full-stack Enterprise Resource Planning application integrated with a machine-learning microservice and event-driven "
        "webhook automation. The ecosystem operates across a tiered architecture comprising a responsive React 18 user interface "
        "styled with an institutional light-purple design system, an Express.js/Node.js API gateway, a MongoDB persistence layer "
        "with automatic in-memory fallback stores, a dedicated Python FastAPI machine learning microservice utilizing tuned "
        "Extreme Gradient Boosting (XGBoost) and SHapley Additive exPlanations (SHAP), and an event-driven n8n workflow engine "
        "for instant mentor and guardian alerts."
    )
    add_body_paragraph(
        doc,
        "The predictive model was trained, validated, and evaluated on a benchmark institutional dataset comprising 9,200 "
        "undergraduate engineering students and 352,753 semester mark entries spanning 13 departments across 4 campus units. "
        "Features incorporate academic decay metrics, internal examination progression, admission cutoff ranks, annual family income, "
        "first-generation learner indicators, and travel distance. The resulting tuned XGBoost classifier demonstrates exceptional "
        "predictive performance on an independent held-out test set of 1,840 students, achieving an overall accuracy of 95.60%, "
        "a macro-averaged F1 score of 0.9265, and a High-Risk class recall of 99.35% with a low Brier calibration score of 0.0648."
    )
    add_body_paragraph(
        doc,
        "The system incorporates high-reliability features including two-factor authentication (2FA) via time-limited email "
        "One-Time Passwords (OTP) protected by constant-time verification and automated brute-force attempt locking; a resilient, "
        "zero-crash fallback mechanism ensuring uninterrupted ERP operations during microservice downtime; an empathetic AI Academic "
        "Advisor Copilot with bilingual English and transliterated crisis safety filters; and a structured meeting request relay "
        "and mentor note upsert system. The entire implementation was validated through 10 comprehensive Jest integration test suites "
        "achieving a 100% pass rate across 65 test assertions and Babel AST UI-freeze verification."
    )

    doc.add_page_break()

    # =========================================================================
    # 5. ACKNOWLEDGEMENT (Page 5)
    # =========================================================================
    p_ack_h = doc.add_paragraph()
    p_ack_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_h.paragraph_format.space_before = Pt(24)
    p_ack_h.paragraph_format.space_after = Pt(18)
    r = p_ack_h.add_run("ACKNOWLEDGEMENT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(
        doc,
        "We express our sincere gratitude to our respected Principal, Dr. P. Deiva Sundari, and the Management of "
        "Easwari Engineering College (Autonomous), Chennai, for providing us with state-of-the-art laboratory infrastructure, "
        "high-speed computing resources, and an inspiring academic environment to carry out this project work successfully."
    )
    add_body_paragraph(
        doc,
        "We convey our heartfelt thanks to the Head of the Department, Department of [DEPARTMENT NAME], for their continuous "
        "encouragement, academic facilitation, and valuable suggestions during the design and evaluation stages of this system."
    )
    add_body_paragraph(
        doc,
        "We are extremely thankful and indebted to our Project Supervisor and Guide, [NAME OF GUIDE], [DESIGNATION], "
        "Department of [DEPARTMENT NAME], for their constructive criticism, scholarly guidance, technical insights, and "
        "unwavering motivation throughout the conceptualization, development, and testing phases of this project."
    )
    add_body_paragraph(
        doc,
        "We would also like to extend our gratitude to all the faculty members, laboratory technicians, and non-teaching staff "
        "of the Department of [DEPARTMENT NAME] for their direct and indirect support during the project tenure."
    )
    add_body_paragraph(
        doc,
        "Finally, we express our profound love and gratitude to our parents, family members, and friends for their continuous "
        "encouragement, patience, and moral support throughout the course of our engineering degree program."
    )

    doc.add_page_break()

    # =========================================================================
    # 6. TABLE OF CONTENTS (Pages 6-7)
    # =========================================================================
    p_toc_h = doc.add_paragraph()
    p_toc_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_h.paragraph_format.space_before = Pt(18)
    p_toc_h.paragraph_format.space_after = Pt(12)
    r = p_toc_h.add_run("TABLE OF CONTENTS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    toc_data = [
        ("BONAFIDE CERTIFICATE", "ii"),
        ("CERTIFICATE OF VIVA-VOCE EXAMINATION", "iii"),
        ("ABSTRACT", "iv"),
        ("ACKNOWLEDGEMENT", "v"),
        ("LIST OF FIGURES", "viii"),
        ("LIST OF TABLES", "ix"),
        ("LIST OF ABBREVIATIONS", "x"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Overview", "1"),
        ("  1.2 Background of the Project", "1"),
        ("  1.3 Problem Definition", "2"),
        ("  1.4 Objectives of the Project", "2"),
        ("  1.5 Scope of the Project", "3"),
        ("  1.6 Motivation", "3"),
        ("  1.7 Significance of the Project", "4"),
        ("  1.8 Organization of the Report", "4"),
        ("CHAPTER 2: RELATED WORK AND LITERATURE REVIEW", "6"),
        ("  2.1 Introduction", "6"),
        ("  2.2 Literature Review", "6"),
        ("  2.3 Existing System", "7"),
        ("  2.4 Limitations of Existing Systems", "7"),
        ("  2.5 Proposed System", "8"),
        ("  2.6 Advantages of the Proposed System", "8"),
        ("  2.7 Comparative Analysis", "9"),
        ("CHAPTER 3: SYSTEM ANALYSIS AND REQUIREMENTS", "10"),
        ("  3.1 System Analysis", "10"),
        ("  3.2 Functional Requirements", "10"),
        ("  3.3 Non-Functional Requirements", "11"),
        ("  3.4 Hardware Requirements", "12"),
        ("  3.5 Software Requirements", "12"),
        ("  3.6 Technology Stack", "12"),
        ("  3.7 Feasibility Study", "13"),
        ("  3.8 Use Case Description", "13"),
        ("  3.9 System Constraints and Assumptions", "14"),
        ("CHAPTER 4: SYSTEM DESIGN AND ARCHITECTURE", "15"),
        ("  4.1 System Architecture", "15"),
        ("  4.2 Overall System Workflow", "16"),
        ("  4.3 Module Description", "16"),
        ("  4.4 Architectural Diagrams (Class, Use Case, Sequence, DFD, ER)", "17"),
        ("  4.5 Security Architecture", "20"),
        ("CHAPTER 5: COMPLETE PROJECT IMPLEMENTATION", "22"),
        ("  5.1 Implementation Overview", "22"),
        ("  5.2 Project Folder Structure", "22"),
        ("  5.3 Development Environment Setup", "23"),
        ("  5.4 Frontend Implementation", "23"),
        ("  5.5 Backend Implementation", "24"),
        ("  5.6 Database Implementation", "24"),
        ("  5.7 Module-wise Implementation", "25"),
        ("  5.8 Machine Learning Inference Pipeline", "25"),
        ("  5.9 Authentication and Authorization (2FA OTP)", "26"),
        ("  5.10 Integration and Resilient Fallback", "27"),
        ("CHAPTER 6: INTEGRATION AND SYSTEM WORKFLOW", "28"),
        ("  6.1 Multi-Tier Microservice Integration", "28"),
        ("  6.2 Event-Driven Automation with n8n", "28"),
        ("  6.3 End-to-End System Workflow", "29"),
        ("CHAPTER 7: SOFTWARE TESTING AND VALIDATION", "30"),
        ("  7.1 Testing Philosophy and Methodologies", "30"),
        ("  7.2 Multi-Level Testing Implementation", "30"),
        ("  7.3 Security and AST Logic Freeze Verification", "31"),
        ("CHAPTER 8: TEST CASES AND RESULTS", "33"),
        ("  8.1 Test Case Design", "33"),
        ("  8.2 Comprehensive Test Suites and Verification", "33"),
        ("  8.3 Automated Test Execution Analysis", "36"),
        ("CHAPTER 9: RESULTS AND DISCUSSION", "37"),
        ("  9.1 Empirical Machine Learning Results", "37"),
        ("  9.2 Confusion Matrix and SHAP Attribution", "37"),
        ("  9.3 System Benchmarks and Comparative Evaluation", "39"),
        ("CHAPTER 10: PROJECT DEMONSTRATION AND SCREENSHOTS", "40"),
        ("  10.1 Application Launch and Orchestration", "40"),
        ("  10.2 Institutional User Journeys", "40"),
        ("  10.3 Input-Output Inference Demonstration", "41"),
        ("  10.4 Visual Interface Artifacts", "42"),
        ("CHAPTER 11: CONCLUSION AND FUTURE ENHANCEMENTS", "44"),
        ("  11.1 Conclusion", "44"),
        ("  11.2 Key Project Contributions", "44"),
        ("  11.3 Future Enhancements and Roadmap", "45"),
        ("REFERENCES", "46"),
        ("APPENDIX", "48")
    ]

    toc_tbl = doc.add_table(rows=1, cols=3)
    toc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_tbl.rows[0].cells[0].paragraphs[0].text = "TOPIC"
    toc_tbl.rows[0].cells[1].paragraphs[0].text = "TITLE"
    toc_tbl.rows[0].cells[2].paragraphs[0].text = "PAGE NO."

    for item, page in toc_data:
        row = toc_tbl.add_row()
        parts = item.split(":", 1) if ":" in item else (item, "")
        topic_col = parts[0].strip() if len(parts) > 1 else ""
        title_col = parts[1].strip() if len(parts) > 1 else parts[0].strip()
        row.cells[0].paragraphs[0].text = topic_col
        row.cells[1].paragraphs[0].text = title_col
        row.cells[2].paragraphs[0].text = page
        row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    style_prelim_table(toc_tbl, [Inches(1.2), Inches(4.3), Inches(0.8)])

    doc.add_page_break()

    # =========================================================================
    # 7. LIST OF FIGURES & LIST OF TABLES (Page 8-9)
    # =========================================================================
    p_lof_h = doc.add_paragraph()
    p_lof_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lof_h.paragraph_format.space_before = Pt(18)
    p_lof_h.paragraph_format.space_after = Pt(12)
    r = p_lof_h.add_run("LIST OF FIGURES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    figures_data = [
        ("Figure 4.1", "Tiered Microservice Architecture of the Retention Ecosystem", "15"),
        ("Figure 4.2", "End-to-End System Workflow for Prediction and Intervention", "16"),
        ("Figure 4.3", "Domain Class Diagram for Institutional ERP Entities", "18"),
        ("Figure 4.4", "Comprehensive System Use Case Diagram across User Roles", "18"),
        ("Figure 4.5", "Sequence Diagram for Two-Factor OTP Login Authentication", "19"),
        ("Figure 4.6", "Data Flow Diagram (Level 0 - Context Level Diagram)", "19"),
        ("Figure 4.7", "Data Flow Diagram (Level 1 - Core Subsystems)", "19"),
        ("Figure 4.8", "Entity Relationship Diagram for Database Persistence", "20"),
        ("Figure 4.9", "REST API Communication Flow and Service Key Handshake", "20"),
        ("Figure 10.1", "Baymate AI Platform Homepage & Student Predictive Intervention Portal", "52"),
        ("Figure 10.2", "InsightERP Multi-Role Institutional Authentication & Login Interface", "53"),
        ("Figure 10.3", "Student Academic Risk Self-Monitoring & Attendance Compliance Dashboard", "53"),
        ("Figure 10.4", "Faculty Mentor Cohort Analytics & Predictive Risk Prioritization Dashboard", "54"),
        ("Figure 10.5", "Institutional Administrative Overview & Multi-Campus Retention Dashboard", "54"),
        ("Figure 10.6", "Baymate AI Conversational Mentoring Assistant & Intervention Dialogue", "55"),
        ("Figure 10.7", "Mentee Meeting & Crisis Consultation Request Management Interface", "55")
    ]

    lof_tbl = doc.add_table(rows=1, cols=3)
    lof_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    lof_tbl.rows[0].cells[0].paragraphs[0].text = "FIGURE NO."
    lof_tbl.rows[0].cells[1].paragraphs[0].text = "TITLE"
    lof_tbl.rows[0].cells[2].paragraphs[0].text = "PAGE NO."

    for f_no, f_title, f_page in figures_data:
        row = lof_tbl.add_row()
        row.cells[0].paragraphs[0].text = f_no
        row.cells[1].paragraphs[0].text = f_title
        row.cells[2].paragraphs[0].text = f_page
        row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    style_prelim_table(lof_tbl, [Inches(1.5), Inches(4.0), Inches(0.8)])

    doc.add_page_break()

    # List of Tables
    p_lot_h = doc.add_paragraph()
    p_lot_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lot_h.paragraph_format.space_before = Pt(18)
    p_lot_h.paragraph_format.space_after = Pt(12)
    r = p_lot_h.add_run("LIST OF TABLES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    tables_data = [
        ("Table 2.1", "Comparative Analysis of Dropout Prediction Systems", "9"),
        ("Table 3.1", "Functional Requirements Specification by User Role", "10"),
        ("Table 3.2", "Non-Functional Requirements and System Quality Attributes", "11"),
        ("Table 3.3", "Hardware and Development Environment Specifications", "12"),
        ("Table 3.4", "Comprehensive Software Technology Stack Matrix", "12"),
        ("Table 3.5", "Detailed Tabular Use Case Specification", "13"),
        ("Table 4.1", "MongoDB Collection Schemas and Primary Index Keys", "17"),
        ("Table 5.1", "Annotated System Directory and Module Structure", "22"),
        ("Table 5.2", "Input Feature Vector Specification for XGBoost Predictor", "25"),
        ("Table 5.3", "Sanitized Environment Configuration Parameters", "26"),
        ("Table 8.1", "Authentication and Two-Factor Security Test Matrix", "33"),
        ("Table 8.2", "Student Management and Meeting Lifecycle Test Matrix", "34"),
        ("Table 8.3", "FastAPI Machine Learning Inference and Resilience Tests", "34"),
        ("Table 8.4", "Negative Testing and Boundary Value Analysis Matrix", "35"),
        ("Table 8.8", "Jest Automated Test Suite Execution Summary", "35"),
        ("Table 9.1", "Tuned XGBoost Evaluation Metrics on Held-out Test Set", "37"),
        ("Table 9.2", "Confusion Matrix Breakdown across Risk Classes", "37"),
        ("Table 9.3", "Top 12 Predictive Features by Normalized Gain Importance", "38"),
        ("Table 9.4", "Baseline Benchmark Algorithm Performance Comparison", "39")
    ]

    lot_tbl = doc.add_table(rows=1, cols=3)
    lot_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    lot_tbl.rows[0].cells[0].paragraphs[0].text = "TABLE NO."
    lot_tbl.rows[0].cells[1].paragraphs[0].text = "TITLE"
    lot_tbl.rows[0].cells[2].paragraphs[0].text = "PAGE NO."

    for t_no, t_title, t_page in tables_data:
        row = lot_tbl.add_row()
        row.cells[0].paragraphs[0].text = t_no
        row.cells[1].paragraphs[0].text = t_title
        row.cells[2].paragraphs[0].text = t_page
        row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    style_prelim_table(lot_tbl, [Inches(1.5), Inches(4.0), Inches(0.8)])

    doc.add_page_break()

    # List of Abbreviations
    p_abb_h = doc.add_paragraph()
    p_abb_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abb_h.paragraph_format.space_before = Pt(18)
    p_abb_h.paragraph_format.space_after = Pt(12)
    r = p_abb_h.add_run("LIST OF ABBREVIATIONS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    abbreviations = [
        ("AI", "Artificial Intelligence"),
        ("API", "Application Programming Interface"),
        ("AST", "Abstract Syntax Tree"),
        ("AUC", "Area Under the ROC Curve"),
        ("CGPA", "Cumulative Grade Point Average"),
        ("CIA", "Continuous Internal Assessment"),
        ("CORS", "Cross-Origin Resource Sharing"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("CSS", "Cascading Style Sheets"),
        ("CSV", "Comma-Separated Values"),
        ("DFD", "Data Flow Diagram"),
        ("EDM", "Educational Data Mining"),
        ("ERP", "Enterprise Resource Planning"),
        ("FSD", "Full Stack Development"),
        ("GPA", "Grade Point Average"),
        ("HMAC", "Hash-based Message Authentication Code"),
        ("HOD", "Head of the Department"),
        ("HTML", "HyperText Markup Language"),
        ("HTTP", "HyperText Transfer Protocol"),
        ("IEEE", "Institute of Electrical and Electronics Engineers"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("LMS", "Learning Management System"),
        ("MERN", "MongoDB, Express.js, React, Node.js"),
        ("ML", "Machine Learning"),
        ("OTP", "One-Time Password"),
        ("REST", "Representational State Transfer"),
        ("ROC", "Receiver Operating Characteristic"),
        ("SHA", "Secure Hash Algorithm"),
        ("SHAP", "SHapley Additive exPlanations"),
        ("SMS", "Short Message Service"),
        ("SMTP", "Simple Mail Transfer Protocol"),
        ("SQL", "Structured Query Language"),
        ("TTL", "Time-To-Live"),
        ("UI", "User Interface"),
        ("URL", "Uniform Resource Locator"),
        ("XGBoost", "Extreme Gradient Boosting")
    ]

    abb_tbl = doc.add_table(rows=1, cols=2)
    abb_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    abb_tbl.rows[0].cells[0].paragraphs[0].text = "ABBREVIATION"
    abb_tbl.rows[0].cells[1].paragraphs[0].text = "EXPANSION / MEANING"

    for abbr, meaning in abbreviations:
        row = abb_tbl.add_row()
        row.cells[0].paragraphs[0].text = abbr
        row.cells[1].paragraphs[0].text = meaning

    style_prelim_table(abb_tbl, [Inches(1.8), Inches(4.5)])
    # Notice: No page break at the end of preliminary pages!
    # generate_final_report.py adds sec_main with WD_SECTION_START.NEW_PAGE which creates the page break!
