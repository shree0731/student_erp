import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/public/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarks from './pages/student/StudentMarks';
import MentorDashboard from './pages/mentor/MentorDashboard';
import StudentDetail from './pages/mentor/StudentDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';

// Route Guard Component by Role
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, token } = useAuth();

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect unauthorized roles to their designated home dashboard
    if (currentUser.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (currentUser.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout wrapper for authenticated views
function MainLayout({ children }) {
  const { collapsed } = useSidebar();
  const { currentUser } = useAuth();
  return (
    <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
        {/* Baymate Academic Advisor Chatbot */}
        {currentUser && (
          <ChatbotWidget
            studentId={currentUser?.role === 'student' ? (currentUser?.linkedId || currentUser?.id) : null}
            studentName={currentUser?.name}
            role={currentUser?.role}
            user={currentUser}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root directly to operational ERP login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication Portal */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MainLayout>
                    <StudentDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/marks"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MainLayout>
                    <StudentMarks />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected Mentor Routes */}
            <Route
              path="/mentor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MainLayout>
                    <MentorDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/student/:id"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MainLayout>
                    <StudentDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}
