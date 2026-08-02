import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center pb-6 border-b border-neutral-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">T</div>
            <h1 className="text-xl font-bold">TabFlow Cloud Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800">
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <span className="text-xs text-neutral-400">Total Workspaces</span>
            <div className="text-3xl font-bold text-white mt-1">4 Workspaces</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <span className="text-xs text-neutral-400">RAM Memory Saved</span>
            <div className="text-3xl font-bold text-emerald-400 mt-1">1.8 GB</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <span className="text-xs text-neutral-400">Cloud Sync Status</span>
            <div className="text-3xl font-bold text-blue-400 mt-1">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
