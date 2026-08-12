import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Cpu, Sparkles, Shield, RefreshCw, Download, Star,
  ChevronDown, Monitor, Check, ArrowRight, Play, Volume2, Maximize2,
  User, Award, X as CloseIcon, Copy, ExternalLink, CheckCircle2,
  Menu, X, Cloud, Lock, Asterisk, Plus, FileText, BookOpen, MessageSquare, TrendingUp, Headphones, Flame, Gauge, LogIn
} from 'lucide-react';

// Brand SVG Logo
export const TabFlowLogoSvg = ({ className = "w-10 h-8" }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="14" y="10" width="62" height="20" rx="8" transform="rotate(-6 45 20)" fill="#1D4ED8" />
    <rect x="22" y="28" width="62" height="20" rx="8" transform="rotate(-3 53 38)" fill="#3B82F6" />
    <rect x="30" y="46" width="62" height="20" rx="8" transform="rotate(-1 61 56)" fill="#10B981" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
  </svg>
);

const RedditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.36.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.18 1.207.49 1.192-.857 2.846-1.42 4.672-1.49l.913-4.277 3.32.7a1.248 1.248 0 0 1 1.118-.925z" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ChromeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2" />
    <line x1="3.34" y1="17" x2="8.54" y2="14" stroke="currentColor" strokeWidth="2" />
    <line x1="20.66" y1="17" x2="15.46" y2="14" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CHROME_WEB_STORE_URL = "https://chromewebstore.google.com/detail/flowzone-ai-workspace-tab/hmhbhfkgpofgbnflagbafhljfmchjdeb?utm_source=item-share-cb";

