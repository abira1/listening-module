import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { Dashboard } from './Dashboard';
import { TestManagement } from './TestManagement';
import { QuestionManager } from './QuestionManager';
import { AudioUpload } from './AudioUpload';
import { LocalStudentManagement } from './LocalStudentManagement';
import { SubmissionManagement } from './SubmissionManagement';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { ProtectedRoute } from './ProtectedRoute';
import { AIImport } from './AIImport';
import { TrackLibrary } from './TrackLibrary';
import { TeacherManagement } from './TeacherManagement';

export function AdminRouter() {
  return (
    <Routes>
      {/* Login route - no protection needed */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/tests" element={<AdminLayout><TestManagement /></AdminLayout>} />
        <Route path="/tests/:examId/audio" element={<AdminLayout><AudioUpload /></AdminLayout>} />
        <Route path="/tests/:examId/questions" element={<AdminLayout><QuestionManager /></AdminLayout>} />
        <Route path="/students" element={<AdminLayout><LocalStudentManagement /></AdminLayout>} />
        <Route path="/teachers" element={<AdminLayout><TeacherManagement /></AdminLayout>} />
        <Route path="/submissions" element={<AdminLayout><SubmissionManagement /></AdminLayout>} />
        <Route path="/ai-import" element={<AdminLayout><AIImport /></AdminLayout>} />
        <Route path="/tracks" element={<AdminLayout><TrackLibrary /></AdminLayout>} />
        <Route path="/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}