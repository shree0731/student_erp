/**
 * API Service Layer
 * Interacts with the Express/MongoDB Backend (/api)
 * Secured with JWT authentication attached to every request.
 */

const API_BASE = '/api';

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
  // Authentication
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

  // Faculty / Mentors
  getMentorStudents: async (facultyId) => {
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
    return {
      model_type: 'XGBoostClassifier',
      accuracy: 0.9658,
      precision_macro: 0.9421,
      recall_macro: 0.9528,
      f1_macro: 0.9370,
      confusion_matrix: [
        [1460, 42, 0],
        [19, 163, 1],
        [0, 1, 154]
      ],
      classes: ['Low', 'Medium', 'High'],
      training_samples: 7360,
      test_samples: 1840
    };
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
  }
};