export default function Landing() {
  const navigate = useNavigate();

  // State Management
  const [activeNavTab, setActiveNavTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabCount, setTabCount] = useState(35);
  const ramSavedGB = ((tabCount * 150) / 1024).toFixed(1);
  const batteryBoost = Math.min(45, Math.round(tabCount * 0.8));
  const speedBoost = (1 + tabCount * 0.05).toFixed(1);

  // Interactive Demo State
  const [demoState, setDemoState] = useState('active');
  const [demoRam, setDemoRam] = useState(1450);

  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTimestamp, setVideoTimestamp] = useState('0:05');
  const [videoTitle, setVideoTitle] = useState('Auto-Detecting 40 Open Tabs');

  const [toastMessage, setToastMessage] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSuspendDemo = () => {
    if (demoState === 'active') {
      setDemoState('suspended');
      setDemoRam(120);
      triggerToast('Workspace Suspended! Saved ~450MB RAM');
    } else {
      setDemoState('active');
      setDemoRam(1450);
      triggerToast('Workspace Restored! Reopened 3 tabs');
    }
  };

  const jumpVideoTimestamp = (ts, title) => {
    setVideoTimestamp(ts);
    setVideoTitle(title);
    setIsVideoPlaying(true);
    triggerToast(`Jumped video to ${ts} - ${title}`);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. RESPONSIVE TOP NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">

          {/* Left: Brand Logo */}
          <div
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); triggerToast('Scroll to top'); }}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <TabFlowLogoSvg className="w-9 h-7 sm:w-10 sm:h-8 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                FLOW ZONE
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                WORKSPACE MANAGER
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Section Buttons */}
          <nav className="hidden md:flex items-center justify-center gap-8 flex-1 px-8">
            <a
              href="#overview"
              onClick={(e) => { e.preventDefault(); document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('overview'); }}
              className={`text-sm font-medium pb-1 transition ${activeNavTab === 'overview' ? 'text-black border-b-2 border-black font-semibold' : 'text-slate-600 hover:text-black'}`}
            >
              Overview
            </a>
            <a
              href="#ram-saving"
              onClick={(e) => { e.preventDefault(); document.getElementById('ram-saving')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('ram-saving'); }}
              className={`text-sm font-medium pb-1 transition ${activeNavTab === 'ram-saving' ? 'text-black border-b-2 border-black font-semibold' : 'text-slate-600 hover:text-black'}`}
            >
              RAM Saving
            </a>
            <a
              href="#overheating"
              onClick={(e) => { e.preventDefault(); document.getElementById('overheating')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('overheating'); }}
              className={`text-sm font-medium pb-1 transition ${activeNavTab === 'overheating' ? 'text-black border-b-2 border-black font-semibold' : 'text-slate-600 hover:text-black'}`}
            >
              Overheating Control
            </a>
            <a
              href="#easy-restore"
              onClick={(e) => { e.preventDefault(); document.getElementById('easy-restore')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('easy-restore'); }}
              className={`text-sm font-medium pb-1 transition ${activeNavTab === 'easy-restore' ? 'text-black border-b-2 border-black font-semibold' : 'text-slate-600 hover:text-black'}`}
            >
              Easy Restore
            </a>
            <a
              href="#plans"
              onClick={(e) => { e.preventDefault(); document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('plans'); }}
              className={`text-sm font-medium pb-1 transition ${activeNavTab === 'plans' ? 'text-black border-b-2 border-black font-semibold' : 'text-slate-600 hover:text-black'}`}
            >
              Plans
            </a>
          </nav>

          {/* Right: Actions & Social Icons */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-3 text-slate-600">
              <button onClick={() => triggerToast('Discord Community coming soon!')} className="hover:text-black transition" title="Discord"><DiscordIcon /></button>
              <button onClick={() => triggerToast('Reddit Community coming soon!')} className="hover:text-black transition" title="Reddit"><RedditIcon /></button>
              <button onClick={() => triggerToast('Follow @TabFlowApp on X')} className="hover:text-black transition" title="X"><XIcon /></button>
            </div>

            {localStorage.getItem('token') ? (
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-black transition"
              >
                Sign In
              </Link>
            )}
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
            >
              <ChromeIcon size={16} />
              Get Extension
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-black focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
            <nav className="flex flex-col gap-3 text-base font-medium text-slate-700">
              <a href="#overview" onClick={() => { setMobileMenuOpen(false); setActiveNavTab('overview'); }} className="py-1.5 border-b border-slate-100">Overview</a>
              <a href="#ram-saving" onClick={() => { setMobileMenuOpen(false); setActiveNavTab('ram-saving'); }} className="py-1.5 border-b border-slate-100">RAM Saving</a>
              <a href="#overheating" onClick={() => { setMobileMenuOpen(false); setActiveNavTab('overheating'); }} className="py-1.5 border-b border-slate-100">Overheating Control</a>
              <a href="#easy-restore" onClick={() => { setMobileMenuOpen(false); setActiveNavTab('easy-restore'); }} className="py-1.5 border-b border-slate-100">Easy Restore</a>
              <a href="#plans" onClick={() => { setMobileMenuOpen(false); setActiveNavTab('plans'); }} className="py-1.5 border-b border-slate-100">Plans</a>
            </nav>
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full py-3 bg-slate-100 text-slate-800 font-semibold text-sm rounded-full">Sign In</button>
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-blue-600 text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2"
              >
                <ChromeIcon size={18} /> Get Free Extension
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section id="overview" className="pt-14 sm:pt-20 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-black mb-6 leading-tight">
          Smarter Browser
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#2563EB] to-[#1D4ED8]"> Workspaces </span>
          with <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#2563EB] to-[#1D4ED8]">AI</span>
        </h1>

        <p className="text-base sm:text-xl text-[#5F6368] font-normal leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
          Your browser tab partner, grounded in the workspaces you save, built with Chrome Manifest V3 AI models.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 px-4">
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-black hover:bg-neutral-800 text-white font-medium text-base px-8 py-4 rounded-full transition shadow-md gap-3"
          >
            <ChromeIcon size={20} />
            Try FlowZone Free
          </a>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-base px-7 py-4 rounded-full transition border border-slate-200 gap-2 cursor-pointer shadow-sm"
          >
            <LogIn size={18} className="text-blue-600" /> Sign In / Register
          </button>
        </div>

        {/* Hero Feature Highlights matching exact user screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left pt-2">
          <div className="flex items-center gap-3.5 px-2">
            <Cloud size={32} className="text-[#3B82F6] flex-shrink-0 stroke-[1.75]" />
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-[#1E3A8A] leading-snug">Cloud Sync</h3>
              <span className="text-sm text-[#64748B] font-normal">Across Devices</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-2">
            <Lock size={30} className="text-[#3B82F6] flex-shrink-0 stroke-[1.75]" />
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-[#1E3A8A] leading-snug">Privacy First</h3>
              <span className="text-sm text-[#64748B] font-normal">Your data stays yours</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-2">
            <Sparkles size={30} className="text-[#3B82F6] flex-shrink-0 stroke-[1.75]" />
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-[#1E3A8A] leading-snug">AI Powered</h3>
              <span className="text-sm text-[#64748B] font-normal">Grounded in Gemini</span>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURE SECTION 1: "RAM Saving"                                       */}
      {/* ========================================================================= */}
      <section id="ram-saving" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Left Text Column with Lightning Icon */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black">
              <Zap size={28} className="stroke-[1.75]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black">
              RAM Saving
            </h2>
            <p className="text-base text-[#5F6368] font-normal leading-relaxed max-w-md">
              Free up to 96% of Chrome memory instantly. FlowZone automatically suspends dormant background tabs without closing them or losing your place.
            </p>
          </div>

          {/* Right Dark Card: RAM Saver Visual */}
          <div className="md:col-span-7 bg-black rounded-[32px] p-8 sm:p-10 text-white relative shadow-2xl overflow-hidden border border-neutral-800 min-h-[340px] flex flex-col justify-between">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ⚡ 1-CLICK INSTANT RAM RECLAIM
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 px-3 py-1 rounded-full">Saved 96% RAM</span>
            </div>

            {/* RAM Saved Counter & Progress Bar */}
            <div className="my-6 text-left space-y-4">
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-wider">
                3,260 <span className="text-lg text-neutral-400 font-sans">MB RAM Saved</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-neutral-400">
                  <span>Active Session Memory</span>
                  <span className="text-emerald-400 font-bold">140 MB / 3,400 MB</span>
                </div>
                <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full w-[96%] transition-all duration-1000" />
                </div>
              </div>
            </div>

            {/* Suspended Tabs Chips */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  45
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">45 Open Background Tabs</h4>
                  <p className="text-[11px] text-neutral-400">Suspended cleanly in background • 0% CPU strain</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURE SECTION 2: "Overheating Control"                              */}
      {/* ========================================================================= */}
      <section id="overheating" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Left Text Column with Flame Icon */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black">
              <Flame size={28} className="stroke-[1.75]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black">
              Overheating Control
            </h2>
            <p className="text-base text-[#5F6368] font-normal leading-relaxed max-w-md">
              Stop laptop fan noise and battery drain. FlowZone throttles heavy background tab scripts so your CPU stays cool and your laptop lasts hours longer.
            </p>
          </div>

          {/* Right Dark Card: Overheating Control Visual */}
          <div className="md:col-span-7 bg-black rounded-[32px] p-8 sm:p-10 text-white relative shadow-2xl overflow-hidden border border-neutral-800 min-h-[340px] flex flex-col justify-between">

            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 font-mono flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                ❄️ THERMAL PROTECTION ACTIVE
              </span>
              <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950 px-3 py-1 rounded-full">Cool & Silent Fan</span>
            </div>

            {/* Temperature & CPU Gauge comparison */}
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-neutral-900/90 border border-red-500/30 p-4 rounded-2xl text-left space-y-1">
                <div className="text-[10px] text-red-400 font-mono font-bold uppercase">Before FlowZone</div>
                <div className="text-2xl font-black font-mono text-red-500">85°C</div>
                <div className="text-[11px] text-neutral-400">CPU Load: 88% • Loud Fan</div>
              </div>
              <div className="bg-neutral-900/90 border border-emerald-500/50 p-4 rounded-2xl text-left space-y-1">
                <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">With FlowZone</div>
                <div className="text-2xl font-black font-mono text-emerald-400">42°C</div>
                <div className="text-[11px] text-neutral-400">CPU Load: 6% • Silent Fan</div>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  ❄️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Active Battery & Thermal Throttle</h4>
                  <p className="text-[11px] text-neutral-400">Extends battery life up to 3.5 hours per charge</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURE SECTION 3: "Easy Restore"                                      */}
      {/* ========================================================================= */}
      <section id="easy-restore" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Left Text Column with Refresh Icon */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black">
              <RefreshCw size={28} className="stroke-[1.75]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black">
              Easy Restore
            </h2>
            <p className="text-base text-[#5F6368] font-normal leading-relaxed max-w-md">
              Reopen your entire workspace session with a single click. Every URL, scroll position, and tab order is restored instantly with 0ms delay.
            </p>
          </div>

          {/* Right Dark Card: Easy Restore Visual */}
          <div className="md:col-span-7 bg-black rounded-[32px] p-8 sm:p-10 text-white relative shadow-2xl overflow-hidden border border-neutral-800 min-h-[340px] flex flex-col justify-between">

            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-300 font-mono flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                🟢 1-CLICK WORKSPACE RESTORE
              </span>
              <span className="text-xs text-purple-300 font-mono font-bold bg-purple-950 px-3 py-1 rounded-full">0ms Restore Delay</span>
            </div>

            {/* Workspace Restore Card */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl text-left my-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Deep Research Workspace</h4>
                </div>
                <span className="text-xs text-neutral-400 font-mono">45 Tabs</span>
              </div>
              <p className="text-xs text-neutral-400">All tabs preserved with full session state and scroll position.</p>
              <button 
                onClick={() => triggerToast('Restored 45 tabs in 0ms!')}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className="stroke-[2.5]" /> Restore All 45 Tabs
              </button>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl text-left flex items-center justify-between text-xs text-neutral-400">
              <span>Sync Status: Ready across Mac, Windows & Linux</span>
              <span className="text-emerald-400 font-bold">100% Intact</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. RAM CALCULATOR & PRESETS                                              */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-100">
        <div className="bg-white border border-slate-200 rounded-[28px] sm:rounded-3xl p-6 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Interactive Calculator</span>
            <h2 className="text-2xl sm:text-4xl font-normal text-black mt-2 mb-4">
              Calculate Your Memory Savings
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {[15, 35, 60, 100].map(val => (
                <button
                  key={val}
                  onClick={() => { setTabCount(val); triggerToast(`Set tab preset: ${val} tabs`); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${tabCount === val ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'}`}
                >
                  {val} Tabs
                </button>
              ))}
            </div>

            <div className="mb-8 sm:mb-10">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-700">Average Open Tabs:</label>
                <span className="text-xl sm:text-2xl font-extrabold text-blue-600 font-mono">{tabCount} Tabs</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={tabCount}
                onChange={(e) => setTabCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 block mb-1">RAM Saved</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">~{ramSavedGB} GB</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 block mb-1">Battery Boost</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">+{batteryBoost}%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 block mb-1">Speed Factor</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono">{speedBoost}x</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PLANS SECTION                                                          */}
      {/* ========================================================================= */}
      <section id="plans" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-100">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Plans & Access</span>
          <h2 className="text-2xl sm:text-4xl font-normal text-black mt-2">
            Simple, Transparent Plans
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Free Starter</h3>
              <p className="text-xs text-[#5F6368] mb-6">Essential tab management for everyday browsing.</p>
              <div className="text-4xl font-extrabold text-black mb-6">$0 <span className="text-xs font-normal text-slate-500">forever</span></div>

              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                <li className="flex items-center gap-3"><Check size={16} className="text-emerald-600" /> 5 Cloud-Synced Workspaces</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-emerald-600" /> Unlimited Local Workspaces</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-emerald-600" /> 1-Click Tab Suspension & RAM Saver</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-emerald-600" /> Chrome Side Panel Integration</li>
              </ul>
            </div>
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3.5 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-full transition block"
            >
              Get Started Free
            </a>
          </div>

          <div className="bg-white border-2 border-blue-600 p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Pro Member</h3>
              <p className="text-xs text-[#5F6368] mb-6">For power users, researchers, and developers.</p>
              <div className="text-4xl font-extrabold text-black mb-6">$4.99 <span className="text-xs font-normal text-slate-500">/ month</span></div>

              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                <li className="flex items-center gap-3"><Check size={16} className="text-blue-600" /> Everything in Free Plan</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-blue-600" /> Unlimited Cloud Workspace Sync</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-blue-600" /> Full Web Dashboard Access</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-blue-600" /> Unlimited AI Tab Categorization</li>
              </ul>
            </div>
            <button onClick={() => navigate('/upgrade')} className="w-full text-center py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full transition shadow-md">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION AT THE END                                              */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto border-t border-slate-100">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-black mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-left">
          {[
            {
              q: "How does FlowZone suspend tabs without losing data?",
              a: "FlowZone saves the precise URL, title, favicon, and tab position into your workspace state before instructing Chrome to close the tab. When you click Restore, FlowZone reopens the exact URL cleanly."
            },
            {
              q: "Does FlowZone require an internet connection or backend server?",
              a: "No! FlowZone operates 100% offline using local browser storage and local rule AI engines. If online, it optionally connects to Google Gemini 1.5 Flash API for cloud AI tab summaries."
            },
            {
              q: "How do I open FlowZone as a Chrome Side Panel?",
              a: "Once installed, click the FlowZone icon in your Chrome extensions toolbar. It will open directly inside Chrome's right sidebar (just like Apollo)."
            },
            {
              q: "Is my data private and secure?",
              a: "Yes. FlowZone only stores tab titles and URLs for your saved workspaces locally. We never track your browsing history or sell user telemetry."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-300 transition"
              onClick={() => toggleFaq(idx)}
            >
              <div className="p-6 flex justify-between items-center font-bold text-base text-black">
                <span>{item.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 10. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto text-xs text-[#5F6368]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-slate-100">
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-center gap-3">
              <TabFlowLogoSvg className="w-6 h-5" />
              <div className="flex flex-col">
                <span className="font-bold text-black text-sm leading-none">FLOW ZONE</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">WORKSPACE MANAGER</span>
              </div>
            </div>
            <p className="text-xs text-[#5F6368] max-w-md mt-2">
              FlowZone provides workspace management, tab suspension, and memory acceleration for Chrome.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 font-medium text-slate-700">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveNavTab('overview'); }} className="hover:text-black transition">Overview</button>
            <button onClick={() => { document.getElementById('ram-saving')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('ram-saving'); }} className="hover:text-black transition">RAM Saving</button>
            <button onClick={() => { document.getElementById('overheating')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('overheating'); }} className="hover:text-black transition">Overheating Control</button>
            <button onClick={() => { document.getElementById('easy-restore')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('easy-restore'); }} className="hover:text-black transition">Easy Restore</button>
            <button onClick={() => { document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('plans'); }} className="hover:text-black transition">Plans</button>
            <button onClick={() => { document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); setActiveNavTab('faq'); }} className="hover:text-black transition">FAQ</button>
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); }} className="hover:text-black transition">Sign In</button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#5F6368]">
          <div>© 2026 FlowZone Workspace Manager. All rights reserved.</div>
          <div className="flex gap-6 font-medium">
            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Privacy Policy</Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Terms of Service</Link>
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition"
            >
              Chrome Web Store
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
