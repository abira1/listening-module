import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Homepage } from './components/Homepage';
import { ExamTest } from './components/ExamTest';
import { AdminRouter } from './components/admin/AdminRouter';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/exam/:examId" element={<ExamTest />} />
          <Route path="/admin/*" element={<AdminRouter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
