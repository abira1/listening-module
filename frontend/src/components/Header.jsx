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
    <header className="bg-white w-full p-4 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side - User info when authenticated */}
        <div className="flex items-center gap-3 w-1/4">
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link
                to="/student/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Center - Shah Sultan's IELTS Academy Logo */}
        <div className="flex-1 flex justify-center">
          <Link to="/" className="flex items-center">
            <img
              src="https://customer-assets.emergentagent.com/job_ce28ff48-be0c-4e05-8c09-33992c069cda/artifacts/xkwz06jy_Shah-Sultan-Logo-2.png"
              alt="Shah Sultan's IELTS Academy"
              className="h-16 cursor-pointer"
            />
          </Link>
        </div>

        {/* Right side - Partner logos */}
        <div className="flex items-center gap-4 w-1/4 justify-end">
          <img
            src="https://i.postimg.cc/0Q2DmVPS/Biritsh-Council.png"
            alt="British Council"
            className="h-7"
          />
          <img
            src="https://i.postimg.cc/9f2GXWkJ/IDB.png"
            alt="IDP"
            className="h-7"
          />
          <img
            src="https://i.postimg.cc/TYZVSjJ8/Cambridge-University.png"
            alt="Cambridge Assessment English"
            className="h-7"
          />
        </div>
      </div>
    </header>
  );
}