"""
Rule-Based Dataset Generator for Student Academic Dropout Prediction & Intervention System
Generates:
1. data/faculty.csv (~180 faculty mentors across 3 colleges and 4 branches)
2. data/students.csv (~7,200 students across 4 years with realistic distributions)
3. data/marks.csv (subject-wise marks records for all completed semesters)

College Environments Simulated:
- C101: Easwari Engineering College (EEC, Ramapuram, Chennai) - Urban Autonomous College
- C102: Kongu Residential Institute of Technology (KRIT, Erode) - Fully Residential Campus
- C103: Meenakshi Institute of Science & Technology (MIST, Madurai) - Semi-Urban Tier-2 College

Branches Covered in Phase 1:
- CSE (~36%), IT (~30%), AIDS (~24%), ECE (~10%)
"""

import json
import math
import random
from pathlib import Path
import numpy as np
import pandas as pd

# Set deterministic random seed for reproducible research and viva demonstration
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

COLLEGES = [
    {
        "id": "C101",
        "code": "EEC",
        "name": "Easwari Engineering College",
        "location": "Ramapuram, Chennai",
        "type": "Urban",
        "target_students": 2600,
        "hostel_ratio": 0.32,
        "first_gen_ratio": 0.18,
        "cutoff_mean": 182.0,
        "cutoff_std": 9.5,
        "income_median": 550000,
        "income_sigma": 0.65,
        "day_commute_mean": 16.0,
        "day_commute_std": 7.0,
        "hostel_dist_mean": 180.0,
        "hostel_dist_std": 90.0,
    },
    {
        "id": "C102",
        "code": "KRIT",
        "name": "Kongu Residential Institute of Technology",
        "location": "Perundurai, Erode",
        "type": "Residential",
        "target_students": 2400,
        "hostel_ratio": 0.92,
        "first_gen_ratio": 0.42,
        "cutoff_mean": 169.0,
        "cutoff_std": 13.0,
        "income_median": 290000,
        "income_sigma": 0.55,
        "day_commute_mean": 14.0,
        "day_commute_std": 6.0,
        "hostel_dist_mean": 240.0,
        "hostel_dist_std": 110.0,
    },
    {
        "id": "C103",
        "code": "MIST",
        "name": "Meenakshi Institute of Science & Technology",
        "location": "Madurai",
        "type": "Semi-Urban",
        "target_students": 2200,
        "hostel_ratio": 0.50,
        "first_gen_ratio": 0.35,
        "cutoff_mean": 166.0,
        "cutoff_std": 14.5,
        "income_median": 320000,
        "income_sigma": 0.58,
        "day_commute_mean": 18.0,
        "day_commute_std": 8.0,
        "hostel_dist_mean": 160.0,
        "hostel_dist_std": 80.0,
        "pan_india": False,
    },
    {
        "id": "C104",
        "code": "SDU",
        "name": "Sankara Deemed University",
        "location": "Coimbatore",
        "type": "Deemed University (Pan-India Intake)",
        "target_students": 2000,
        "hostel_ratio": 0.88,  # mostly residential since students come from across India
        "first_gen_ratio": 0.22,
        "cutoff_mean": 178.0,  # admits via own entrance exam, not just TN cutoff, kept for data consistency
        "cutoff_std": 11.0,
        "income_median": 680000,  # deemed universities skew toward higher fee-paying households
        "income_sigma": 0.70,
        "day_commute_mean": 12.0,
        "day_commute_std": 5.0,
        "hostel_dist_mean": 650.0,  # most hostellers are from out-of-state, so distances are much larger
        "hostel_dist_std": 420.0,
        "pan_india": True,
    },
]

# All 13 branches in curriculum.json, weighted to reflect realistic Indian engineering
# admission demand: CS-adjacent branches (CSE/IT/AIDS/AIML/Cyber/CSD/CSBS) draw the highest
# cutoffs and fill fastest; ECE/EEE are strong mid-tier; core branches (Mech/Civil) are stable
# mid-tier; niche branches (Robotics/Automobile) are newer/smaller-intake programs.
BRANCHES = [
    "CSE", "IT", "AIDS", "AIML", "Cyber Security", "CSD", "CSBS",
    "ECE", "EEE", "Mechanical", "Civil", "Robotics", "Automobile"
]
BRANCH_WEIGHTS = [
    0.16, 0.12, 0.10, 0.09, 0.08, 0.06, 0.06,   # CS-adjacent tier (sum 0.67)
    0.10, 0.08,                                  # ECE, EEE (sum 0.18)
    0.07, 0.05,                                  # Mechanical, Civil (sum 0.12)
    0.02, 0.01                                   # Robotics, Automobile (sum 0.03)
]

