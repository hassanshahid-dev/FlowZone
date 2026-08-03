import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { Folder, Layers, ShieldCheck, HardDrive, RefreshCw, LogOut, ExternalLink, Plus, X, Globe } from 'lucide-react';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [selectedTag, setSelectedTag] = useState('Indigo');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    fetchWorkspaces();
    const interval = setInterval(fetchWorkspaces, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => fetch('http://localhost:5000/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      }));

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setWorkspaces(data);
      } else {
        setWorkspaces([]);
      }
    } catch (err) {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleConfirmCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setCreating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newWsName.trim(),
          tabs: [
            { title: 'Google', url: 'https://google.com' },
            { title: 'TabFlow Cloud', url: 'https://tabflow-dashboard-eight.vercel.app' }
          ],
          tag: selectedTag
        })
      }).catch(() => fetch('http://localhost:5000/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newWsName.trim(),
          tabs: [
            { title: 'Google', url: 'https://google.com' },
            { title: 'TabFlow Cloud', url: 'https://tabflow-dashboard-eight.vercel.app' }
          ],
          tag: selectedTag
        })
      }));

      if (res && res.ok) {
        setNewWsName('');
        setShowCreateModal(false);
        fetchWorkspaces();
      }
    } catch (e) {
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between relative">
      
      {/* Header Bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-8 h-6 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-tight">
              TAB FLOW
            </span>
            <span className="text-[8px] font-bold tracking-widest text-blue-400 uppercase">
              CLOUD DASHBOARD
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck size={14} /> Cloud Sync Active
          </div>
          <button 
            onClick={fetchWorkspaces} 
            className="p-2 text-slate-400 hover:text-white transition rounded-xl bg-slate-800/50 hover:bg-slate-800 flex items-center gap-1.5 text-xs font-medium px-3 cursor-pointer"
            title="Refresh Cloud Sync"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-red-900/50 transition font-medium cursor-pointer"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Cloud Workspaces</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Signed in as <strong className="text-blue-400">{user?.email || 'Cloud User'}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={16} /> Create Workspace
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Saved Workspaces</span>
              <Folder size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{workspaces.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Synced with MongoDB Cloud</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Total Active Tabs</span>
              <Layers size={16} className="text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {workspaces.reduce((acc, ws) => acc + (ws.tabs?.length || 0), 0)} Tabs
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Organized across workspaces</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>RAM Memory Reclaimed</span>
              <HardDrive size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {(workspaces.length * 0.45).toFixed(1)} GB
            </div>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">~96% memory overhead saved</span>
          </div>
        </div>

        {/* Workspaces List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Active Cloud Workspaces
          </h2>

          {loading && workspaces.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 text-sm">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-blue-400" />
              Loading workspaces...
            </div>
          ) : workspaces.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
              <Folder size={36} className="mx-auto mb-3 text-slate-600" />
              <h3 className="text-base font-semibold text-slate-300">No Cloud Workspaces Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click the <strong>"Create Workspace"</strong> button above or save a workspace in your Chrome extension!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Plus size={16} /> Create Workspace Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map((ws) => (
                <div key={ws._id || ws.name} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ws.tag === 'Emerald' ? 'bg-emerald-500' :
                        ws.tag === 'Purple' ? 'bg-purple-500' :
                        ws.tag === 'Amber' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <h3 className="font-semibold text-white text-base group-hover:text-blue-400 transition">{ws.name}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-800/60 px-2.5 py-1 rounded-md">
                      {ws.tabs?.length || 0} Tabs
                    </span>
                  </div>

                  {/* Tabs List */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-800/60">
                    {ws.tabs && ws.tabs.length > 0 ? (
                      ws.tabs.map((tab, idx) => (
                        <a 
                          key={idx} 
                          href={tab.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/40 transition group/tab"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Globe size={12} className="text-slate-500 flex-shrink-0" />
                            <span className="truncate">{tab.title || tab.url}</span>
                          </div>
                          <ExternalLink size={12} className="opacity-0 group-hover/tab:opacity-100 text-slate-400 flex-shrink-0 transition" />
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic block py-1">No open tabs in this workspace</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 TabFlow Cloud - Connected to Live Production Backend (https://tabflow-backend-api.vercel.app)
      </footer>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Folder size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">Create New Workspace</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Design Assets, Client Leads, Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Color Tag</label>
                <div className="flex items-center gap-3">
                  {['Indigo', 'Emerald', 'Purple', 'Amber'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition cursor-pointer ${
                        selectedTag === tag 
                          ? 'border-blue-500 bg-blue-500/10 text-white font-semibold' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        tag === 'Emerald' ? 'bg-emerald-500' :
                        tag === 'Purple' ? 'bg-purple-500' :
                        tag === 'Amber' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWsName.trim()}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {creating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={16} />}
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
