import React from 'react';

export function InfoNotice({ message, type = 'info', children }) {
  const iconColor = type === 'warning' ? 'text-red-500' : 'text-blue-500';
  const bgColor = type === 'warning' ? 'bg-red-50' : 'bg-blue-50';

  return (
    <div className={`flex items-center gap-2 p-3 rounded-md ${bgColor} border border-blue-100`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${iconColor} border border-current`}>
        <span className="text-sm font-bold">i</span>
      </div>
      <p>{message || children}</p>
    </div>
  );
}