SECTIONS = ["A", "B", "C"]
COMMUNITIES = ["OC", "BC", "MBC", "SC", "ST"]
COMMUNITY_WEIGHTS = [0.15, 0.46, 0.24, 0.12, 0.03]

# Home-state diversity: the 3 Tamil Nadu autonomous colleges draw mostly local students
# with a small out-of-state minority; the deemed university (pan_india=True) draws a
# genuinely mixed, pan-India student body.
TN_LOCAL_STATE_WEIGHTS = {
    "Tamil Nadu": 0.90, "Andhra Pradesh": 0.04, "Karnataka": 0.03, "Kerala": 0.03,
}
PAN_INDIA_STATE_WEIGHTS = {
    "Tamil Nadu": 0.14, "Andhra Pradesh": 0.09, "Telangana": 0.07, "Karnataka": 0.09,
    "Kerala": 0.06, "Maharashtra": 0.09, "West Bengal": 0.07, "Uttar Pradesh": 0.09,
    "Bihar": 0.07, "Delhi": 0.05, "Punjab": 0.04, "Gujarat": 0.04,
    "Rajasthan": 0.04, "Assam": 0.03, "Odisha": 0.03,
}

BOARD_OPTIONS_TN = ["State Board (Tamil Nadu)", "CBSE", "ICSE"]
BOARD_WEIGHTS_TN = [0.62, 0.32, 0.06]
BOARD_OPTIONS_OTHER_STATE = ["CBSE", "State Board (Respective State)", "ICSE"]
BOARD_WEIGHTS_OTHER_STATE = [0.55, 0.35, 0.10]

FACULTY_FIRST_NAMES = [
    "Kavitha", "Suresh", "Ramesh", "Priya", "Anand", "Venkatesh", "Deepa", "Santhosh",
    "Revathi", "Murugan", "Saravanan", "Malathi", "Vijay", "Geetha", "Sridhar", "Meena",
    "Karthik", "Bhuvaneswari", "Balaji", "Sudha", "Rajesh", "Uma", "Dinesh", "Nithya",
    "Gopinath", "Padmavathi", "Ganesh", "Subhashini", "Arun", "Senthamarai"
]

FACULTY_LAST_NAMES = [
    "Sundaram", "Natarajan", "Krishnan", "Ramasamy", "Subramanian", "Balasubramanian",
    "Venkataraman", "Chidambaram", "Swaminathan", "Gopalakrishnan", "Muthusamy", "Palanisamy",
    "Sengottaiyan", "Chandrasekaran", "Rajagopalan", "Kalyanasundaram", "Srinivasan"
]

STUDENT_MALE_NAMES = [
    "Aravind", "Karthik", "Santhosh", "Praveen", "Vignesh", "Hariharan", "Saravanan",
    "Dinesh", "Manikandan", "Siva", "Surya", "Gokul", "Ajith", "Vijay", "Manoj",
    "Naveen", "Deepak", "Akash", "Vishnu", "Rithvik", "Gautham", "Kishore", "Siddharth",
    "Raghavan", "Pradeep", "Subramani", "Vasanth", "Muthukumar", "Vimal", "Sathish"
]

STUDENT_FEMALE_NAMES = [
    "Abirami", "Deepika", "Kavya", "Keerthana", "Lavanya", "Pavithra", "Pooja", "Preethi",
    "Sandhya", "Shalini", "Sneha", "Soundarya", "Swetha", "Vaishnavi", "Varsha", "Vinodhini",
    "Harini", "Janani", "Madhumitha", "Nivetha", "Sowmya", "Divya", "Ananya", "Archana",
    "Monisha", "Akshaya", "Dharshini", "Gayathri", "Hemalatha", "Ranjitha"
]
STUDENT_TAMIL_LAST_NAMES = FACULTY_LAST_NAMES  # reuse Tamil surname pool defined above

