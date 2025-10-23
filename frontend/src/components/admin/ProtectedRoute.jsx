import React from 'react';
import { Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // For local desktop app - admin has direct access without authentication
  // No login required - this is a single-device application
  return <Outlet />;
}