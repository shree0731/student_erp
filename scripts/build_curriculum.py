"""
Curriculum Builder Script
Generates data/curriculum.json covering all 14 engineering branches:
CSE, EEE, ECE, Civil, Mechanical, IT, AIDS, CSBS, Cyber Security, AIML, Automobile, Robotics, CSD.

Rules:
- Schema: Subject, Subject_Type (Theory / Laboratory / Project / Internship), Credits, Semester, Branch
- Credit Rules:
  - 1st-year foundational (Math, Physics, Chemistry): 4 credits
  - Other Theory: 3 credits
  - Laboratory: 2 credits
  - Mini Project: 2 credits
  - Project Work Phase I: 6 credits
  - Project Work Phase II / Major Project: 10 credits
  - Internship: 2 credits
- Lab Rules:
  - CSE has explicit labs.
  - Other 13 branches auto-generate `<core theory subject> Laboratory` for Semesters 1 to 6.
"""

import json
from pathlib import Path

# Raw curriculum tables as specified in requirement
RAW_CURRICULUM = {
    "CSE": {
        1: [
            "Communicative English", "Matrices and Calculus", "Engineering Physics",
            "Engineering Chemistry", "Problem Solving and Python Programming"
        ],
        2: [
            "Statistics and Numerical Methods", "Technical English", "Engineering Physics II",
            "Engineering Graphics", "Basic Electrical and Electronics Engineering", "Data Structures"
        ],
        3: [
            "Probability and Statistics", "Computer Networks", "Design and Analysis of Algorithms",
            "Database Management Systems", "Operating Systems", "Java Programming", "Competitive Coding Skills"
        ],
        4: [
            "Discrete Mathematics", "Object Oriented Analysis and Design",
            "Microprocessors and Microcontrollers", "Data Mining and Warehousing",
            "Formal Languages and Automata Theory", "Graph Theory and Applications"
        ],
        5: [
            "Computer Architecture", "Software Engineering", "Web Technology",
            "Theory of Computation", "Artificial Intelligence", "Mini Project"
        ],
        6: [
            "Cryptography and System Security", "Compiler Design", "Machine Learning",
            "Cloud Computing", "Mobile Application Development", "Professional Elective I", "Professional Elective II"
        ],
        7: [
            "Big Data Analytics", "Distributed Systems", "Internet of Things",
            "Professional Ethics & Entrepreneurship", "Professional Elective III",
            "Professional Elective IV", "Open Elective", "Project Work Phase I", "Internship"
        ],
        8: [
            "Project Work Phase II"
        ]
    },
    "EEE": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Problem Solving with Python", "Basic Electrical Engineering", "Basic Electronics Engineering", "Professional English"],
        2: ["Engineering Mathematics II", "Circuit Theory", "Electrical Measurements and Instrumentation", "Electromagnetic Fields", "Digital Logic Circuits", "Electrical Machines I", "Electronic Devices", "Environmental Science"],
        3: ["Transforms and Partial Differential Equations", "Electrical Machines II", "Power Electronics", "Signals and Systems", "Control Systems", "Power System Analysis I", "Microprocessors and Microcontrollers"],
        4: ["Numerical Methods", "Power System Analysis II", "Power System Protection", "Analog and Digital Electronics", "Electrical Machine Design", "Industrial Instrumentation", "Embedded Systems"],
        5: ["Power System Operation and Control", "Renewable Energy Systems", "High Voltage Engineering", "Electric Drives", "Digital Signal Processing", "Power Electronics Applications"],
        6: ["Smart Grid Technologies", "Electrical Vehicle Technology", "Advanced Control Systems", "Power Quality", "Energy Management and Auditing", "IoT for Electrical Systems"],
        7: ["Electricity Market and Deregulation", "FACTS and HVDC Systems", "Industrial Automation", "Advanced Power Electronics", "Professional Elective I", "Professional Elective II"],
        8: ["Power System Planning", "Sustainable Energy Management", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "ECE": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Problem Solving with Python", "Basic Electrical Engineering", "Electronic Devices", "Professional English"],
        2: ["Engineering Mathematics II", "Circuit Analysis", "Digital Logic Design", "Signals and Systems", "Electronic Circuits I", "Network Theory", "Communication Fundamentals", "Environmental Science"],
        3: ["Transforms and Numerical Methods", "Electronic Circuits II", "Analog Communication", "Digital Electronics", "Electromagnetic Fields", "Microprocessors and Microcontrollers", "Probability and Random Processes"],
        4: ["Linear Integrated Circuits", "Digital Signal Processing", "Digital Communication", "Control Systems", "Antenna and Wave Propagation", "VLSI Design Fundamentals", "Embedded Systems"],
        5: ["Computer Communication Networks", "Wireless Communication", "Microwave Engineering", "Embedded System Design", "Analog and Mixed Signal Design", "Digital Image Processing"],
        6: ["Optical Communication", "Satellite Communication", "Internet of Things", "RF and Microwave Circuits", "Advanced VLSI Design", "Real-Time Operating Systems"],
        7: ["5G and Advanced Wireless Networks", "Software Defined Radio", "Embedded Linux", "Hardware Security", "Professional Elective I", "Professional Elective II"],
        8: ["Next Generation Communication Systems", "IoT System Integration", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "Civil": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Engineering Mechanics", "Basic Civil Engineering", "Problem Solving with Python", "Professional English"],
        2: ["Engineering Mathematics II", "Strength of Materials I", "Engineering Geology", "Surveying I", "Construction Materials", "Fluid Mechanics", "Environmental Science"],
        3: ["Transforms and Numerical Methods", "Strength of Materials II", "Surveying II", "Structural Analysis I", "Hydraulic Engineering", "Concrete Technology", "Building Technology"],
        4: ["Structural Analysis II", "Geotechnical Engineering I", "Transportation Engineering I", "Environmental Engineering I", "Hydrology", "Engineering Hydraulics", "Building Services"],
        5: ["Design of Reinforced Concrete Structures", "Geotechnical Engineering II", "Transportation Engineering II", "Environmental Engineering II", "Water Resources Engineering", "Estimation and Costing"],
        6: ["Steel Structural Design", "Foundation Engineering", "Advanced Concrete Structures", "Highway Engineering", "Wastewater Engineering", "Construction Management"],
        7: ["Earthquake Resistant Design", "Bridge Engineering", "Advanced Foundation Engineering", "Remote Sensing and GIS", "Sustainable Infrastructure", "Professional Elective"],
        8: ["Structural Health Monitoring", "Smart Cities and Infrastructure", "Disaster Management", "Professional Elective", "Major Project"]
    },
    "Mechanical": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Engineering Mechanics", "Basic Mechanical Engineering", "Problem Solving with Python", "Professional English"],
        2: ["Engineering Mathematics II", "Thermodynamics", "Strength of Materials", "Manufacturing Processes I", "Fluid Mechanics", "Material Science", "Environmental Science"],
        3: ["Transforms and Numerical Methods", "Engineering Materials", "Manufacturing Processes II", "Theory of Machines I", "Thermal Engineering I", "Fluid Machinery", "Metrology and Measurements"],
        4: ["Heat Transfer", "Theory of Machines II", "Thermal Engineering II", "Machine Design I", "Manufacturing Technology", "Industrial Engineering", "Computer Aided Design"],
        5: ["Machine Design II", "Automobile Engineering", "Refrigeration and Air Conditioning", "Finite Element Analysis", "Production Planning and Control", "Computer Integrated Manufacturing"],
        6: ["Advanced Manufacturing", "Robotics in Manufacturing", "Additive Manufacturing", "Renewable Energy Engineering", "Mechatronics", "Operations Research"],
        7: ["Industrial Automation", "Computational Fluid Dynamics", "Advanced Materials", "Product Design and Development", "Professional Elective I", "Professional Elective II"],
        8: ["Smart Manufacturing", "Digital Twin Technology", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "IT": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Fundamentals of Information Technology", "Professional English", "Digital Fundamentals"],
        2: ["Engineering Mathematics II", "Data Structures", "Object Oriented Programming", "Computer Organization", "Discrete Mathematics", "Database Fundamentals", "Web Programming Fundamentals"],
        3: ["Probability and Statistics", "Design and Analysis of Algorithms", "Operating Systems", "Computer Networks", "Database Management Systems", "Java Programming", "Software Engineering"],
        4: ["Theory of Computation", "Advanced Data Structures", "Web Technology", "Computer Architecture", "Distributed Computing", "Mobile Application Development", "Information Security"],
        5: ["Cloud Computing", "Data Warehousing", "Big Data Analytics", "Artificial Intelligence", "DevOps Engineering", "Advanced Web Development"],
        6: ["Machine Learning", "Internet of Things", "Blockchain Technology", "Natural Language Processing", "Cyber Security", "Microservices Architecture"],
        7: ["Edge Computing", "Cloud Native Application Development", "Full Stack Engineering", "Data Engineering", "Professional Elective I", "Professional Elective II"],
        8: ["Enterprise Application Architecture", "AI Application Engineering", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "AIDS": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Foundations of Artificial Intelligence", "Professional English", "Digital Fundamentals"],
        2: ["Engineering Mathematics II", "Programming with C", "Data Structures", "Discrete Mathematics", "Database Fundamentals", "Statistics for Data Science", "Object Oriented Programming"],
        3: ["Probability and Statistical Inference", "Design and Analysis of Algorithms", "Database Management Systems", "Operating Systems", "Computer Networks", "Exploratory Data Analysis", "Linear Algebra for AI"],
        4: ["Machine Learning Fundamentals", "Data Visualization", "Artificial Intelligence", "Data Mining", "Big Data Technologies", "Feature Engineering", "Natural Language Processing Fundamentals"],
        5: ["Deep Learning", "Computer Vision", "Natural Language Processing", "Time Series Analysis", "Cloud Computing for Data Science", "Recommender Systems"],
        6: ["Generative Artificial Intelligence", "Reinforcement Learning", "MLOps", "Advanced Data Mining", "Knowledge Representation", "Speech and Language Processing"],
        7: ["Large Language Models", "Responsible AI", "Advanced Computer Vision", "AI Product Engineering", "Professional Elective I", "Professional Elective II"],
        8: ["AI System Deployment", "Data Engineering Architecture", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "CSBS": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Programming Fundamentals", "Business Communication", "Digital Fundamentals"],
        2: ["Engineering Mathematics II", "Data Structures", "Object Oriented Programming", "Discrete Mathematics", "Computer Organization", "Database Fundamentals", "Business Economics"],
        3: ["Probability and Statistics", "Design and Analysis of Algorithms", "Operating Systems", "Computer Networks", "Database Management Systems", "Software Engineering", "Financial Accounting"],
        4: ["Web Technologies", "Enterprise Programming", "Data Analytics", "Business Intelligence", "Information Systems Management", "Computer Architecture", "Operations Research"],
        5: ["Cloud Computing", "Big Data Analytics", "Enterprise Resource Planning", "Business Process Management", "Artificial Intelligence for Business", "Software Project Management"],
        6: ["Machine Learning for Business", "Digital Marketing Analytics", "Supply Chain Analytics", "FinTech Technologies", "Business Data Visualization", "Enterprise Application Development"],
        7: ["Strategic Information Systems", "Business Process Automation", "Digital Transformation", "IT Governance", "Professional Elective I", "Professional Elective II"],
        8: ["Enterprise Architecture", "Business Analytics Capstone", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "Cyber Security": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Programming Fundamentals", "Cyber Security Fundamentals", "Professional English"],
        2: ["Engineering Mathematics II", "Data Structures", "Object Oriented Programming", "Computer Organization", "Discrete Mathematics", "Digital Logic", "Network Fundamentals"],
        3: ["Probability and Statistics", "Design and Analysis of Algorithms", "Operating Systems", "Database Management Systems", "Computer Networks", "Cryptography Fundamentals", "Linux Administration"],
        4: ["Web Application Security", "Network Security", "Ethical Hacking", "Digital Forensics", "Secure Software Engineering", "System Security", "Cyber Security Law and Ethics"],
        5: ["Malware Analysis", "Security Operations and SIEM", "Penetration Testing", "Cloud Security", "Wireless Security", "Applied Cryptography"],
        6: ["Incident Response", "Threat Intelligence", "Vulnerability Assessment", "Mobile Security", "IoT Security", "Security Information Analytics"],
        7: ["Digital Forensic Investigation", "Advanced Penetration Testing", "Cyber Threat Hunting", "Security Architecture", "Professional Elective I", "Professional Elective II"],
        8: ["Cyber Security Operations", "Cyber Risk Management", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "AIML": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Programming Fundamentals", "Artificial Intelligence Fundamentals", "Professional English"],
        2: ["Engineering Mathematics II", "Data Structures", "Object Oriented Programming", "Discrete Mathematics", "Computer Organization", "Database Fundamentals", "Statistics for AI"],
        3: ["Probability and Statistics", "Design and Analysis of Algorithms", "Operating Systems", "Computer Networks", "Database Management Systems", "Linear Algebra for Machine Learning", "AI Programming"],
        4: ["Machine Learning", "Artificial Intelligence", "Data Mining", "Computer Vision Fundamentals", "Natural Language Processing Fundamentals", "Feature Engineering", "Deep Learning Fundamentals"],
        5: ["Advanced Machine Learning", "Deep Neural Networks", "Reinforcement Learning", "Generative AI", "Speech Processing", "AI Optimization Techniques"],
        6: ["Large Language Models", "Advanced Computer Vision", "Advanced NLP", "MLOps", "Explainable AI", "AI System Design"],
        7: ["Multimodal AI", "AI Agents", "Responsible AI", "Edge AI", "Professional Elective I", "Professional Elective II"],
        8: ["AI Product Engineering", "AI Deployment and Operations", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "Automobile": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Engineering Mechanics", "Basic Automobile Engineering", "Problem Solving with Python", "Professional English"],
        2: ["Engineering Mathematics II", "Thermodynamics", "Strength of Materials", "Engineering Materials", "Fluid Mechanics", "Automotive Electrical Systems", "Manufacturing Processes"],
        3: ["Transforms and Numerical Methods", "Automotive Engines", "Theory of Machines", "Automotive Chassis", "Automotive Transmission Systems", "Vehicle Body Engineering", "Automotive Measurements"],
        4: ["Automotive Suspension Systems", "Automotive Steering Systems", "Automotive Braking Systems", "Automotive Electrical and Electronics", "Vehicle Dynamics", "Heat Transfer in Automobiles", "Automotive Fuels and Combustion"],
        5: ["Electric and Hybrid Vehicles", "Automotive Emission Control", "Vehicle Aerodynamics", "Automotive Engine Management", "Automotive Control Systems", "Automotive Manufacturing"],
        6: ["Advanced Vehicle Dynamics", "Battery Management Systems", "Autonomous Vehicle Technology", "Connected Vehicles", "Automotive Embedded Systems", "Vehicle Testing and Certification"],
        7: ["Automotive Safety Engineering", "Advanced Driver Assistance Systems", "Vehicle Diagnostics", "Alternative Fuel Vehicles", "Professional Elective I", "Professional Elective II"],
        8: ["Future Mobility Systems", "Automotive Product Development", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "Robotics": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Engineering Graphics", "Engineering Mechanics", "Programming Fundamentals", "Basic Electrical Engineering", "Professional English"],
        2: ["Engineering Mathematics II", "Engineering Mechanics II", "Electronic Devices", "Digital Logic", "Sensors and Transducers", "Manufacturing Processes", "Introduction to Robotics"],
        3: ["Transforms and Numerical Methods", "Control Systems", "Microprocessors and Microcontrollers", "Electrical Machines", "Kinematics of Robots", "Robot Sensors", "Pneumatic and Hydraulic Systems"],
        4: ["Robot Dynamics", "Industrial Robotics", "Embedded Systems", "Computer Aided Manufacturing", "Machine Vision", "Actuators and Drives", "Robot Programming"],
        5: ["Robotic Manipulators", "Autonomous Mobile Robots", "Industrial Automation", "PLC and SCADA", "Computer Vision for Robotics", "Mechatronic System Design"],
        6: ["Artificial Intelligence for Robotics", "Robot Operating System", "Human Robot Interaction", "Swarm Robotics", "Autonomous Navigation", "Advanced Motion Control"],
        7: ["Collaborative Robotics", "Industrial Robot Integration", "Robot Perception", "Digital Twin for Robotics", "Professional Elective I", "Professional Elective II"],
        8: ["Intelligent Autonomous Systems", "Robotics System Deployment", "Professional Elective III", "Professional Elective IV", "Major Project"]
    },
    "CSD": {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving with Python", "Engineering Graphics", "Programming Fundamentals", "Design Thinking", "Professional English"],
        2: ["Engineering Mathematics II", "Data Structures", "Object Oriented Programming", "Discrete Mathematics", "Computer Organization", "Digital Design", "Visual Communication"],
        3: ["Probability and Statistics", "Design and Analysis of Algorithms", "Operating Systems", "Database Management Systems", "Computer Networks", "Human Computer Interaction", "UI Design Fundamentals"],
        4: ["Web Design and Development", "Computer Graphics", "Interaction Design", "Software Engineering", "Mobile Application Design", "Information Architecture", "User Experience Research"],
        5: ["Game Programming", "3D Modelling and Visualization", "Animation Techniques", "Advanced UI Engineering", "Design Systems", "Creative Coding"],
        6: ["Augmented Reality", "Virtual Reality", "Extended Reality Design", "Interactive Media Development", "Generative Design", "Design Analytics"],
        7: ["Immersive Experience Design", "Design for Emerging Technologies", "Accessibility Engineering", "Digital Product Design", "Professional Elective I", "Professional Elective II"],
        8: ["Interactive System Engineering", "Design Innovation Project", "Professional Elective III", "Professional Elective IV", "Major Project"]
    }
}

# Explicit Labs for CSE as defined in specification
CSE_LABS = {
    1: ["Engineering Practices Laboratory"],
    2: ["Data Structures Laboratory"],
    3: ["DBMS Laboratory", "Operating Systems Laboratory"],
    4: ["Java Programming Laboratory"],
    5: ["Computer Networks Laboratory"],
    6: ["Web Technology Laboratory", "Machine Learning & Cloud Laboratory"],
    7: [],
    8: []
}


def determine_subject_type_and_credits(subject_name: str, semester: int, branch: str) -> tuple[str, int]:
    name_lower = subject_name.lower()

    if "internship" in name_lower:
        return "Internship", 2
    elif "mini project" in name_lower:
        return "Project", 2
    elif "phase i" in name_lower:
        return "Project", 6
    elif "phase ii" in name_lower or "major project" in name_lower or "capstone" in name_lower:
        return "Project", 10
    elif "laboratory" in name_lower or "lab" in name_lower:
        return "Laboratory", 2
    elif semester in [1, 2] and any(k in name_lower for k in ["mathematics", "calculus", "physics", "chemistry"]):
        # 1st-year foundational Math/Physics/Chemistry: 4 credits
        return "Theory", 4
    elif any(k in name_lower for k in ["probability", "discrete mathematics", "transforms", "numerical methods"]):
        # Higher-sem higher math courses in engineering are often 4 credits
        return "Theory", 4
    else:
        # Standard Core & Elective Theory: 3 credits
        return "Theory", 3


def build_curriculum():
    curriculum = []

    for branch, sem_map in RAW_CURRICULUM.items():
        for sem, subjects in sem_map.items():
            # Add Theory / Project subjects
            for subj in subjects:
                stype, credits = determine_subject_type_and_credits(subj, sem, branch)
                curriculum.append({
                    "Subject": subj.strip(),
                    "Subject_Type": stype,
                    "Credits": credits,
                    "Semester": sem,
                    "Branch": branch
                })

            # Add Labs per branch
            if branch == "CSE":
                for lab in CSE_LABS.get(sem, []):
                    curriculum.append({
                        "Subject": lab.strip(),
                        "Subject_Type": "Laboratory",
                        "Credits": 2,
                        "Semester": sem,
                        "Branch": branch
                    })
            else:
                # Rule: For other 13 branches, auto-generate one lab entry per semester for semesters 1-6
                # using "<core theory subject of that semester> Laboratory"
                if 1 <= sem <= 6 and len(subjects) > 1:
                    core_candidate = subjects[1] if sem == 1 else subjects[1]
                    base_name = core_candidate.replace(" Fundamentals", "").replace(" Principles", "").replace(" Theory", "")
                    lab_name = f"{base_name} Laboratory"
                    curriculum.append({
                        "Subject": lab_name.strip(),
                        "Subject_Type": "Laboratory",
                        "Credits": 2,
                        "Semester": sem,
                        "Branch": branch
                    })

    output_path = Path("data/curriculum.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(curriculum, f, indent=2)

    print(f"Generated {len(curriculum)} curriculum entries across {len(RAW_CURRICULUM)} branches.")
    return curriculum


if __name__ == "__main__":
    build_curriculum()
