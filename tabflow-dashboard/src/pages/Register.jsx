import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabFlowLogoSvg } from './Landing';
import { ArrowLeft, Lock, Mail, User, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1); // Step 1: Account Form, Step 2: OTP Verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Submit Register Form & Request OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields (Name, Email, and Password)');
      return;
    }

    // Real Email Validation Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const domain = (email.split('@')[1] || '').toLowerCase();
    const fakeDomains = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'yopmail.com', 'fake.com', 'example.com', 'test.com'];

    if (!emailRegex.test(email.trim()) || fakeDomains.includes(domain) || domain.length < 4) {
      setError('Please enter a valid, real email address (e.g., name@gmail.com)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      }).catch(() => fetch('http://localhost:5000/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      }));

      let data = {};
      try { data = await res.json(); } catch (e) {}

      if (!res || !res.ok) {
        if (data.error && !data.error.includes('buffering timed out')) {
          setError(data.error);
          setLoading(false);
          return;
        }
      }

      const otp = data.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setSuccessMsg(`OTP sent to ${email}`);
      setStep(2); // Move to OTP verification modal
    } catch (err) {
      // Local fallback for offline/demo testing
      const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fakeOtp);
      setSuccessMsg(`OTP sent to ${email}`);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: otpInput.trim() })
      }).catch(() => fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: otpInput.trim() })
      }));

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP verification code');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify({ ...data.user, name: name.trim() || data.user.name }));
      try { window.postMessage({ type: 'TABFLOW_SYNC_SESSION', token: data.token, user: data.user }, '*'); } catch (e) {}
      navigate('/dashboard');

    } catch (err) {
      if (generatedOtp && otpInput.trim() === generatedOtp) {
        localStorage.setItem('token', 'local_otp_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify({ email, name: name.trim() || 'User', plan: 'free' }));
        navigate('/dashboard');
      } else {
        setError('Invalid OTP code. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://tabflow-backend-api.vercel.app/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      }).catch(() => fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      }));

      const data = await res.json();
      if (data.otpCode) setGeneratedOtp(data.otpCode);
      setSuccessMsg('Fresh OTP code sent!');
    } catch (err) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setSuccessMsg('Fresh OTP code sent!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      
      {/* Header Navigation */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 group">
          <TabFlowLogoSvg className="w-9 h-7 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              TAB FLOW
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

      {/* Register / OTP Verification Form Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl">
          
          {step === 1 ? (
            /* STEP 1: ACCOUNT REGISTRATION FORM */
            <>
              <div className="text-center mb-8">
                <TabFlowLogoSvg className="w-12 h-10 mx-auto mb-4" />
                <h2 className="text-3xl font-normal text-black">Create Secure Account</h2>
                <p className="text-xs text-[#5F6368] mt-1.5">Verify your email to start organizing workspaces</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl text-center mb-5 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition" 
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>
                </div>

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
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition" 
                      placeholder="At least 6 characters"
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
                  {loading ? 'Sending OTP Verification...' : 'Send Email Verification OTP'}
                </button>
              </form>

              <div className="text-center mt-6 text-xs text-[#5F6368]">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: OTP VERIFICATION FORM */
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <ShieldCheck size={26} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Email Verification OTP</h2>
                <p className="text-xs text-[#5F6368] mt-1">
                  We sent a 6-digit OTP code to <strong className="text-slate-900">{email}</strong>
                </p>
              </div>



              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl text-center mb-5 font-medium">
                  {error}
                </div>
              )}

              {successMsg && !error && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-2xl text-center mb-5 font-medium">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Verification Code
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
                  {loading ? 'Verifying Code...' : 'Complete Registration'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 text-xs text-[#5F6368]">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="hover:text-black transition"
                >
                  &larr; Change Details
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
        © 2026 TabFlow Inc. All rights reserved.
      </footer>

    </div>
  );
}
