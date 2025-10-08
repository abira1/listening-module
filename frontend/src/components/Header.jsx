import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white w-full p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="https://i.postimg.cc/FKx07M5m/ILTES.png"
          alt="IELTS Logo"
          className="h-10"
        />
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