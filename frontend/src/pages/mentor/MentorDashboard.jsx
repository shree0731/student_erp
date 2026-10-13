import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Award,
  ArrowRight,
  LayoutDashboard,
  BarChart3,
  FileText,
  PlusCircle,
  X,
  Send,
  MessageSquare,
  Bot,
  UserCheck,
  ChevronRight,
  BellRing,
  Mail
} from 'lucide-react';
import ParentAlertModal from '../../components/ParentAlertModal';

const INITIAL_INTERVENTIONS = [
  {
    id: 'INT-001',
    studentId: 'STU_EEC_CSE_Y4_0350',
    studentName: 'Vimal Rajagopalan',
    date: 'Yesterday, 3:30 PM',
    category: 'Attendance Shortage (<75%)',
    actionTaken: 'Parent Intimation SMS Sent & Remedial Clinic Assigned',
    status: 'In Progress',
    notes: 'Warned regarding Anna University 75% semester detention clause. Agreed to attend 12 hours of extra Saturday lab sessions.'
  },
  {
    id: 'INT-002',
    studentId: 'STU_EEC_CSE_Y4_0331',
    studentName: 'Prajwal Gowda',
    date: '3 Oct 2026',
    category: 'Arrear Clearing & CIA Exam Remedial',
    actionTaken: 'Peer Study Group Assigned with Final Year Topper',
    status: 'Scheduled Review',
    notes: '22 backlogs identified across mathematics and data structures. Split arrear clearance into 4 subjects per semester.'
  },
  {
    id: 'INT-003',
    studentId: 'STU_EEC_CSE_Y2_0135',
    studentName: 'Hemalatha Subramanian',
    date: '28 Sep 2026',
    category: 'CIA 1 Performance Review',
    actionTaken: 'Counseling Completed & Attendance Restored to 72%',
    status: 'Resolved',
    notes: 'Health issues cleared. Medical certificate submitted to Dean Office.'
  }
];