# Region-matched name pools so a student's name reflects their generated home_state
# rather than every student getting a Tamil name regardless of background.
REGION_NAME_POOLS = {
    "Tamil Nadu": {
        "male": STUDENT_MALE_NAMES, "female": STUDENT_FEMALE_NAMES, "last": STUDENT_TAMIL_LAST_NAMES
    },
    "Andhra Pradesh": {
        "male": ["Venkat", "Sai Teja", "Charan", "Naveen", "Pavan", "Ravi Teja", "Siddharth", "Varun", "Vamsi", "Kiran"],
        "female": ["Sravani", "Lakshmi", "Manasa", "Spandana", "Haritha", "Nikitha", "Bhargavi", "Meghana", "Sindhu", "Rajitha"],
        "last": ["Reddy", "Naidu", "Chowdary", "Raju", "Prasad", "Varma", "Sastry"]
    },
    "Telangana": {
        "male": ["Shiva", "Akhil", "Rahul", "Sandeep", "Nikhil", "Mahesh", "Rohit", "Srikanth"],
        "female": ["Pravalika", "Divya Teja", "Shruthi", "Anusha", "Keerthi", "Swathi", "Rohini"],
        "last": ["Reddy", "Rao", "Goud", "Yadav", "Sharma"]
    },
    "Karnataka": {
        "male": ["Shreyas", "Chetan", "Darshan", "Mohan", "Nagaraj", "Prajwal", "Rakshit", "Vikram"],
        "female": ["Ananya", "Bhoomika", "Deeksha", "Lakshmi", "Pooja", "Shruthi", "Sahana", "Rakshita"],
        "last": ["Gowda", "Rao", "Shetty", "Hegde", "Nayak", "Kulkarni"]
    },
    "Kerala": {
        "male": ["Arjun", "Akhil", "Anoop", "Dev", "Jithin", "Midhun", "Sachin", "Vishnu"],
        "female": ["Anjali", "Athira", "Devika", "Gayathri", "Meera", "Nandana", "Sreelakshmi", "Varsha"],
        "last": ["Nair", "Menon", "Pillai", "Kurup", "Varma", "Thomas"]
    },
    "Maharashtra": {
        "male": ["Aditya", "Omkar", "Rohan", "Sarthak", "Shubham", "Yash", "Atharv", "Pranav"],
        "female": ["Aaradhya", "Sanika", "Shreya", "Siddhi", "Tanvi", "Vaishnavi", "Pallavi", "Mrunmayee"],
        "last": ["Deshmukh", "Joshi", "Kulkarni", "Patil", "Pawar", "Jadhav", "Bhosale"]
    },
    "West Bengal": {
        "male": ["Arka", "Debanjan", "Rohan", "Souvik", "Subho", "Abhijit", "Rajdeep", "Sayan"],
        "female": ["Ananya", "Debolina", "Ishita", "Pritha", "Riya", "Sreeja", "Trisha", "Paromita"],
        "last": ["Banerjee", "Chatterjee", "Mukherjee", "Das", "Ghosh", "Sengupta", "Bose"]
    },
    "Uttar Pradesh": {
        "male": ["Aarav", "Aditya", "Harsh", "Mohit", "Rohit", "Shubham", "Utkarsh", "Vivek"],
        "female": ["Anjali", "Isha", "Khushi", "Neha", "Priya", "Riya", "Shreya", "Vanshika"],
        "last": ["Sharma", "Verma", "Gupta", "Singh", "Yadav", "Mishra", "Tiwari"]
    },
    "Bihar": {
        "male": ["Abhishek", "Aman", "Gaurav", "Rahul", "Rohit", "Saurabh", "Vikash"],
        "female": ["Anshika", "Khushboo", "Nisha", "Priyanka", "Shweta", "Sneha", "Vandana"],
        "last": ["Kumar", "Singh", "Jha", "Thakur", "Pandey", "Mishra"]
    },
    "Delhi": {
        "male": ["Arjun", "Dhruv", "Karan", "Rishabh", "Sahil", "Vivaan", "Yuvraj"],
        "female": ["Diya", "Ishaan", "Kiara", "Myra", "Riya", "Simran", "Tanisha"],
        "last": ["Khanna", "Malhotra", "Chopra", "Sethi", "Mehta", "Bhatia"]
    },
    "Punjab": {
        "male": ["Gurmeet", "Harman", "Jaspreet", "Karanveer", "Manpreet", "Simranjeet"],
        "female": ["Amrit", "Gurleen", "Harleen", "Jasleen", "Navpreet", "Simran"],
        "last": ["Singh", "Kaur", "Gill", "Sandhu", "Brar", "Dhillon"]
    },
    "Gujarat": {
        "male": ["Dhruv", "Kashyap", "Meet", "Parth", "Vivek", "Yash"],
        "female": ["Aanya", "Bhoomi", "Dhara", "Jiya", "Kashvi", "Riya"],
        "last": ["Patel", "Shah", "Mehta", "Desai", "Joshi"]
    },
    "Rajasthan": {
        "male": ["Aryan", "Dev", "Kunal", "Rohit", "Sahil", "Vikram"],
        "female": ["Anushka", "Kavya", "Mahi", "Nisha", "Riya", "Sanjana"],
        "last": ["Sharma", "Rathore", "Chouhan", "Shekhawat", "Bhati"]
    },
    "Assam": {
        "male": ["Anurag", "Bikash", "Deepjyoti", "Himangshu", "Rajib", "Rituraj"],
        "female": ["Bornali", "Junmoni", "Nilakshi", "Pallabi", "Rimjhim", "Trishna"],
        "last": ["Borah", "Baruah", "Saikia", "Das", "Hazarika"]
    },
    "Odisha": {
        "male": ["Abhijit", "Amlan", "Biswajit", "Debasish", "Pratik", "Suryakant"],
        "female": ["Aparajita", "Jyotsna", "Manisha", "Pragyan", "Swagatika", "Trupti"],
        "last": ["Patra", "Mohanty", "Nayak", "Mishra", "Sahoo"]
    },
}


