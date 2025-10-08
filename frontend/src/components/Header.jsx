import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOutIcon, UserIcon } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white w-full p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-4">
          <img
            src="https://i.postimg.cc/FKx07M5m/ILTES.png"
            alt="IELTS Logo"
            className="h-10 cursor-pointer"
          />
          <img
            src="https://customer-assets.emergentagent.com/job_login-gateway-23/artifacts/lb58nl9d_Shah-Sultan-Logo-2.png"
            alt="Shah Sultan's IELTS Academy"
            className="h-12 cursor-pointer"
          />
        </Link>
        
        {!isAuthenticated ? (
          <>
            <Link
              to="/student"
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Student Login
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/student/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.name || 'Dashboard'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        <img
          src="https://i.postimg.cc/0Q2DmVPS/Biritsh-Council.png"
          alt="British Council"
          className="h-8"
        />
        <img
          src="https://i.postimg.cc/9f2GXWkJ/IDB.png"
          alt="IDP"
          className="h-8"
        />
        <img
          src="https://i.postimg.cc/TYZVSjJ8/Cambridge-University.png"
          alt="Cambridge Assessment English"
          className="h-8"
        />
      </div>
    </header>
  );
}