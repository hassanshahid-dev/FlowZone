import React from 'react';
import { Link } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { ArrowLeft, FileText, CheckCircle2, Shield, Scale } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      
      {/* Header Navigation */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-9 h-7 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              TAB FLOW
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">
              TERMS OF SERVICE
            </span>
          </div>
        </Link>

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Terms Document Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-6">
          <Scale size={13} /> Terms & User Agreement
        </div>

        <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-black mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-[#5F6368] mb-12">
          Last Updated: February 2026 • Effective Immediately
        </p>

        <div className="space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1: Acceptance */}
          <section className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="flex items-center gap-2.5 text-black font-bold text-lg">
              <FileText size={20} className="text-blue-600" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p className="text-slate-600">
              By installing the <strong>TabFlow Chrome Extension</strong> or creating an account on the <strong>TabFlow Web Dashboard</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please uninstall the extension and discontinue use of the service.
            </p>
          </section>

          {/* Section 2: Use License & Services */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">2. Grant of License & Usage Rights</h2>
            <p>
              TabFlow grants you a personal, non-exclusive, non-transferable license to use the TabFlow Chrome extension and web application for workspace tab management, RAM suspension, and AI tab categorization in accordance with your chosen plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Free Starter Plan</strong>: Free for personal use with unlimited local tab workspace saving and RAM suspension.</li>
              <li><strong>Pro Subscription Plan</strong>: Unlocks unlimited multi-browser cloud workspace syncing and priority Google Gemini 1.5 Flash cloud AI categorization.</li>
            </ul>
          </section>

          {/* Section 3: Payments & Subscriptions */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">3. Billing & Pro Subscription Terms</h2>
            <p>
              Pro subscriptions ($4.99/month) are processed securely through our Merchant of Record partners (Lemon Squeezy / Paddle). Payments are billed on a recurring monthly or annual basis. You may cancel your subscription at any time via your account upgrade dashboard.
            </p>
          </section>

          {/* Section 4: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black">4. Limitation of Liability</h2>
            <p>
              TabFlow provides workspace management and memory suspension features "as is". While TabFlow takes extensive measures to ensure tab URLs and session states are safely saved in local storage, TabFlow is not responsible for data loss resulting from unexpected browser crashes, device hardware failure, or third-party extension conflicts.
            </p>
          </section>

          {/* Section 5: Modifications & Contact */}
          <section className="space-y-3 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-black">5. Contact Information</h2>
            <p>
              For any legal or service inquiry regarding these Terms of Service, please reach out to <strong>support@tabflow.dev</strong>.
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
                <span className="font-bold text-black text-sm leading-none">TAB FLOW</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">WORKSPACE MANAGER</span>
              </div>
            </div>
            <p className="text-xs text-[#5F6368] max-w-md mt-2">
              TabFlow provides workspace management, tab suspension, and memory acceleration for Chrome.
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
          <div>© 2026 TabFlow Workspace Manager. All rights reserved.</div>
          <div className="flex gap-6 font-medium">
            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition">Privacy Policy</Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="font-bold text-black border-b border-black pb-0.5">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
