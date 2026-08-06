import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { Check, Shield, CreditCard, ArrowLeft, ExternalLink, Sparkles, Globe, Lock } from 'lucide-react';

export default function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('lemonsqueezy'); // 'lemonsqueezy' | 'paddle' | 'card'

  // Lemon Squeezy / Paddle Global & Pakistan Payout Checkout URL
  const LEMON_SQUEEZY_CHECKOUT_URL = "https://flowzone.lemonsqueezy.com/buy/flowzone-pro";

  const handleCheckout = () => {
    setLoading(true);
    // Opens Lemon Squeezy / Paddle hosted checkout window
    setTimeout(() => {
      window.open(LEMON_SQUEEZY_CHECKOUT_URL, '_blank');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-9 h-7 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              FLOW ZONE
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">
              PRO MEMBERSHIP
            </span>
          </div>
        </Link>

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-xl w-full bg-white border border-slate-200 p-8 sm:p-12 rounded-[32px] shadow-xl relative">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-6">
            <Globe size={13} /> Supports Pakistan Payouts via Payoneer & Wise
          </div>

          <h2 className="text-3xl sm:text-4xl font-normal text-black mb-2">
            Upgrade to Pro
          </h2>
          <p className="text-sm text-[#5F6368] mb-8">
            Unlock unlimited Gemini 1.5 AI tab categorization, priority cloud workspace sync, and zero tab memory limits.
          </p>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-sm font-bold text-slate-900">FlowZone Pro Annual Pass</span>
              <div className="text-3xl font-extrabold text-black font-mono">
                $4.99 <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Google Gemini 1.5 Flash Cloud AI API integration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Unlimited Cloud Workspace Backup & Sync</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Supports Debit/Credit Cards in Pakistan & Globally</span>
              </li>
            </ul>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 mb-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Merchant Payment Gateway:
            </label>

            <div 
              onClick={() => setPaymentMethod('lemonsqueezy')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${paymentMethod === 'lemonsqueezy' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍋</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Lemon Squeezy Checkout (Recommended)</div>
                  <div className="text-[11px] text-slate-500">Supports Pakistani debit/credit cards, Payoneer & Wise payouts</div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'lemonsqueezy'} readOnly className="accent-blue-600" />
            </div>

            <div 
              onClick={() => setPaymentMethod('paddle')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${paymentMethod === 'paddle' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Paddle Global Checkout</div>
                  <div className="text-[11px] text-slate-500">Merchant of Record for Pakistan & international buyers</div>
                </div>
              </div>
              <input type="radio" checked={paymentMethod === 'paddle'} readOnly className="accent-blue-600" />
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-medium text-base rounded-full transition shadow-lg flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            {loading ? 'Opening Checkout...' : 'Proceed to Checkout ($4.99)'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
            <Shield size={13} /> 256-bit SSL Encryption • Cancel anytime
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400">
        © 2026 FlowZone Pro • Lemon Squeezy & Paddle MoR Compliant
      </footer>

    </div>
  );
}
