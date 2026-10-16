/**
 * API Service Layer
 * Interacts with the Express/MongoDB Backend (/api)
 * Secured with JWT authentication attached to every request.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api';


// Helper for HTTP requests with JWT authorization
async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('erp_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Clear expired / invalid token
      sessionStorage.removeItem('erp_token');
      sessionStorage.removeItem('erp_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Unauthorized (401): Session expired or invalid');
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Backend request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'Authentication failed');
    }
    return await res.json();
  },

  verifyOtp: async ({ challenge_id, code, username }) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id, code, username })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'OTP verification failed');
    }
    return await res.json();
  },

  resendOtp: async ({ challenge_id }) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'Failed to resend OTP');
    }
    return await res.json();
  },

  sendParentAlert: async (studentId, data = {}) => {
    return await request(`/students/${studentId}/parent-alert`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getNotificationLog: async (studentId) => {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : '';
    return await request(`/notifications/log${query}`);
  },

  // Students
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await request(`/students?${query}`);
  },

  getStudentById: async (id) => {
    return await request(`/students/${id}`);
  },

  getStudentMarks: async (id, semester) => {
    const query = semester ? `?semester=${semester}` : '';
    return await request(`/students/${id}/marks${query}`);
  },

  // Mentor Notes
  getStudentNotes: async (id) => {
    return await request(`/students/${id}/notes`);
  },

  createStudentNote: async (id, data) => {
    return await request(`/students/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  upsertStudentNote: async (id, data) => {
    return await request(`/students/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteStudentNote: async (id, noteId) => {
    return await request(`/students/${id}/notes/${noteId}`, {
      method: 'DELETE'
    });
  },

  // Faculty / Mentors
  getMentorStudents: async (facultyId) => {
    return await request(`/faculty/${facultyId}/students`);
  },

  getMentorMentees: async (facultyId) => {
    return await request(`/faculty/${facultyId}/students`);
  },

  getAllFaculty: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await request(`/faculty?${query}`);
  },

  // Admin Aggregation
  getAdminSummary: async (collegeId) => {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return await request(`/admin/summary${query}`);
  },

  // Model Evaluation Benchmark Metrics
  getMlMetrics: async () => {
    return await request('/ml/metrics');
  },

  // Standalone AI Academic Intervention Chatbot
  sendAdvisorChat: async (studentId, message, conversationHistory = []) => {
    return await request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        message,
        conversationHistory
      })
    });
  },

  // Curriculum
  getCurriculum: async (branch, semester) => {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (semester) params.append('semester', semester);
    return await request(`/curriculum?${params.toString()}`);
  },

  // Dynamic branch/college lists
  getBranches: async () => {
    return await request('/branches');
  },

  getColleges: async () => {
    return await request('/colleges');
  },

  // Meeting Requests & Notifications
  createMeetingRequest: async (payload) => {
    return await request('/meeting-requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMeetingRequests: async () => {
    return await request('/meeting-requests');
  },

  getMyMeetingRequests: async () => {
    return await request('/meeting-requests/my');
  },

  updateMeetingRequestStatus: async (requestId, payload) => {
    return await request(`/meeting-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  getNotifications: async () => {
    return await request('/notifications');
  },

  // Health
  checkHealth: async () => {
    return await request('/health');
  },

  getDeepHealth: async () => {
    return await request('/health/deep');
  },

  // Student Assessment Flow (Part B)
  assessStudent: async (payload) => {
    return await request('/students/assess', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getStudentAssessments: async (studentId) => {
    return await request(`/students/${studentId}/assessments`);
  },

  getStudentActions: async (studentId) => {
    return await request(`/students/${studentId}/actions`);
  },

  getAssessExamples: async () => {
    return await request('/assess/examples');
  }
};

