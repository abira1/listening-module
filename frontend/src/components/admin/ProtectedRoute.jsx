import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const isAuthenticated = !!localStorage.getItem('adminToken');
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}