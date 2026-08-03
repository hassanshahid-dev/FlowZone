import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { ShieldCheck, LogOut, CheckCircle2, Cloud, HardDrive, PanelLeft, RefreshCw, Folder } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [workspacesCount, setWorkspacesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    // Broadcast session token to Chrome Extension content script
    window.postMessage({ type: 'TABFLOW_SYNC_SESSION' }, '*');

    fetchWorkspaceCount();
  }, []);

  const fetchWorkspaceCount = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => fetch('http://localhost:5000/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      }));

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setWorkspacesCount(data.length);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      
      {/* Header Bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-8 h-6 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-tight">
              TAB FLOW
            </span>
            <span className="text-[8px] font-bold tracking-widest text-blue-400 uppercase">
              EXTENSION SIDEBAR MODE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck size={14} /> Cloud Account Connected
          </div>
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-red-900/50 transition font-medium cursor-pointer"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Content: Extension Sidebar Launchpad */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        
        {/* Success Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-xl shadow-blue-500/10">
          <PanelLeft size={38} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cloud Account Logged In!
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md">
          Signed in as <strong className="text-blue-400">{user?.email || 'Cloud User'}</strong>. All your cloud-saved workspaces and local workspaces are active in your Chrome Extension Sidebar.
        </p>

        {/* Status Box */}
        <div className="mt-8 w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4">
          
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Cloud size={18} className="text-blue-400" />
              <div>
                <span className="text-xs font-bold text-white block">Synced Cloud Workspaces</span>
                <span className="text-[10px] text-slate-500">MongoDB Atlas Database</span>
              </div>
            </div>
            <span className="text-base font-extrabold text-blue-400 font-mono">
              {loading ? <RefreshCw size={14} className="animate-spin" /> : `${workspacesCount} Workspaces`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Extension Sidebar Auto-Sync</span>
                <span className="text-[10px] text-slate-500">Automatic local & cloud merging</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              ACTIVE
            </span>
          </div>

        </div>

        {/* How to Open Instructions */}
        <div className="mt-8 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 max-w-md text-center">
          <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
            🚀 How to Open Your Workspaces
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click the <strong>TabFlow extension icon</strong> in your Chrome toolbar or press <strong>Option + S</strong> to open your Extension Sidebar right now!
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 TabFlow Cloud - Connected to Live Backend (https://tabflow-backend-api.vercel.app)
      </footer>

    </div>
  );
}
