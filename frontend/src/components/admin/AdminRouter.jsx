import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './Dashboard';
import { TestManagement } from './TestManagement';
import { QuestionManager } from './QuestionManager';
import { AudioUpload } from './AudioUpload';
import { StudentManagement } from './StudentManagement';
import { SubmissionManagement } from './SubmissionManagement';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { AdminLogin } from './AdminLogin';
import { ProtectedRoute } from './ProtectedRoute';
import { AIImport } from './AIImport';
import { TrackLibrary } from './TrackLibrary';

export function AdminRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/tests" element={<AdminLayout><TestManagement /></AdminLayout>} />
        <Route path="/tests/:examId/audio" element={<AdminLayout><AudioUpload /></AdminLayout>} />
        <Route path="/tests/:examId/questions" element={<AdminLayout><QuestionManager /></AdminLayout>} />
        <Route path="/students" element={<AdminLayout><StudentManagement /></AdminLayout>} />
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