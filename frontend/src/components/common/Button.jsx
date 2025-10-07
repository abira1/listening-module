import React from 'react';

export function Button({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-200 border border-gray-400 text-gray-700 py-2 px-8 rounded-md shadow-sm hover:bg-gray-300 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}