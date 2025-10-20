import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

export function AdminHeader({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-1 mr-4 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">IELTS Listening Admin</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
              Admin User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}