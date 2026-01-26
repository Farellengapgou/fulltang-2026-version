import React from 'react';
import { FiSettings, FiRefreshCw, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AppRoutesPaths } from '../../Router/appRouterPaths.js';
import { useMessageBadge } from '../../Utils/useMessageBadge.js';

export function PharmacyNavbar({ username }) {
  const navigate = useNavigate();
  const messageCount = useMessageBadge();
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white border-b ">
      <h1 className="text-xl font-semibold" style={{ color: '#2F4B8F' }}>Pharmacist</h1>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg shadow-sm hover:shadow-md bg-white transition-shadow">
          <button className="text-gray-500 hover:text-gray-700">
            <FiSettings className="w-5 h-5 text-blue" />
          </button>
        </div>
        <div className="p-2 rounded-lg shadow-sm hover:shadow-md bg-white transition-shadow">
          <button className="text-gray-500 hover:text-gray-700">
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 rounded-lg shadow-sm hover:shadow-md bg-white transition-shadow relative">
          <button
            onClick={() => navigate(AppRoutesPaths.helpCenterPage)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiMail className="w-5 h-5" />
          </button>
          {messageCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse pointer-events-none">
              {messageCount > 99 ? "99+" : messageCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-gray-600">Username.N</span>
          <div className="w-8 h-8 rounded-full shadow-sm overflow-hidden">
            <img 
              src="/doctor.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyNavbar;
