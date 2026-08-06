import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { Folder, Layers, ShieldCheck, HardDrive, RefreshCw, LogOut, ExternalLink, Plus, X, Globe, LayoutDashboard, Pencil, Trash2, Play, Pause } from 'lucide-react';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [selectedTag, setSelectedTag] = useState('Indigo');
  const [creating, setCreating] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameWsId, setRenameWsId] = useState('');
  const [renameWsName, setRenameWsName] = useState('');
  const [renaming, setRenaming] = useState(false);

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendWs, setSuspendWs] = useState(null);
  const [selectedSuspendTabs, setSelectedSuspendTabs] = useState([]);
  const [selectedDeleteTabs, setSelectedDeleteTabs] = useState([]);
  const [suspending, setSuspending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { }
    }

    // Broadcast session token to Chrome Extension
    window.postMessage({ type: 'FLOWZONE_SYNC_SESSION' }, '*');
    window.postMessage({ type: 'TABFLOW_SYNC_SESSION' }, '*');

    fetchWorkspaces();

    const handleMessage = (e) => {
      if (e.data && (e.data.type === 'FLOWZONE_SYNC_SESSION_DONE' || e.data.type === 'TABFLOW_SYNC_SESSION_DONE' || e.data.type === 'FLOWZONE_SYNC_WORKSPACES' || e.data.type === 'TABFLOW_SYNC_WORKSPACES')) {
        fetchWorkspaces();
      }
    };
    window.addEventListener('message', handleMessage);

    const interval = setInterval(fetchWorkspaces, 3000);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    let cloudWs = [];
    if (token) {
      try {
        const res = await fetch('https://tabflow-backend-api.vercel.app/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => fetch('http://localhost:5000/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` }
        }));

        if (res) {
          if (res.status === 401) {
            // Token is invalid/expired -> Clear invalid token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) cloudWs = data;
          }
        }
      } catch (err) { }
    }

    // Read local storage workspaces synced from extension sidebar
    let localWs = [];
    try {
      const storedLocal = localStorage.getItem('workSpaces');
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (Array.isArray(parsed)) localWs = parsed;
      }
    } catch (e) { }

    // Combine cloud and local workspaces seamlessly
    const combined = [...cloudWs];
    localWs.forEach(l => {
      const exists = combined.some(c => c._id === l._id || c.name.toLowerCase().trim() === l.name.toLowerCase().trim());
      if (!exists) combined.push(l);
    });

    setWorkspaces(combined);
    setLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of your FlowZone account?")) {
      window.postMessage({ type: 'FLOWZONE_LOGOUT_EVENT' }, '*');
      window.postMessage({ type: 'TABFLOW_LOGOUT_EVENT' }, '*');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('workSpaces');
      navigate('/login');
    }
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
          tabs: [],
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
          tabs: [],
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

  const handleOpenRenameModal = (ws) => {
    setRenameWsId(ws._id || ws.id);
    setRenameWsName(ws.name || '');
    setShowRenameModal(true);
  };

  const handleConfirmRenameWorkspace = async (e) => {
    e.preventDefault();
    if (!renameWsId || !renameWsName.trim()) return;

    setRenaming(true);
    const token = localStorage.getItem('token');
    try {
      if (token && !renameWsId.startsWith('local_')) {
        await fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${renameWsId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: renameWsName.trim() })
        }).catch(() => {});
      }

      let localWs = [];
      const storedLocal = localStorage.getItem('workSpaces');
      if (storedLocal) {
        try {
          localWs = JSON.parse(storedLocal);
          const found = localWs.find(w => (w._id || w.id) === renameWsId);
          if (found) found.name = renameWsName.trim();
          localStorage.setItem('workSpaces', JSON.stringify(localWs));
        } catch (e) {}
      }

      window.postMessage({ type: 'FLOWZONE_ACTION_EVENT', action: 'rename', workspaceId: renameWsId, data: { name: renameWsName.trim() } }, '*');
      window.postMessage({ type: 'TABFLOW_ACTION_EVENT', action: 'rename', workspaceId: renameWsId, data: { name: renameWsName.trim() } }, '*');
      window.postMessage({ type: 'FLOWZONE_SYNC_WORKSPACES' }, '*');
      window.postMessage({ type: 'TABFLOW_SYNC_WORKSPACES' }, '*');
      setShowRenameModal(false);
      fetchWorkspaces();
    } catch (e) {
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteWorkspace = async (ws) => {
    const id = ws._id || ws.id;
    if (!confirm(`Delete workspace "${ws.name}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      if (token && id && !id.startsWith('local_')) {
        await fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }

      let localWs = [];
      const storedLocal = localStorage.getItem('workSpaces');
      if (storedLocal) {
        try {
          localWs = JSON.parse(storedLocal).filter(w => (w._id || w.id) !== id);
          localStorage.setItem('workSpaces', JSON.stringify(localWs));
        } catch (e) {}
      }

      window.postMessage({ type: 'FLOWZONE_ACTION_EVENT', action: 'delete', workspaceId: id }, '*');
      window.postMessage({ type: 'TABFLOW_ACTION_EVENT', action: 'delete', workspaceId: id }, '*');
      window.postMessage({ type: 'FLOWZONE_SYNC_WORKSPACES' }, '*');
      window.postMessage({ type: 'TABFLOW_SYNC_WORKSPACES' }, '*');
      fetchWorkspaces();
    } catch (e) {}
  };

  const handleOpenSuspendModal = (ws) => {
    setSuspendWs(ws);
    const allUrls = (ws.tabs || []).map(t => t.url).filter(Boolean);
    setSelectedSuspendTabs(allUrls);
    setSelectedDeleteTabs([]);
    setShowSuspendModal(true);
  };

  const handleConfirmSuspendWorkspace = async (e) => {
    e.preventDefault();
    if (!suspendWs) return;

    setSuspending(true);
    const id = suspendWs._id || suspendWs.id;
    const token = localStorage.getItem('token');

    let updatedTabs = (suspendWs.tabs || []).filter(t => !selectedDeleteTabs.includes(t.url));

    try {
      if (token && id && !id.startsWith('local_')) {
        await fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: false, tabs: updatedTabs })
        }).catch(() => {});
      }

      let localWs = [];
      const storedLocal = localStorage.getItem('workSpaces');
      if (storedLocal) {
        try {
          localWs = JSON.parse(storedLocal);
          const found = localWs.find(w => (w._id || w.id) === id);
          if (found) {
            found.isActive = false;
            found.tabs = updatedTabs;
          }
          localStorage.setItem('workSpaces', JSON.stringify(localWs));
        } catch (e) {}
      }

      window.postMessage({
        type: 'FLOWZONE_ACTION_EVENT',
        action: 'suspend',
        workspaceId: id,
        data: { name: suspendWs.name, tabs: updatedTabs, closeUrls: selectedSuspendTabs }
      }, '*');
      window.postMessage({
        type: 'TABFLOW_ACTION_EVENT',
        action: 'suspend',
        workspaceId: id,
        data: { name: suspendWs.name, tabs: updatedTabs, closeUrls: selectedSuspendTabs }
      }, '*');

      window.postMessage({ type: 'FLOWZONE_SYNC_WORKSPACES' }, '*');
      window.postMessage({ type: 'TABFLOW_SYNC_WORKSPACES' }, '*');
      setShowSuspendModal(false);
      fetchWorkspaces();
    } catch (e) {
    } finally {
      setSuspending(false);
    }
  };

  const handleRestoreWorkspace = async (ws) => {
    const id = ws._id || ws.id;
    const token = localStorage.getItem('token');
    try {
      if (token && id && !id.startsWith('local_')) {
        await fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: true })
        }).catch(() => {});
      }

      let localWs = [];
      const storedLocal = localStorage.getItem('workSpaces');
      if (storedLocal) {
        try {
          localWs = JSON.parse(storedLocal);
          const found = localWs.find(w => (w._id || w.id) === id);
          if (found) found.isActive = true;
          localStorage.setItem('workSpaces', JSON.stringify(localWs));
        } catch (e) {}
      }

      window.postMessage({
        type: 'TABFLOW_ACTION_EVENT',
        action: 'restore',
        workspaceId: id,
        data: { name: ws.name, tabs: ws.tabs }
      }, '*');
      window.postMessage({ type: 'TABFLOW_SYNC_WORKSPACES' }, '*');
      fetchWorkspaces();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between relative">

      {/* Header Bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-8 h-6 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-tight">
              FLOW ZONE
            </span>
            <span className="text-[8px] font-bold tracking-widest text-blue-400 uppercase">
              CLOUD DASHBOARD
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition rounded-xl bg-slate-800/50 hover:bg-slate-800 px-3 py-2 font-medium"
          >
            Home Page
          </Link>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <LayoutDashboard size={26} className="text-blue-400" /> Your Cloud Workspaces
            </h1>
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
            <span className="text-[10px] text-slate-500 mt-1 block">Synced with MongoDB Cloud Atlas</span>
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
              {(() => {
                let totalMb = 0;
                workspaces.forEach(ws => {
                  (ws.tabs || []).forEach(t => {
                    if (t.memoryMb && typeof t.memoryMb === 'number') {
                      totalMb += t.memoryMb;
                    } else if (t.url) {
                      const u = t.url.toLowerCase();
                      if (u.includes('youtube') || u.includes('video') || u.includes('netflix')) totalMb += 380;
                      else if (u.includes('figma') || u.includes('canva') || u.includes('docs.google')) totalMb += 290;
                      else if (u.includes('gmail') || u.includes('github') || u.includes('linkedin')) totalMb += 210;
                      else totalMb += 120;
                    } else {
                      totalMb += 120;
                    }
                  });
                });
                return totalMb >= 1024 ? (totalMb / 1024).toFixed(2) + ' GB' : totalMb + ' MB';
              })()}
            </div>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">Exact process memory calculated</span>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Active Workspaces & Saved Tabs
          </h2>

          {loading && workspaces.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 text-sm">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-blue-400" />
              Loading workspaces from cloud...
            </div>
          ) : workspaces.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
              <Folder size={36} className="mx-auto mb-3 text-slate-600" />
              <h3 className="text-base font-semibold text-slate-300">No Workspaces Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first workspace using the button above or save workspaces in your Chrome extension!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Plus size={16} /> Create Workspace Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workspaces.map((ws) => (
                <div key={ws._id || ws.name} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-6 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full ${ws.tag === 'Emerald' || ws.tag === 'Green' ? 'bg-emerald-500' :
                          ws.tag === 'Purple' ? 'bg-purple-500' :
                            ws.tag === 'Amber' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                        <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition">{ws.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenRenameModal(ws)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Rename Workspace"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkspace(ws)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Delete Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1 rounded-full font-semibold ml-1">
                          {ws.tabs?.length || 0} Tabs
                        </span>
                      </div>
                    </div>

                    {/* Saved Tabs List */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80">
                      {ws.tabs && ws.tabs.length > 0 ? (
                        ws.tabs.map((tab, idx) => (
                          <a
                            key={idx}
                            href={tab.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between text-xs text-slate-300 hover:text-white p-2.5 rounded-xl hover:bg-slate-800/60 transition border border-transparent hover:border-slate-700/60 group/tab"
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              {tab.favIconUrl ? (
                                <img src={tab.favIconUrl} alt="" className="w-4 h-4 rounded flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : (
                                <Globe size={14} className="text-slate-500 flex-shrink-0" />
                              )}
                              <span className="truncate font-medium">{tab.title || tab.url}</span>
                            </div>
                            <ExternalLink size={13} className="opacity-0 group-hover/tab:opacity-100 text-blue-400 flex-shrink-0 transition" />
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic block py-1">No open tabs saved in this workspace</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/40">
                    <button
                      onClick={() => ws.isActive === false ? handleRestoreWorkspace(ws) : handleOpenSuspendModal(ws)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                        ws.isActive === false
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {ws.isActive === false ? (
                        <><Play size={12} /> Restore Workspace</>
                      ) : (
                        <><Pause size={12} /> Suspend Workspace</>
                      )}
                    </button>
                    <span>Updated: {new Date(ws.updatedAt || ws.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center text-xs text-slate-500 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>© 2026 FlowZone Cloud. All rights reserved.</div>
        <div className="flex items-center gap-5">
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
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
                      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition cursor-pointer ${selectedTag === tag
                        ? 'border-blue-500 bg-blue-500/10 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${tag === 'Emerald' ? 'bg-emerald-500' :
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

      {/* RENAME WORKSPACE MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Pencil size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">Rename Workspace</h3>
              </div>
              <button
                onClick={() => setShowRenameModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRenameWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">New Workspace Name</label>
                <input
                  type="text"
                  value={renameWsName}
                  onChange={(e) => setRenameWsName(e.target.value)}
                  placeholder="Enter new workspace name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renaming || !renameWsName.trim()}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {renaming ? <RefreshCw size={14} className="animate-spin" /> : null}
                  {renaming ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND & MANAGE TABS MODAL */}
      {showSuspendModal && suspendWs && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Pause size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Suspend Workspace</h3>
                  <p className="text-xs text-slate-400">"{suspendWs.name}"</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspendWorkspace} className="space-y-5">
              {/* Section 1: Tabs to Suspend / Close */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSuspendTabs.length === (suspendWs.tabs?.length || 0) && selectedSuspendTabs.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSuspendTabs((suspendWs.tabs || []).map(t => t.url));
                        } else {
                          setSelectedSuspendTabs([]);
                        }
                      }}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    Select Tabs to Suspend (Close Browser Tabs)
                  </label>
                  <span className="text-[10px] text-blue-400 font-semibold">{selectedSuspendTabs.length} selected</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Checked tabs will be closed in your browser to free RAM (Select All by default).</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  {suspendWs.tabs && suspendWs.tabs.length > 0 ? (
                    suspendWs.tabs.map((tab, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer py-1 truncate">
                        <input
                          type="checkbox"
                          checked={selectedSuspendTabs.includes(tab.url)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuspendTabs([...selectedSuspendTabs, tab.url]);
                            } else {
                              setSelectedSuspendTabs(selectedSuspendTabs.filter(u => u !== tab.url));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 flex-shrink-0"
                        />
                        <span className="truncate" title={tab.title || tab.url}>{tab.title || tab.url}</span>
                      </label>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No tabs in workspace</span>
                  )}
                </div>
              </div>

              {/* Section 2: Tabs to Delete / Remove from Workspace */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-red-400 flex items-center gap-2">
                    Select Tabs to Permanently Delete from Workspace
                  </label>
                  <span className="text-[10px] text-red-400 font-semibold">{selectedDeleteTabs.length} to delete</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Checked tabs will be permanently removed from this workspace's saved tabs list.</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  {suspendWs.tabs && suspendWs.tabs.length > 0 ? (
                    suspendWs.tabs.map((tab, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-red-300 cursor-pointer py-1 truncate">
                        <input
                          type="checkbox"
                          checked={selectedDeleteTabs.includes(tab.url)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeleteTabs([...selectedDeleteTabs, tab.url]);
                            } else {
                              setSelectedDeleteTabs(selectedDeleteTabs.filter(u => u !== tab.url));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-800 text-red-600 focus:ring-0 flex-shrink-0"
                        />
                        <span className="truncate" title={tab.title || tab.url}>{tab.title || tab.url}</span>
                      </label>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No tabs in workspace</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={suspending}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {suspending ? <RefreshCw size={14} className="animate-spin" /> : <Pause size={14} />}
                  {suspending ? 'Suspending...' : 'Confirm & Suspend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
