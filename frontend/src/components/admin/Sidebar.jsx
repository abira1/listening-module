import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileQuestion, Users, BarChart3, Settings, LogOut, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Test Management', path: '/admin/tests', icon: <FileQuestion className="w-5 h-5" /> },
    { name: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Submissions', path: '/admin/submissions', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative lg:z-0`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src="https://i.postimg.cc/FKx07M5m/ILTES.png" alt="IELTS Admin" className="h-8" />
            <span className="ml-2 text-lg font-semibold text-gray-800">Admin</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-gray-100 lg:hidden">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-5 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors ${location.pathname === item.path ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}