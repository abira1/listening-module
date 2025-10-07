import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white w-full p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <img
          src="https://i.postimg.cc/FKx07M5m/ILTES.png"
          alt="IELTS Logo"
          className="h-10"
        />
        <Link
          to="/admin"
          className="ml-6 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
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