export default function MentorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Section Tab (overview, roster, analytics, interventions, ai)
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [mentees, setMentees] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Branches
  const [branches, setBranches] = useState([
    'CSE', 'IT', 'AIDS', 'AIML', 'Cyber Security', 'CSD', 'CSBS',
    'ECE', 'EEE', 'Mechanical', 'Civil'
  ]);

  // Filters for Roster
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('filter') === 'risk' ? 'Medium' : 'ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Interventions List
  const [interventions, setInterventions] = useState(() => {
    try {
      const saved = localStorage.getItem('mentor_interventions_log');
      return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
    } catch (e) {
      console.warn('Could not read mentor interventions log from localStorage:', e);
      return INITIAL_INTERVENTIONS;
    }
  });

  // Meeting & Crisis Requests List
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const fetchMeetingRequests = async () => {
    setLoadingMeetings(true);
    try {
      const res = await api.getMeetingRequests();
      if (res && res.data) {
        setMeetingRequests(res.data);
      }
    } catch (err) {
      console.warn('Could not load meeting requests:', err.message);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    fetchMeetingRequests();
  }, []);

  const handleUpdateMeetingStatus = async (requestId, newStatus) => {
    try {
      await api.updateMeetingRequestStatus(requestId, { status: newStatus });
      setMeetingRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating meeting request status:', err);
    }
  };

  // Modal to Log Counseling
  const [showLogModal, setShowLogModal] = useState(searchParams.get('action') === 'log');
  const [newLog, setNewLog] = useState({
    studentId: 'STU_EEC_CSE_Y4_0350',
    category: 'Attendance Shortage (<75%)',
    actionTaken: '',
    notes: '',
    status: 'In Progress'
  });

  // Parent Alert Modal State
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentStudent, setParentStudent] = useState(null);

  const handleParentAlertDispatched = (record) => {
    const updated = [record, ...interventions];
    setInterventions(updated);
    try {
      localStorage.setItem('mentor_interventions_log', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist mentor interventions log to localStorage:', e);
    }
  };

  // AI Copilot State
  const [aiChat, setAiChat] = useState([
    {
      sender: 'bot',
      text: 'Hello Dr. Kavitha! I am your Spike Retention Copilot. I analyze real-time attendance, CIA internal scores, and XGBoost risk vectors across your 16 CSE mentees. How can I assist you today?'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Load branches dynamically from API
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await api.getBranches();
        if (res && res.data && res.data.length > 0) {
          setBranches(res.data);
        }
      } catch (e) {
        console.warn('Could not load dynamic branches', e);
      }
    }
    fetchBranches();
  }, []);

  // Fetch mentor data
  const loadMentorData = async () => {
    setLoading(true);
    try {
      const mentorId = currentUser?.id || 'FAC_EEC_CSE_001';
      const branch = selectedBranch !== 'ALL' ? selectedBranch : undefined;
      const res = await api.getMentorMentees(mentorId, branch);
      if (res && res.data) {
        setMentees(res.data.mentees || []);
        setMentorInfo(res.data.mentor || null);
      }
    } catch (err) {
      console.error('Error fetching mentor mentees:', err);
      // Fallback sample data if backend is offline
      setMentees([
        { student_id: 'STU_EEC_CSE_Y4_0350', student_name: 'Vimal Rajagopalan', department: 'CSE', year_of_study: 4, dropout_risk_label: 'Medium', attendance_pct: 67.7, backlogs_count: 10, hosteller: 1 },
        { student_id: 'STU_EEC_CSE_Y4_0331', student_name: 'Prajwal Gowda', department: 'CSE', year_of_study: 4, dropout_risk_label: 'Medium', attendance_pct: 76.3, backlogs_count: 22, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y2_0135', student_name: 'Hemalatha Subramanian', department: 'CSE', year_of_study: 2, dropout_risk_label: 'Low', attendance_pct: 68.4, backlogs_count: 6, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y2_0119', student_name: 'Archana Palanisamy', department: 'CSE', year_of_study: 2, dropout_risk_label: 'Low', attendance_pct: 83.3, backlogs_count: 4, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y2_0156', student_name: 'Swetha Chandrasekaran', department: 'CSE', year_of_study: 2, dropout_risk_label: 'Low', attendance_pct: 79.9, backlogs_count: 6, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y3_0285', student_name: 'Keerthana Subramanian', department: 'CSE', year_of_study: 3, dropout_risk_label: 'Low', attendance_pct: 71.0, backlogs_count: 2, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y4_0315', student_name: 'Hemalatha Chandrasekaran', department: 'CSE', year_of_study: 4, dropout_risk_label: 'Low', attendance_pct: 83.0, backlogs_count: 3, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y1_0037', student_name: 'Sathish Chandrasekaran', department: 'CSE', year_of_study: 1, dropout_risk_label: 'Low', attendance_pct: 77.1, backlogs_count: 3, hosteller: 1 },
        { student_id: 'STU_EEC_CSE_Y1_0074', student_name: 'Preethi Balasubramanian', department: 'CSE', year_of_study: 1, dropout_risk_label: 'Low', attendance_pct: 79.2, backlogs_count: 1, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y3_0301', student_name: 'Karthik Krishnan', department: 'CSE', year_of_study: 3, dropout_risk_label: 'Low', attendance_pct: 89.7, backlogs_count: 1, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y1_0005', student_name: 'Ananya Sridhar', department: 'CSE', year_of_study: 1, dropout_risk_label: 'Low', attendance_pct: 92.4, backlogs_count: 0, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y2_0102', student_name: 'Dinesh Karthikeyan', department: 'CSE', year_of_study: 2, dropout_risk_label: 'Low', attendance_pct: 85.0, backlogs_count: 0, hosteller: 1 },
        { student_id: 'STU_EEC_CSE_Y3_0220', student_name: 'Harini Sundar', department: 'CSE', year_of_study: 3, dropout_risk_label: 'Low', attendance_pct: 88.1, backlogs_count: 0, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y3_0245', student_name: 'Manoj Kumar', department: 'CSE', year_of_study: 3, dropout_risk_label: 'Low', attendance_pct: 80.2, backlogs_count: 2, hosteller: 1 },
        { student_id: 'STU_EEC_CSE_Y4_0380', student_name: 'Sneha Narayanan', department: 'CSE', year_of_study: 4, dropout_risk_label: 'Low', attendance_pct: 86.5, backlogs_count: 1, hosteller: 0 },
        { student_id: 'STU_EEC_CSE_Y1_0088', student_name: 'Vijay Ragavan', department: 'CSE', year_of_study: 1, dropout_risk_label: 'Low', attendance_pct: 84.1, backlogs_count: 0, hosteller: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentorData();
  }, [currentUser?.id, selectedBranch]);

  // Handle URL params
  useEffect(() => {
    if (searchParams.get('action') === 'log') {
      setShowLogModal(true);
    }
    if (searchParams.get('filter') === 'risk') {
      setSelectedRisk('Medium');
    }
    if (searchParams.get('q')) {
      setSearchTerm(searchParams.get('q'));
    }
  }, [searchParams]);

  // Derived metrics
  const highRiskStudents = mentees.filter(s => s.dropout_risk_label === 'High');
  const mediumRiskStudents = mentees.filter(s => s.dropout_risk_label === 'Medium');
  const lowRiskStudents = mentees.filter(s => s.dropout_risk_label === 'Low');
  const atRiskCount = highRiskStudents.length + mediumRiskStudents.length;

  const lowAttendanceStudents = mentees.filter(s => s.attendance_pct < 75);

  const avgAttendance = mentees.length > 0
    ? (mentees.reduce((a, b) => a + (b.attendance_pct || 0), 0) / mentees.length).toFixed(1)
    : '81.4';

  const avgGpa = mentees.length > 0
    ? (mentees.reduce((a, b) => a + (b.overall_gpa || 0), 0) / mentees.length).toFixed(2)
    : '7.85';

  // Format Mentor Name cleanly (Fixing "Dr.!" bug)
  const getGreetingName = (fullName) => {
    if (!fullName) return 'Dr. Kavitha';
    const parts = fullName.split(' ');
    if (parts[0].toLowerCase().startsWith('dr')) {
      return parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0];
    }
    return parts[0];
  };

  const mentorName = mentorInfo ? mentorInfo.name : (currentUser?.name || 'Dr. Kavitha Ramanathan');
  const greetingName = getGreetingName(mentorName);

  const getStudentInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Filtered Mentees for Roster
  const filteredMentees = mentees.filter(s => {
    const matchesSearch =
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRisk = true;
    if (selectedRisk === 'High') matchesRisk = s.dropout_risk_label === 'High';
    else if (selectedRisk === 'Medium') matchesRisk = s.dropout_risk_label === 'Medium';
    else if (selectedRisk === 'Low') matchesRisk = s.dropout_risk_label === 'Low';
    else if (selectedRisk === 'ATTN_ALERT') matchesRisk = s.attendance_pct < 75;

    const matchesYear = selectedYear === 'ALL' || s.year_of_study === Number(selectedYear);
    return matchesSearch && matchesRisk && matchesYear;
  });

  // Save new intervention
  const handleSaveLog = (e) => {
    e.preventDefault();
    const student = mentees.find(m => m.student_id === newLog.studentId);
    const logEntry = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      studentId: newLog.studentId,
      studentName: student ? student.student_name : 'Assigned Mentee',
      date: 'Just now',
      category: newLog.category,
      actionTaken: newLog.actionTaken || 'Remedial action documented',
      status: newLog.status,
      notes: newLog.notes
    };
    const updated = [logEntry, ...interventions];
    setInterventions(updated);
    try {
      localStorage.setItem('mentor_interventions_log', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist mentor interventions log to localStorage:', e);
    }
    setShowLogModal(false);
    setActiveTab('interventions');
  };

  // AI Prompt Send
  const handleAiSend = (textToSend = null) => {
    const q = textToSend || aiInput;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setAiChat(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let botResponse = '';
      const qLower = q.toLowerCase();

      if (qLower.includes('75%') || qLower.includes('detention') || qLower.includes('attendance')) {
        botResponse = `Under Anna University statutory regulations, students with attendance strictly below 75% are ineligible to appear for end-semester examinations. In your cohort:\n• Vimal Rajagopalan (67.7%) - Critical deficit of 7.3%\n• Hemalatha Subramanian (68.4%) - Medical leave documentation pending\nRecommended Action: Dispatch official intimation notice to parents and schedule 12 compensatory lab hours before the semester audit cutoff.`;
      } else if (qLower.includes('vimal') || qLower.includes('0350')) {
        botResponse = `Risk Analysis for Vimal Rajagopalan (STU_EEC_CSE_Y4_0350):\n• Risk Level: Moderate (XGBoost score: 0.64)\n• Primary Vulnerabilities: 67.7% attendance and 10 active arrear backlogs.\n• Living Mode: Hosteller (Disengagement warning flagged during Month 3).\n• Suggested Action: Assign peer mentor from CSE Year 4 Toppers group and monitor weekly hostel attendance logs.`;
      } else if (qLower.includes('prajwal') || qLower.includes('backlog')) {
        botResponse = `Prajwal Gowda currently has 22 cumulative backlogs despite maintaining 76.3% attendance.\n• Recommendation: Enroll in Faculty Remedial Saturday Clinics specifically for Data Structures and Discrete Math. Set achievable target of clearing 5 arrears per semester.`;
      } else {
        botResponse = `Cohort Overview: Your 16 assigned CSE mentees currently have an 81.4% average attendance rate. 14 students (87.5%) are in the statutory safe zone. 2 students require immediate mentor attention for attendance & backlogs. You have logged ${interventions.length} counseling sessions to date.`;
      }

      setAiChat(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setAiLoading(false);
    }, 600);
  };

  return (
    <div className="page-body">

      {/* =====================================================================
          SECTION 1: EXECUTIVE OVERVIEW (Concise, high-impact summary)
          ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="fade-in">
          {/* Row 1: Welcome Hero Card + 3 Spike Wave Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* Hero Card */}
            <div className="welcome-hero-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="badge badge-light-primary">
                    <Sparkles size={13} />
                    <span>Academic Mentor Advisory</span>
                  </span>
                </div>

                {/* Fixed greeting name bug: "Welcome back, Dr. Kavitha!" */}
                <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
                  Welcome back, {greetingName}!
                </h1>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '0 0 1.25rem', lineHeight: '1.45' }}>
                  Easwari Engineering College &bull; CSE Cohort. You have <strong>{atRiskCount} mentees</strong> flagged for academic/attendance follow-up.
                </p>

                {/* 3 Status Item Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--dark)' }}>
                        {mentees.length} Assigned Mentees
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        All 4 engineering years monitored live
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--dark)' }}>
                        {lowAttendanceStudents.length} Students Below 75% Statutory Bar
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        Anna University semester detention risk
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--dark)' }}>
                        {avgAttendance}% Cohort Attendance Rate
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        +2.1% above consortium average
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons relevant to Faculty */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedRisk('Medium');
                      setActiveTab('roster');
                    }}
                    style={{ gap: '0.4rem' }}
                  >
                    <span>View {atRiskCount} Priority Mentees</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowLogModal(true)}
                    style={{ gap: '0.4rem' }}
                  >
                    <PlusCircle size={14} color="var(--primary)" />
                    <span>Log Counseling</span>
                  </button>
                </div>
              </div>

              {/* Right Illustration */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="170" height="170" viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" fill="#ecf2ff" />
                  <rect x="50" y="135" width="100" height="7" rx="3.5" fill="#cbd5e1" />
                  <rect x="58" y="90" width="84" height="48" rx="6" fill="#1e293b" />
                  <rect x="62" y="94" width="76" height="40" rx="3" fill="#3b82f6" />
                  <circle cx="100" cy="114" r="8" fill="#ffffff" opacity="0.8" />
                  <circle cx="100" cy="55" r="20" fill="#fed7aa" />
                  <path d="M80 52 C 80 36, 120 36, 120 52 C 120 42, 114 34, 100 34 C 86 34, 80 42, 80 52 Z" fill="#92400e" />
                  <rect x="87" y="51" width="11" height="8" rx="2" stroke="#475569" strokeWidth="2" fill="none" />
                  <rect x="102" y="51" width="11" height="8" rx="2" stroke="#475569" strokeWidth="2" fill="none" />
                  <line x1="98" y1="55" x2="102" y2="55" stroke="#475569" strokeWidth="2" />
                  <path d="M78 78 L 122 78 L 128 115 L 72 115 Z" fill="#2563eb" />
                  <path d="M96 78 L 104 78 L 102 102 L 100 108 L 98 102 Z" fill="#f87171" />
                  <path d="M142 125 C 142 95, 170 105, 170 125 Z" fill="#10b981" opacity="0.7" />
                </svg>
              </div>
            </div>

            {/* 3 Spike Wave Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              
              {/* Card 1: Royal Blue */}
              <div className="spike-stat-card" style={{ background: 'linear-gradient(135deg, #5d87ff, #4570ea)' }}>
                <div className="spike-stat-card-wave" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', color: '#5d87ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                    <Users size={17} />
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                    100% Monitored
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.1 }}>{mentees.length}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Assigned Mentees &bull; CSE Cohort</div>
                </div>
              </div>

              {/* Card 2: Cyan Teal */}
              <div className="spike-stat-card" style={{ background: 'linear-gradient(135deg, #49beff, #00acc1)' }}>
                <div className="spike-stat-card-wave" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', color: '#00acc1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                    <Calendar size={17} />
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                    {interventions.length} Logged
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.1 }}>{interventions.length} Sessions</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Faculty Mentoring Interventions</div>
                </div>
              </div>

              {/* Card 3: Deep Blue Warning */}
              <div className="spike-stat-card" style={{ background: 'linear-gradient(135deg, #1376f8, #0056b3)' }}>
                <div className="spike-stat-card-wave" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', color: '#1376f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                    <AlertTriangle size={17} />
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                    Action Due
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.1 }}>{lowAttendanceStudents.length} Students</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Below 75% Attendance Threshold</div>
                </div>
              </div>

            </div>

          </div>

          {/* Row 2: Priority Attention Cards (Only students who actually need attention!) */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BellRing size={18} color="var(--danger)" />
                  <span>Priority Action Required: Mentees Needing Attention</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                  Students flagged by the XGBoost early-warning model for low attendance or high backlogs
                </p>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('roster')}
                style={{ fontSize: '0.76rem', gap: '0.35rem' }}
              >
                <span>View Full Roster ({mentees.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 2 Focused Priority Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
              
              {/* Mentee 1: Vimal */}
              <div style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--danger-light)',
                borderRadius: '12px',
                padding: '1.1rem',
                borderLeft: '4px solid var(--danger)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--dark)', fontSize: '0.95rem' }}>Vimal Rajagopalan</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>STU_EEC_CSE_Y4_0350 &bull; CSE Year 4 (Hosteller)</div>
                  </div>
                  <span className="badge badge-light-warning">Medium Risk</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>Attendance</div>
                    <div style={{ fontWeight: '800', color: 'var(--danger)', fontSize: '0.92rem' }}>67.7% (&lt;75%)</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>Arrears</div>
                    <div style={{ fontWeight: '800', color: 'var(--dark)', fontSize: '0.92rem' }}>10 Courses</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--dark)', marginBottom: '0.85rem', background: 'var(--danger-light)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  ⚠️ <strong>AU 75% Rule Alert:</strong> 7.3% deficit from statutory semester exam eligibility.
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/mentor/student/STU_EEC_CSE_Y4_0350')}
                    style={{ flex: 1, fontSize: '0.76rem' }}
                  >
                    <span>Diagnostic Profile</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setNewLog(prev => ({ ...prev, studentId: 'STU_EEC_CSE_Y4_0350' }));
                      setShowLogModal(true);
                    }}
                    style={{ fontSize: '0.76rem' }}
                  >
                    Log Counseling
                  </button>
                </div>
              </div>

              {/* Mentee 2: Prajwal */}
              <div style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--warning-light)',
                borderRadius: '12px',
                padding: '1.1rem',
                borderLeft: '4px solid var(--warning)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--dark)', fontSize: '0.95rem' }}>Prajwal Gowda</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>STU_EEC_CSE_Y4_0331 &bull; CSE Year 4 (Day Scholar)</div>
                  </div>
                  <span className="badge badge-light-warning">Medium Risk</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>Attendance</div>
                    <div style={{ fontWeight: '800', color: 'var(--success)', fontSize: '0.92rem' }}>76.3% (Safe)</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>Arrears</div>
                    <div style={{ fontWeight: '800', color: 'var(--danger)', fontSize: '0.92rem' }}>22 Courses</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--dark)', marginBottom: '0.85rem', background: 'var(--warning-light)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  📌 <strong>Academic Alert:</strong> Severe backlog accumulation across 4 semesters.
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/mentor/student/STU_EEC_CSE_Y4_0331')}
                    style={{ flex: 1, fontSize: '0.76rem' }}
                  >
                    <span>Diagnostic Profile</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setNewLog(prev => ({ ...prev, studentId: 'STU_EEC_CSE_Y4_0331' }));
                      setShowLogModal(true);
                    }}
                    style={{ fontSize: '0.76rem' }}
                  >
                    Log Counseling
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Row 3: Cohort Statutory Compliance Summary Meter */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--dark)' }}>
                Anna University Statutory 75% Attendance Compliance
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                87.5% of your cohort ({mentees.length - lowAttendanceStudents.length} of {mentees.length} students) currently cleared for semester exams
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success)' }}>14</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Safe Zone (&gt;75%)</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--danger)' }}>2</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>At Risk (&lt;75%)</div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('analytics')}
                style={{ fontSize: '0.76rem' }}
              >
                <span>View Attendance Analytics</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          SECTION 2: MENTEE ROSTER & RISK TRIAGE (Dedicated Student Directory)
          ===================================================================== */}
      {activeTab === 'roster' && (
        <div className="fade-in">
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            
            {/* Table Header & Controls */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  Assigned Mentee Cohort ({mentees.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                  Filter by dropout risk level, academic year, and statutory attendance thresholds
                </p>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${selectedRisk === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedRisk('ALL')}
                >
                  All ({mentees.length})
                </button>
                <button
                  className={`btn btn-sm ${selectedRisk === 'Medium' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedRisk('Medium')}
                >
                  At Risk ({mediumRiskStudents.length})
                </button>
                <button
                  className={`btn btn-sm ${selectedRisk === 'ATTN_ALERT' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedRisk('ATTN_ALERT')}
                >
                  &lt;75% Attendance ({lowAttendanceStudents.length})
                </button>
                <button
                  className={`btn btn-sm ${selectedRisk === 'Low' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedRisk('Low')}
                >
                  Low Risk ({lowRiskStudents.length})
                </button>

                {/* Year Filter */}
                <select
                  className="select-control"
                  style={{ fontSize: '0.78rem', height: '32px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="ALL">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>

            {/* Search Toolbar */}
            <div style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={15} color="var(--muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter student by name or registration ID..."
                  className="input-control"
                  style={{ paddingLeft: '32px', width: '100%', fontSize: '0.82rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                Showing <strong>{filteredMentees.length}</strong> matching students
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="spike-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Risk Assessment</th>
                    <th>Attendance</th>
                    <th>Backlogs</th>
                    <th>Living Mode</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                        Loading assigned mentees...
                      </td>
                    </tr>
                  ) : filteredMentees.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                        No students match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMentees.map((s) => (
                      <tr key={s.student_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: s.dropout_risk_label === 'High' ? 'var(--danger-light)' : s.dropout_risk_label === 'Medium' ? 'var(--warning-light)' : 'var(--primary-light)',
                                color: s.dropout_risk_label === 'High' ? 'var(--danger)' : s.dropout_risk_label === 'Medium' ? 'var(--warning)' : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                flexShrink: 0
                              }}
                            >
                              {getStudentInitials(s.student_name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--dark)', fontSize: '0.88rem' }}>
                                {s.student_name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                                {s.student_id} &bull; {s.department} (Year {s.year_of_study})
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          {s.dropout_risk_label === 'High' ? (
                            <span className="badge badge-light-danger">
                              <AlertTriangle size={12} /> High Risk
                            </span>
                          ) : s.dropout_risk_label === 'Medium' ? (
                            <span className="badge badge-light-warning">
                              <Clock size={12} /> Medium
                            </span>
                          ) : (
                            <span className="badge badge-light-success">
                              <CheckCircle2 size={12} /> Low Risk
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ width: '110px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: s.attendance_pct < 75 ? 'var(--danger)' : 'var(--dark)' }}>
                              <span>{s.attendance_pct}%</span>
                              {s.attendance_pct < 75 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--danger)' }}>&lt;75%</span>
                              )}
                            </div>
                            <div className="progress-container" style={{ marginTop: '4px' }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(100, s.attendance_pct)}%`,
                                  background: s.attendance_pct < 75 ? 'var(--danger)' : 'var(--success)'
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: s.backlogs_count > 0 ? 800 : 500, color: s.backlogs_count > 0 ? 'var(--danger)' : 'var(--dark)' }}>
                            {s.backlogs_count} courses
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {s.hosteller === 1 ? 'Hosteller' : 'Day Scholar'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            {(s.attendance_pct < 75 || s.dropout_risk_label === 'High') && (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setParentStudent(s);
                                  setShowParentModal(true);
                                }}
                                style={{ gap: '0.25rem', fontSize: '0.74rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                                title="Send Official Parent / Guardian Alert Notice"
                              >
                                <Mail size={12} />
                                <span>Parent Alert</span>
                              </button>
                            )}
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/mentor/student/${s.student_id}`)}
                              style={{ gap: '0.3rem', fontSize: '0.76rem' }}
                            >
                              <span>Diagnostic</span>
                              <ArrowUpRight size={13} color="var(--primary)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-card-subtle)', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing all {filteredMentees.length} students</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="var(--primary)" />
                <span>Synchronized with Standalone XGBoost ML Microservice</span>
              </span>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 3: ACADEMIC & ATTENDANCE ANALYTICS (Charts & Trajectories)
          ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="fade-in">
          {/* 2 Main Visual Analytics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* Profit & Expenses Styled Grouped Bar Chart */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--dark)', margin: 0 }}>
                    Cohort Academic Health &amp; Attendance Trends
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                    6-Month longitudinal progression across internal tests and attendance
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.76rem', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'var(--primary)' }} />
                    <span>Attendance %</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'var(--danger)' }} />
                    <span>CIA Exam Scaled</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                
                {/* SVG Grouped Column Chart */}
                <div style={{ height: '210px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '25px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', height: '1px', background: 'var(--border)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'var(--border)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '80%', height: '1px', background: 'var(--border)' }} />

                  {[
                    { month: 'Month 1', att: 84, cia: 75 },
                    { month: 'Month 2', att: 82, cia: 78 },
                    { month: 'Month 3', att: 79, cia: 72 },
                    { month: 'Month 4', att: 81, cia: 80 },
                    { month: 'Month 5', att: 83, cia: 82 },
                    { month: 'Month 6', att: 81, cia: 79 },
                  ].map((bar, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px' }}>
                        <div
                          style={{
                            width: '14px',
                            height: `${(bar.att / 100) * 150}px`,
                            background: 'var(--primary)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.6s ease'
                          }}
                          title={`Attendance: ${bar.att}%`}
                        />
                        <div
                          style={{
                            width: '14px',
                            height: `${(bar.cia / 100) * 150}px`,
                            background: 'var(--danger)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.6s ease'
                          }}
                          title={`CIA Average: ${bar.cia}%`}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: '600' }}>{bar.month}</span>
                    </div>
                  ))}
                </div>

                {/* Right Legend Side Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.25rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)' }}>
                        {avgGpa} / 10
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                        Mean Cohort GPA
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)' }}>
                        {avgAttendance}%
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                        Cohort Attendance
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)' }}>
                        100%
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                        Safe Cohort Retention
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Attendance Compliance Spline Chart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--dark)', margin: 0 }}>
                    Attendance Compliance Trajectory
                  </h3>
                  <span className="badge badge-light-success">Anna Univ 75% Rule</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
                  Tracking compliance against semester detention threshold
                </p>
              </div>

              {/* SVG Smooth Sine/Spline Area Curve */}
              <div style={{ margin: '1rem 0' }}>
                <svg width="100%" height="110" viewBox="0 0 300 110" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5d87ff" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#5d87ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Statutory 75% dashed line */}
                  <line x1="0" y1="45" x2="300" y2="45" stroke="#fa896b" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="5" y="40" fill="#fa896b" fontSize="9" fontWeight="700">75% AU Statutory Threshold</text>

                  {/* Shaded Area */}
                  <path
                    d="M 0 65 Q 40 30, 80 50 T 160 40 T 240 25 T 300 30 L 300 110 L 0 110 Z"
                    fill="url(#splineGradient)"
                  />

                  {/* Line Curve */}
                  <path
                    d="M 0 65 Q 40 30, 80 50 T 160 40 T 240 25 T 300 30"
                    fill="none"
                    stroke="#5d87ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--dark)' }}>81.4% Overall Average</span>
                </div>
                <span className="badge badge-light-primary">+2.1% Safe Margin</span>
              </div>
            </div>

          </div>

          {/* Additional Analytics: Dropout Vulnerability Drivers */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.35rem' }}>
              XGBoost Early Warning Risk Factors (CSE Cohort)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Weightage of features driving dropout probability across semester assessments
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Semester Attendance Drop</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--danger)' }}>38.4% impact</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: '38.4%', background: 'var(--danger)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                  Primary catalyst for exam detention &amp; disconnection
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Backlog Count Accumulation</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--warning)' }}>28.6% impact</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: '28.6%', background: 'var(--warning)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                  High arrear load triggers academic fatigue
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>CIA Internal Test Performance</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--primary)' }}>21.2% impact</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: '21.2%', background: 'var(--primary)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                  Leading indicator for end-semester GPA
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 4: INTERVENTIONS & COUNSELING LOGS
          ===================================================================== */}
      {activeTab === 'interventions' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  Faculty Mentoring &amp; Intervention Records
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                  Official counseling audit trail, parental intimation records, and remedial clinic assignments
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowLogModal(true)}
                style={{ gap: '0.4rem' }}
              >
                <PlusCircle size={15} />
                <span>Log New Counseling Session</span>
              </button>
            </div>

            {/* Interventions Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="spike-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Mentee</th>
                    <th>Category</th>
                    <th>Action Taken</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {interventions.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--primary)' }}>
                          {item.id}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--dark)', fontSize: '0.86rem' }}>
                            {item.studentName}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>
                            {item.studentId}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-light-primary" style={{ fontSize: '0.74rem' }}>
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <div style={{ maxWidth: '320px' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--dark)', fontWeight: '600' }}>
                            {item.actionTaken}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '2px' }}>
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${item.status === 'Resolved' ? 'badge-light-success' : 'badge-light-warning'}`} style={{ fontSize: '0.74rem' }}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {item.date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 5: AI RETENTION COPILOT (Interactive Mentor Advisor)
          ===================================================================== */}
      {activeTab === 'ai' && (
        <div className="fade-in">
          <div className="card" style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '600px' }}>
            
            {/* Header */}
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  Spike Academic Retention Copilot
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
                  Informed by Anna University 75% Attendance Statutes &amp; live XGBoost inference
                </p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAiSend("Which students are in danger of semester detention due to <75% attendance?")}
                style={{ fontSize: '0.73rem' }}
              >
                🚨 AU 75% Detention Watch
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAiSend("Explain Vimal Rajagopalan's risk factors and recommended remedial plan")}
                style={{ fontSize: '0.73rem' }}
              >
                👤 Vimal Rajagopalan Case Diagnosis
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAiSend("Summarize the entire 16-student CSE cohort health")}
                style={{ fontSize: '0.73rem' }}
              >
                📊 Overall Cohort Summary
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {aiChat.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-body)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--dark)',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '12px',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-body)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Analyzing cohort data...
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ask anything about student attendance, arrear clearing, or intervention policies..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                className="input-control"
                style={{ flex: 1, fontSize: '0.84rem' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleAiSend()}
                disabled={aiLoading || !aiInput.trim()}
                style={{ padding: '0.55rem 1rem' }}
              >
                <Send size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 6: MEETING REQUESTS & ESCALATIONS
          ===================================================================== */}
      {activeTab === 'meetings' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  Student Meeting &amp; Crisis Requests
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.2rem 0 0' }}>
                  Requests dispatched via the AI Intervention Chatbot and Student Portal. Crisis escalations are flagged urgent.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-light-primary" style={{ fontSize: '0.8rem' }}>
                  {meetingRequests.filter(r => r.status === 'new').length} New
                </span>
                <span className="badge badge-light-danger" style={{ fontSize: '0.8rem' }}>
                  {meetingRequests.filter(r => r.urgency === 'urgent').length} Urgent
                </span>
              </div>
            </div>

            {meetingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
                <Clock size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontWeight: '600', margin: 0 }}>No meeting requests recorded</p>
                <span style={{ fontSize: '0.8rem' }}>New requests from your assigned mentees will appear here automatically.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Priority &amp; Category</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Submitted</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetingRequests.map((req) => {
                      const isCrisis = req.category === 'crisis' || req.urgency === 'urgent';
                      return (
                        <tr key={req.request_id || req._id} style={{ borderBottom: '1px solid var(--border)', background: isCrisis ? '#fff5f5' : '#ffffff' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {isCrisis && (
                                <span className="badge badge-light-danger" style={{ fontSize: '0.7rem' }}>
                                  URGENT CRISIS
                                </span>
                              )}
                              <span className={`badge ${req.category === 'academic' ? 'badge-light-warning' : 'badge-light-primary'}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                                {req.category}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>
                            {req.student_id}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', maxWidth: '280px', color: 'var(--dark)' }}>
                            {req.reason_short}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className={`badge ${req.status === 'resolved' ? 'badge-light-success' : req.status === 'scheduled' ? 'badge-light-primary' : req.status === 'acknowledged' ? 'badge-light-warning' : 'badge-light-danger'}`} style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontSize: '0.76rem' }}>
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              {req.status === 'new' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleUpdateMeetingStatus(req.request_id, 'acknowledged')}
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                                >
                                  Acknowledge
                                </button>
                              )}
                              {req.status !== 'resolved' && req.status !== 'cancelled' && (
                                <>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleUpdateMeetingStatus(req.request_id, 'scheduled')}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    Schedule
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleUpdateMeetingStatus(req.request_id, 'resolved')}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    Resolve
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: LOG COUNSELING SESSION
          ===================================================================== */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                Log Mentoring Intervention
              </h3>
              <button onClick={() => setShowLogModal(false)} style={{ color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLog} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Select Mentee
                </label>
                <select
                  value={newLog.studentId}
                  onChange={(e) => setNewLog({ ...newLog, studentId: e.target.value })}
                  className="select-control"
                  style={{ width: '100%', height: '38px', fontSize: '0.82rem' }}
                >
                  {mentees.map(m => (
                    <option key={m.student_id} value={m.student_id}>
                      {m.student_name} ({m.student_id} - {m.attendance_pct}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Intervention Category
                </label>
                <select
                  value={newLog.category}
                  onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
                  className="select-control"
                  style={{ width: '100%', height: '38px', fontSize: '0.82rem' }}
                >
                  <option value="Attendance Shortage (<75%)">Attendance Shortage (&lt;75% Alert)</option>
                  <option value="Arrear Clearing & CIA Exam Remedial">Arrear Clearing &amp; CIA Exam Remedial</option>
                  <option value="Parental Intimation & Consultation">Parental Intimation &amp; Consultation</option>
                  <option value="Hostel / Living Mode Adjustment">Hostel / Living Mode Adjustment</option>
                  <option value="General Academic Mentoring">General Academic Mentoring</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Action Taken / Agreed Plan
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dispatched SMS warning to parents, assigned Saturday remedial lab"
                  value={newLog.actionTaken}
                  onChange={(e) => setNewLog({ ...newLog, actionTaken: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Counseling Notes &amp; Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes from the one-on-one session with student..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Intervention Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          PARENT ALERT MODAL (Dispatches Official Intimation)
          ===================================================================== */}
      {showParentModal && (
        <ParentAlertModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          student={parentStudent}
          onAlertSent={handleParentAlertDispatched}
        />
      )}

    </div>
  );
}
