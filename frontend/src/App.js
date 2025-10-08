import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Homepage } from './components/Homepage';
import { ExamTest } from './components/ExamTest';
import { AdminRouter } from './components/admin/AdminRouter';
import { AuthProvider } from './contexts/AuthContext';
import { StudentHome } from './components/student/StudentHome';
import { CompleteProfile } from './components/student/CompleteProfile';
import { WaitingForApproval } from './components/student/WaitingForApproval';
import { StudentDashboard } from './components/student/StudentDashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/exam/:examId" element={<ExamTest />} />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/waiting-approval" element={<WaitingForApproval />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/admin/*" element={<AdminRouter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
