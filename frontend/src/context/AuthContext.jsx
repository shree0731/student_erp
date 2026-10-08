import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const SAMPLE_PERSONAS = {
  admin: {
    username: 'admin',
    id: 'ADMIN_CHIEF_01',
    name: 'Academic Dean Office',
    role: 'admin',
    email: 'dean.office@consortium.edu.in',
    college: 'Apex Engineering College',
    collegeId: 'C101',
    avatar: 'AD'
  },
  mentor: {
    username: 'mentor',
    id: 'FAC_EEC_CSE_001',
    name: 'Dr. Kavitha Ramanathan',
    role: 'mentor',
    email: 'kavitha.ram@aec.edu.in',
    department: 'CSE',
    college: 'Apex Engineering College',
    collegeId: 'C101',
    avatar: 'KR'
  },
  student: {
    username: 'student',
    id: 'STU_EEC_CSE_Y1_0001',
    name: 'Divya Sengottaiyan',
    role: 'student',
    email: 'divya.s@aec.edu.in',
    department: 'CSE',
    college: 'Apex Engineering College',
    collegeId: 'C101',
    year: 1,
    risk: 'Low',
    avatar: 'DS'
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('erp_token') || null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('erp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Listen for unauthorized 401 events from api service
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setCurrentUser(null);
      sessionStorage.removeItem('erp_token');
      sessionStorage.removeItem('erp_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res && res.token && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        sessionStorage.setItem('erp_token', res.token);
        sessionStorage.setItem('erp_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    sessionStorage.removeItem('erp_token');
    sessionStorage.removeItem('erp_user');
  };

  // Persona switching: exclusively accessible during local development
  const switchRole = (roleKey) => {
    if (!import.meta.env.DEV) {
      console.warn('[Security Guard] Role switching shortcut disabled in production builds');
      return;
    }
    const persona = SAMPLE_PERSONAS[roleKey];
    if (persona) {
      setCurrentUser(persona);
      sessionStorage.setItem('erp_user', JSON.stringify(persona));
    }
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout, switchRole, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
