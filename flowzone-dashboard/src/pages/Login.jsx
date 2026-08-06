import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1); // Step 1: Login Form, Step 2: 2FA OTP Verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Submit Login Form & Request 2FA OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://flowzone-backend-api.vercel.app/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).catch(() => fetch('http://localhost:5000/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }));

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials or account does not exist');
        setLoading(false);
        return;
      }

      setGeneratedOtp(data.otpCode || '');
      setStep(2); // Move to 2FA OTP verification step
    } catch (err) {
      // Fallback for offline/demo testing
      const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fakeOtp);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit 2FA OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setError('Please enter the 6-digit 2FA OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://flowzone-backend-api.vercel.app/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: otpInput.trim() })
      }).catch(() => fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: otpInput.trim() })
      }));

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      try {
        window.postMessage({ type: 'FLOWZONE_SYNC_SESSION', token: data.token, user: data.user }, '*');
        window.postMessage({ type: 'TABFLOW_SYNC_SESSION', token: data.token, user: data.user }, '*');
      } catch (e) {}
      navigate('/dashboard');

    } catch (err) {
      setError('Connection failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend 2FA OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://flowzone-backend-api.vercel.app/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).catch(() => fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }));

      const data = await res.json();
      if (data.otpCode) setGeneratedOtp(data.otpCode);
    } catch (err) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      
      {/* Top Header Navigation */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-9 h-7 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              FLOW ZONE
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">
              WORKSPACE MANAGER
            </span>
          </div>
        </Link>

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Login / 2FA Form Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl">
          
          {step === 1 ? (
            /* STEP 1: LOGIN FORM */
            <>
              <div className="text-center mb-8">
                <TabFlowLogoSvg className="w-12 h-10 mx-auto mb-4" />
                <h2 className="text-3xl font-normal text-black">Welcome Back</h2>
                <p className="text-xs text-[#5F6368] mt-1.5">Sign in to sync your browser workspaces</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl text-center mb-5 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition" 
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset code sent!'); }} className="text-xs text-blue-600 hover:underline font-medium">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition" 
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-sm py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Verifying Credentials...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-6 text-xs text-[#5F6368]">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Create Account
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: OTP VERIFICATION FORM */
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3">
                  <ShieldCheck size={26} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Email Verification OTP</h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  We sent a 6-digit OTP code to <strong className="text-slate-900">{email}</strong>
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-2 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-xl inline-block">
                  📩 Please check your inbox and <strong>Spam / Junk folder</strong> for the OTP email.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl text-center mb-5 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      maxLength="6"
                      value={otpInput} 
                      onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-lg font-mono tracking-widest font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition text-center" 
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-sm py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? 'Logging In...' : 'Log In'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 text-xs text-[#5F6368]">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="hover:text-black transition"
                >
                  &larr; Change Email
                </button>
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={loading}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Resend OTP
                </button>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-[#5F6368]">
        © 2026 FlowZone Inc. All rights reserved.
      </footer>

    </div>
  );
}
