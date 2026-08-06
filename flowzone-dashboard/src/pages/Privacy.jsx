import React from 'react';
import { Link } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { ArrowLeft, Shield, Lock, Eye, Database, Server } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      
      {/* Header Navigation */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-9 h-7 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              FLOW ZONE
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">
              PRIVACY POLICY
            </span>
          </div>
        </Link>

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Privacy Policy Document Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-6">
          <Shield size={13} /> Privacy First • 100% Local Encryption Guaranteed
        </div>

        <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-black mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#5F6368] mb-12">
          Last Updated: February 2026 • Effective Immediately
        </p>

        <div className="space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1: Core Privacy Commitment */}
          <section className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="flex items-center gap-2.5 text-black font-bold text-lg">
              <Lock size={20} className="text-blue-600" />
              <h2>1. Our Privacy Commitment</h2>
            </div>
            <p className="text-slate-600">
              At <strong>FlowZone Workspace Manager</strong>, we believe that your browsing history and research data belong entirely to you. We design our browser extension and web platform with a <strong>Privacy-First architecture</strong>. We do not track, sell, or rent your personal browsing telemetry or workspace data.
            </p>
          </section>

          {/* Section 2: Data Collection & Usage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">2. Data We Collect and How We Use It</h2>
            <p>
              FlowZone requires minimal permissions to provide workspace management, memory suspension, and AI tab categorization:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Tab Metadata (URLs, Titles, Favicons)</strong>: Processed locally inside your browser to display workspaces and manage open tab tabs.
              </li>
              <li>
                <strong>Account Information</strong>: If you sign up for cloud workspace backup, we securely store your email address and encrypted password hash (`bcrypt`).
              </li>
              <li>
                <strong>AI Tab Categorization</strong>: When using offline mode, zero data leaves your machine. When using Google Gemini 1.5 Flash cloud AI, tab titles are sent securely over HTTPS directly to Google AI endpoints.
              </li>
            </ul>
          </section>

          {/* Section 3: Data Storage & Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">3. Data Storage and Local Encryption</h2>
            <p>
              Your workspaces, color tags, and tab pin preferences are stored in your Chrome browser's sandboxed local storage (`chrome.storage.local`). All data stored locally is isolated from third-party websites and hidden from external scrapers.
            </p>
          </section>

          {/* Section 4: Third-Party Services */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">4. Third-Party Services</h2>
            <p>
              FlowZone integrates only with trusted, industry-compliant service providers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Vercel</strong>: Hosting for web app static assets.</li>
              <li><strong>Google Gemini AI API</strong>: Optional cloud AI categorization engine.</li>
              <li><strong>Lemon Squeezy / Paddle</strong>: Merchant of Record payment processing for Pro upgrades.</li>
            </ul>
          </section>

          {/* Section 5: Your Rights & Contact */}
          <section className="space-y-3 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-black">5. Your Data Control & Export Rights</h2>
            <p>
              You can export or permanently delete your entire workspace history at any time using the 1-click **JSON Backup Export** feature inside the FlowZone side panel extension settings.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              If you have any questions regarding this Privacy Policy, please contact our team at <strong>privacy@flowzone.dev</strong>.
            </p>
          </section>

        </div>

      </main>

      {/* Full Navigation Footer */}
      <footer className="border-t border-slate-200 py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full text-xs text-[#5F6368] mt-16">
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
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Overview</Link>
            <Link to="/#insights" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Instant Insights</Link>
            <Link to="/#sources" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Citations</Link>
            <Link to="/#video-demo" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Video Demo</Link>
            <Link to="/#plans" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Plans</Link>
            <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Sign In</Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#5F6368]">
          <div>© 2026 FlowZone Workspace Manager. All rights reserved.</div>
          <div className="flex gap-6 font-medium">
            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="font-bold text-black border-b border-black pb-0.5">Privacy Policy</Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