def pick_name_and_board(home_state, gender):
    """Picks a region-appropriate name and plausible education board based on home_state."""
    pool = REGION_NAME_POOLS.get(home_state, REGION_NAME_POOLS["Tamil Nadu"])
    first_pool = pool["male"] if gender == "Male" else pool["female"]
    first = random.choice(first_pool)
    last = random.choice(pool["last"])
    name = f"{first} {last}"

    if home_state == "Tamil Nadu":
        board = np.random.choice(BOARD_OPTIONS_TN, p=BOARD_WEIGHTS_TN)
    else:
        board = np.random.choice(BOARD_OPTIONS_OTHER_STATE, p=BOARD_WEIGHTS_OTHER_STATE)
    return name, board


def load_curriculum():
    """Loads static curriculum lookup generated in step 1."""
    curriculum_path = Path("data/curriculum.json")
    with open(curriculum_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def generate_faculty(colleges, branches):
    """
    Generates ~180 faculty mentors distributed across colleges and departments.
    Each faculty has an id, name, department, designation, experience, email.
    """
    faculty_records = []
    fac_counter = 1

    designations = [
        ("Assistant Professor", 0.60, (2, 8)),
        ("Associate Professor", 0.25, (9, 16)),
        ("Professor", 0.15, (17, 30))
    ]

    branch_weight_map = dict(zip(BRANCHES, BRANCH_WEIGHTS))

    for col in colleges:
        for branch in branches:
            # Faculty count scales with each branch's share of student demand (BRANCH_WEIGHTS),
            # so high-demand branches (CSE/IT/AIDS) get proportionally more mentors than
            # niche/low-intake branches (Robotics/Automobile), matching real staffing patterns.
            weight = branch_weight_map.get(branch, 1.0 / len(branches))
            base_count = max(4, round(weight * 140))  # ~140 faculty per college across all branches
            count = base_count + random.randint(-1, 2)

            for _ in range(count):
                fac_id = f"FAC_{col['code']}_{branch}_{fac_counter:03d}"
                fac_counter += 1

                first = random.choice(FACULTY_FIRST_NAMES)
                last = random.choice(FACULTY_LAST_NAMES)
                name = f"Dr. {first} {last}" if random.random() < 0.65 else f"Prof. {first} {last}"

                # Sample designation
                r = random.random()
                if r < 0.60:
                    desig, exp_range = designations[0][0], designations[0][2]
                elif r < 0.85:
                    desig, exp_range = designations[1][0], designations[1][2]
                else:
                    desig, exp_range = designations[2][0], designations[2][2]

                exp = random.randint(exp_range[0], exp_range[1])
                email = f"{first.lower()}.{last.lower()[:3]}@{col['code'].lower()}.edu.in"

                faculty_records.append({
                    "faculty_id": fac_id,
                    "name": name,
                    "department": branch,
                    "designation": desig,
                    "email": email,
                    "years_of_experience": exp,
                    "college_id": col["id"],
                    "assigned_students_count": 0  # will be incremented during mentor assignment
                })

    return pd.DataFrame(faculty_records)


def compute_marks_and_rollups(student_id, year_of_study, branch, ability, engagement, curriculum_lookup):
    """
    Generates subject-wise marks records for all completed semesters up to current semester.
    Returns:
    - marks_rows (list of dicts)
    - overall_gpa (float)
    - backlogs_count (int)
    - arrears_cleared (int)
    """
    current_sem = year_of_study * 2
    # Semesters completed so far: 1 through current_sem - 1
    # For current semester, we generate mid-term/CIA marks and final marks for current standing
    completed_sems = list(range(1, current_sem))
    all_sems = list(range(1, current_sem + 1))

    # Filter curriculum for student's branch and semesters
    branch_subjects = [c for c in curriculum_lookup if c["Branch"] == branch and c["Semester"] in all_sems]

    marks_rows = []
    total_credit_points = 0.0
    total_credits = 0.0
    active_backlogs = 0
    cleared_backlogs = 0

    for item in branch_subjects:
        sem = item["Semester"]
        subj = item["Subject"]
        stype = item["Subject_Type"]
        credits = item["Credits"]

        # Subject difficulty factor (standardized normal with slight negative shift for heavy math/theory)
        difficulty = 0.0
        subj_lower = subj.lower()
        if any(w in subj_lower for w in ["mathematics", "calculus", "automata", "algorithms", "compiler", "signals"]):
            difficulty = 0.35  # tougher subjects
        elif stype == "Laboratory":
            difficulty = -0.5  # labs have higher pass rates

        # Latent performance score driven by ability (60%), engagement (30%), difficulty (-), + noise (10%)
        # Standard score centered at ~65 with std ~15
        perf_latent = 68.0 + (ability * 11.0) + (engagement * 8.0) - (difficulty * 10.0) + np.random.normal(0, 6.0)

        # Clamp between 25 and 98
        perf_clamped = max(25.0, min(98.0, perf_latent))

        if stype == "Laboratory":
            # Labs: practical assessments (Assignments out of 10, CIAs out of 50, External out of 100)
            ass1 = round(min(10.0, max(5.0, (perf_clamped / 10.0) + np.random.normal(0, 0.4))), 1)
            ass2 = round(min(10.0, max(5.0, (perf_clamped / 10.0) + np.random.normal(0, 0.4))), 1)
            cia1 = round(min(50.0, max(25.0, (perf_clamped / 2.0) + np.random.normal(0, 1.5))), 1)
            cia2 = round(min(50.0, max(25.0, (perf_clamped / 2.0) + np.random.normal(0, 1.5))), 1)
            ext = round(min(100.0, max(45.0, perf_clamped + np.random.normal(2, 4.0))), 1)
        elif stype == "Internship":
            # Internship is pass/fail or graded out of 100
            ass1, ass2, cia1, cia2 = 10.0, 10.0, 48.0, 48.0
            ext = round(min(100.0, max(50.0, 75.0 + ability * 5 + np.random.normal(0, 5))), 1)
        else:
            # Theory & Project: standard CIA + External
            # Assignment 1 & 2 (out of 10)
            ass1 = round(min(10.0, max(2.0, (perf_clamped / 10.0) + np.random.normal(0, 0.7))), 1)
            ass2 = round(min(10.0, max(2.0, (perf_clamped / 10.0) + np.random.normal(0, 0.7))), 1)

            # CIA 1 & CIA 2 (Internal exams out of 50)
            cia1 = round(min(50.0, max(10.0, (perf_clamped / 2.0) + np.random.normal(0, 3.0))), 1)
            cia2 = round(min(50.0, max(10.0, (perf_clamped / 2.0) + np.random.normal(0, 3.0))), 1)

            # External Exam (out of 100)
            ext = round(min(100.0, max(20.0, perf_clamped + np.random.normal(0, 5.5))), 1)

        # Internal marks calculation:
        # CIA average out of 50 converted to out of 80% weight of internal, Assignment out of 20% weight of internal
        # Internal (out of 100) = ((cia1 + cia2) / 100 * 80) + ((ass1 + ass2) / 20 * 20)
        internal_100 = ((cia1 + cia2) * 0.8) + (ass1 + ass2)
        internal_100 = min(100.0, max(10.0, internal_100))

        # Defined weightage formula: 20% Internal CIA + 80% External End-Semester
        total_marks = round((0.20 * internal_100) + (0.80 * ext), 1)

        # Anna University Passing Rule:
        # Total >= 50 and External Exam >= 45 out of 100
        if total_marks >= 50.0 and ext >= 45.0:
            result = "Pass"
            # Grade Point Scale
            if total_marks >= 90.0:
                grade_point = 10
            elif total_marks >= 80.0:
                grade_point = 9
            elif total_marks >= 70.0:
                grade_point = 8
            elif total_marks >= 60.0:
                grade_point = 7
            else:
                grade_point = 6
        else:
            result = "Arrear"
            grade_point = 0

        # Backlog clearing simulation for older semesters (Year 2-4):
        # A student with an arrear in Sem 1 might have cleared it in Sem 2 or 3
        is_cleared = False
        if result == "Arrear" and sem < current_sem - 1:
            # If student has decent ability or made effort, they clear backlogs in subsequent sems
            clearing_chance = 0.55 + (ability * 0.15) + (engagement * 0.10)
            if random.random() < clearing_chance:
                is_cleared = True
                cleared_backlogs += 1

        if result == "Arrear" and not is_cleared:
            active_backlogs += 1

        # Tally credits and GPA (for completed semesters)
        if sem in completed_sems:
            total_credits += credits
            total_credit_points += (grade_point * credits)

        marks_rows.append({
            "student_id": student_id,
            "semester": sem,
            "subject_name": subj,
            "subject_type": stype,
            "credits": credits,
            "assignment_1_marks": ass1,
            "assignment_2_marks": ass2,
            "internal_exam_1_marks": cia1,
            "internal_exam_2_marks": cia2,
            "external_exam_marks": ext,
            "total_marks": total_marks,
            "grade_point": grade_point,
            "result": result
        })

    # Overall GPA calculation
    if total_credits > 0:
        overall_gpa = round(total_credit_points / total_credits, 2)
    else:
        # 1st semester ongoing
        overall_gpa = round(max(3.0, min(9.8, 6.5 + ability * 1.2)), 2)

    return marks_rows, overall_gpa, active_backlogs, cleared_backlogs


def generate_monthly_attendance_trend(base_attendance, is_at_risk):
    """
    Generates realistic 6-month monthly attendance percentages.
    At-risk students show a distinct decaying/dropping pattern.
    """
    trend = []
    curr = base_attendance

    if is_at_risk:
        # Drops noticeably across 6 months (e.g., from 82% down to 65%)
        drop_per_month = random.uniform(1.5, 3.5)
        for i in range(6):
            # months 0 to 5: starting higher, trending down
            month_val = max(45.0, min(98.0, curr + ((2.5 - i) * drop_per_month) + np.random.normal(0, 1.2)))
            trend.append(round(month_val, 1))
    else:
        # Stable with natural monthly fluctuation (+- 3%)
        for _ in range(6):
            month_val = max(68.0, min(99.0, curr + np.random.normal(0, 2.0)))
            trend.append(round(month_val, 1))

    return trend


def generate_dataset():
    """
    Main simulation pipeline generating:
    - faculty.csv (~180 faculty)
    - students.csv (~7,200 students across 3 colleges)
    - marks.csv (subject-wise marks)
    """
    curriculum = load_curriculum()
    faculty_df = generate_faculty(COLLEGES, BRANCHES)

    students_list = []
    all_marks_rows = []

    # Pre-index faculty by (college_id, department)
    faculty_map = {}
    for _, fac in faculty_df.iterrows():
        key = (fac["college_id"], fac["department"])
        faculty_map.setdefault(key, []).append(fac["faculty_id"])

    student_counter = 1

    for col in COLLEGES:
        target_count = col["target_students"]
        # Distribute students across branches according to weights
        branch_counts = np.random.multinomial(target_count, BRANCH_WEIGHTS)

        for branch, b_count in zip(BRANCHES, branch_counts):
            # Distribute roughly evenly across 4 years (Years 1 to 4)
            year_distribution = [b_count // 4] * 4
            for i in range(b_count % 4):
                year_distribution[i] += 1

            for year_idx, year_count in enumerate(year_distribution):
                year_of_study = year_idx + 1

                for s_i in range(year_count):
                    s_id = f"STU_{col['code']}_{branch}_Y{year_of_study}_{student_counter:04d}"
                    student_counter += 1

                    section = SECTIONS[s_i % len(SECTIONS)]

                    # Latent student characteristics
                    ability = np.random.normal(0.0, 1.0)
                    engagement = np.random.normal(0.0, 1.0)

                    # Demographics & Living Environment
                    gender = "Male" if random.random() < 0.52 else "Female"

                    # Home state: pan-India mix for the deemed university, mostly-local for
                    # the 3 Tamil Nadu autonomous colleges (with a small out-of-state minority)
                    state_weights = PAN_INDIA_STATE_WEIGHTS if col.get("pan_india") else TN_LOCAL_STATE_WEIGHTS
                    home_state = np.random.choice(list(state_weights.keys()), p=list(state_weights.values()))
                    st_name, board_of_education = pick_name_and_board(home_state, gender)

                    community = np.random.choice(COMMUNITIES, p=COMMUNITY_WEIGHTS)
                    is_hosteller = 1 if random.random() < col["hostel_ratio"] else 0
                    is_first_gen = 1 if random.random() < col["first_gen_ratio"] else 0

                    if is_hosteller == 1:
                        dist_km = max(35.0, round(np.random.normal(col["hostel_dist_mean"], col["hostel_dist_std"]), 1))
                    else:
                        dist_km = max(2.0, round(np.random.normal(col["day_commute_mean"], col["day_commute_std"]), 1))

                    # Annual Family Income (Log-normal distribution)
                    log_median = math.log(col["income_median"])
                    income = math.exp(np.random.normal(log_median, col["income_sigma"]))
                    income = round(max(80000, min(3500000, income)), -3)

                    # Admission & Cutoff
                    # Deemed universities admit via their own entrance exam / all-India merit list
                    # rather than the TN state counselling Government/Management quota system.
                    if col.get("pan_india"):
                        quota = np.random.choice(
                            ["All India Merit", "Management", "NRI"], p=[0.55, 0.35, 0.10]
                        )
                    else:
                        is_govt_quota = 1 if random.random() < 0.68 else 0
                        quota = "Government" if is_govt_quota else "Management"

                    cutoff = np.random.normal(col["cutoff_mean"], col["cutoff_std"])
                    if quota in ("Management", "NRI"):
                        cutoff -= np.random.uniform(5.0, 15.0)
                    cutoff = round(max(110.0, min(199.5, cutoff)), 2)

                    # Generate Subject Marks and Rollups
                    marks_rows, gpa, backlogs, cleared = compute_marks_and_rollups(
                        student_id=s_id,
                        year_of_study=year_of_study,
                        branch=branch,
                        ability=ability,
                        engagement=engagement,
                        curriculum_lookup=curriculum
                    )
                    all_marks_rows.extend(marks_rows)

                    # Attendance Calculation:
                    # Base attendance is driven by engagement + slight commute penalty for long day commutes
                    commute_penalty = 0.0
                    if is_hosteller == 0 and dist_km > 25:
                        commute_penalty = (dist_km - 25) * 0.15

                    base_attendance = 82.0 + (engagement * 7.0) + (ability * 2.0) - commute_penalty + np.random.normal(0, 3.5)
                    attendance_pct = round(max(40.0, min(99.0, base_attendance)), 1)
                    low_attendance_flag = 1 if attendance_pct < 75.0 else 0

                    # Engagement signals
                    mentor_meetings = max(0, min(6, int(round(3 + engagement + np.random.normal(0, 0.8)))))
                    scholarship = 1 if (is_first_gen or income < 250000 or community in ["SC", "ST"] or cutoff > 192) and random.random() < 0.75 else 0
                    extracurricular = round(max(10.0, min(95.0, 55.0 + engagement * 15.0 + np.random.normal(0, 10.0))), 1)
                    library_usage = round(max(5.0, min(95.0, 50.0 + engagement * 18.0 + ability * 6.0 + np.random.normal(0, 8.0))), 1)

                    # Placement scores for 3rd and 4th years
                    if year_of_study >= 3:
                        placement_score = round(max(15.0, min(98.0, 58.0 + ability * 14.0 + engagement * 8.0 + np.random.normal(0, 6.0))), 1)
                        internship_done = 1 if (year_of_study == 4 or random.random() < 0.45) and ability > -0.5 else 0
                    else:
                        placement_score = 0.0
                        internship_done = 0

                    # Weighted Risk Formula Calculation
                    # 1. Backlogs factor (0 to 1)
                    backlog_norm = min(1.0, backlogs / 4.0)
                    # 2. GPA factor (0 to 1)
                    gpa_factor = max(0.0, (10.0 - gpa) / 6.0)
                    # 3. Attendance factor (0 to 1)
                    att_factor = max(0.0, (100.0 - attendance_pct) / 45.0)
                    # 4. Financial stress
                    fin_stress = 1.0 if income < 180000 and not scholarship else 0.0
                    # 5. Low engagement
                    eng_stress = 1.0 if mentor_meetings <= 1 and library_usage < 35 else 0.0

                    # Composite risk score
                    raw_risk = (
                        0.38 * backlog_norm +
                        0.28 * gpa_factor +
                        0.20 * att_factor +
                        0.07 * fin_stress +
                        0.07 * eng_stress +
                        np.random.normal(0, 0.04)
                    )

                    # Generate attendance trend reflecting risk status
                    is_high_risk = raw_risk >= 0.855
                    att_trend = generate_monthly_attendance_trend(attendance_pct, is_high_risk)

                    # Calibrated thresholds to match real Indian autonomous-college data
                    # (Nagpur region study: ~6.67% first-year dropout; target ~8% High, ~18% Medium+High combined)
                    if raw_risk >= 0.855:
                        risk_label = "High"
                    elif raw_risk >= 0.715:
                        risk_label = "Medium"
                    else:
                        risk_label = "Low"

                    # Mentor assignment (assign to faculty in same college & department)
                    fac_options = faculty_map.get((col["id"], branch), [])
                    assigned_mentor = random.choice(fac_options) if fac_options else "FAC_ADMIN_001"

                    students_list.append({
                        "student_id": s_id,
                        "student_name": st_name,
                        "college_id": col["id"],
                        "college_name": col["name"],
                        "department": branch,
                        "year_of_study": year_of_study,
                        "current_semester": year_of_study * 2,
                        "section": section,
                        "gender": gender,
                        "home_state": home_state,
                        "board_of_education": board_of_education,
                        "community": community,
                        "first_gen_learner": is_first_gen,
                        "family_income_annual": int(income),
                        "hosteller": is_hosteller,
                        "distance_from_home_km": dist_km,
                        "admission_quota": quota,
                        "cutoff_mark_200": cutoff,
                        "attendance_pct": attendance_pct,
                        "monthly_attendance_trend": json.dumps(att_trend),
                        "mentor_meetings_attended": mentor_meetings,
                        "scholarship": scholarship,
                        "extracurricular_score": extracurricular,
                        "library_usage_score": library_usage,
                        "placement_training_score": placement_score,
                        "internship_done": internship_done,
                        "overall_gpa": gpa,
                        "backlogs_count": backlogs,
                        "arrears_cleared": cleared,
                        "low_attendance_flag": low_attendance_flag,
                        "dropout_risk_score": round(float(raw_risk), 3),
                        "dropout_risk_label": risk_label,
                        "mentor_id": assigned_mentor
                    })

    students_df = pd.DataFrame(students_list)
    marks_df = pd.DataFrame(all_marks_rows)

    # Update assigned student counts on faculty dataset
    mentor_counts = students_df["mentor_id"].value_counts().to_dict()
    faculty_df["assigned_students_count"] = faculty_df["faculty_id"].map(lambda fid: mentor_counts.get(fid, 0))

    # Save to /data/
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)

    faculty_df.to_csv(data_dir / "faculty.csv", index=False)
    students_df.to_csv(data_dir / "students.csv", index=False)
    marks_df.to_csv(data_dir / "marks.csv", index=False)

    print("=== DATA GENERATION COMPLETE ===")
    print(f"Total Faculty: {len(faculty_df)}")
    print(f"Total Students: {len(students_df)}")
    print(f"Total Marks Records: {len(marks_df)}")
    print("\n--- College Breakdown ---")
    print(students_df.groupby(["college_id", "college_name"]).size())
    print("\n--- Department Breakdown ---")
    print(students_df["department"].value_counts(normalize=True) * 100)
    print("\n--- Dropout Risk Label Distribution (Class Balance) ---")
    risk_counts = students_df["dropout_risk_label"].value_counts()
    risk_pct = students_df["dropout_risk_label"].value_counts(normalize=True) * 100
    for label in ["Low", "Medium", "High"]:
        print(f"{label}: {risk_counts.get(label, 0)} ({risk_pct.get(label, 0):.2f}%)")

    print("\n--- Low Attendance Flag Count ---")
    print(students_df["low_attendance_flag"].value_counts())

    print("\n--- Mentor Assignment Stats ---")
    print(f"Min mentees per mentor: {faculty_df['assigned_students_count'].min()}")
    print(f"Max mentees per mentor: {faculty_df['assigned_students_count'].max()}")
    print(f"Mean mentees per mentor: {faculty_df['assigned_students_count'].mean():.1f}")


if __name__ == "__main__":
    generate_dataset()
