import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

// 🔴 TRACKER LOGIC
const trackUserAction = (actionName, details = {}) => {
  const time = new Date().toLocaleString();
  const logData = { action: actionName, details, time };
  console.log(`%c🚀 [TRACKER] ${actionName}`, 'color: #0ea5e9; font-weight: bold; font-size: 13px;', logData);
  const existingLogs = JSON.parse(localStorage.getItem('flexibook_activity_logs')) || [];
  existingLogs.push(logData);
  localStorage.setItem('flexibook_activity_logs', JSON.stringify(existingLogs));
};

// 🛡️ ULTRA PRO MAX SECURITY: Compare entered password with Saved Salt + Hash
const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    trackUserAction('LOGIN_ATTEMPT', { email: email.toLowerCase() });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Invalid email or password. Please try again.');
        trackUserAction('LOGIN_FAILED', { email: email.toLowerCase() });
        setIsLoading(false);
        return;
      }

      // SUCCESS! Store JWT token and user info from server
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }));

      trackUserAction('LOGIN_SUCCESSFUL', { email: data.email, name: data.name });
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection to authorization server failed. Please check if the server is running.');
      trackUserAction('LOGIN_ERROR', { email: email.toLowerCase(), error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch font-sans bg-white selection:bg-indigo-500 selection:text-white overflow-hidden relative z-10" style={{ minHeight: 'calc(100vh - 80px)' }}>
      
      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes conic-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes border-breathe { 0% { border-color: rgba(99, 102, 241, 0.2); box-shadow: 0 0 0px rgba(99,102,241,0); } 50% { border-color: rgba(99, 102, 241, 0.7); box-shadow: 0 0 12px rgba(99,102,241,0.4); } 100% { border-color: rgba(99, 102, 241, 0.2); box-shadow: 0 0 0px rgba(99,102,241,0); } }
        @keyframes laser-scan { 0% { top: -20%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 120%; opacity: 0; } }
        @keyframes glass-glare { 0% { left: -150%; } 100% { left: 150%; } }
        .animate-blob { animation: blob 10s infinite alternate cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .animate-conic-spin { animation: conic-spin 3s linear infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .stagger-1 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .stagger-2 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .stagger-3 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
      `}</style>

      {/* LEFT SIDE: DEEP SPACE VAULT */}
      <div className="hidden lg:flex w-5/12 bg-[#050505] text-white flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full animate-blob"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
        </div>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        <div className="relative z-10 flex items-center gap-3 w-fit cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span className="text-black text-2xl font-black">F</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">FlexiBook</span>
        </div>
        <div className="relative z-10 my-auto stagger-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Authentication
          </div>
          <h1 className="text-5xl xl:text-[4rem] font-black leading-[1.05] mb-6 tracking-tight">
            Unlock the <br />
            future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">booking.</span>
          </h1>
          <p className="text-lg xl:text-xl text-white/50 font-medium max-w-sm leading-relaxed">Experience lightning-fast access to your personalized dashboard. Safe, secure, and beautiful.</p>
        </div>
        <div className="relative z-10 text-xs font-medium text-white/30 flex items-center gap-2 mt-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure SHA-256 Authentication
        </div>
      </div>

      {/* RIGHT SIDE: LIQUID MESH GRADIENT & ANIMATED GLASS CARD */}
      <div className="w-full lg:w-7/12 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#fafcff]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[0%] left-[20%] w-[600px] h-[600px] bg-purple-300/40 rounded-full mix-blend-multiply blur-[120px] animate-blob"></div>
          <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-cyan-300/40 rounded-full mix-blend-multiply blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[0%] left-[10%] w-[700px] h-[700px] bg-pink-300/30 rounded-full mix-blend-multiply blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10 stagger-2 group/card perspective-1000">
          <button onClick={() => navigate('/')} className="mb-6 flex lg:hidden items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </button>

          <div className="relative p-[1.5px] rounded-[2rem] hover:-translate-y-3 transition-all duration-700 ease-out hover:shadow-[0_40px_100px_-20px_rgba(99,102,241,0.3)]">
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#6366f1_30%,transparent_60%)] animate-conic-spin opacity-0 group-hover/card:opacity-100 transition-opacity duration-[800ms]"></div>
            
            <div className="relative bg-white/90 backdrop-blur-3xl rounded-[calc(2rem-1.5px)] p-8 sm:p-10 h-full w-full border border-white/60 overflow-hidden">
              <div className="absolute top-0 -left-[150%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-30deg] pointer-events-none transition-all group-hover/card:animate-[glass-glare_1.5s_ease-in-out]"></div>

              <div className="text-center mb-10 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 group-hover/card:text-indigo-600 transition-colors duration-500">Welcome Back</h2>
                <p className="text-sm font-semibold text-slate-500">Log in to manage your appointments.</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5 stagger-3 relative z-10">
                
                {/* 🔴 FIXED: Placeholder changed to general */}
                <div className="flex flex-col gap-1.5 relative group">
                  <label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" /></div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-3.5 bg-white/80 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:animate-[border-breathe_2s_infinite] transition-all duration-300" placeholder="name@example.com" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 relative group">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Password</label>
                    <a href="#" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" /></div>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-11 pr-12 py-3.5 bg-white/80 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:animate-[border-breathe_2s_infinite] transition-all duration-300" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                </div>
                
                {error && <p className="text-[12px] font-bold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>{error}</p>}

                {/* SUBMIT BUTTON */}
                <button type="submit" disabled={isLoading} className="relative overflow-hidden w-full py-4 mt-4 bg-slate-900 text-white text-[15px] font-black rounded-xl hover:bg-indigo-600 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] transition-all duration-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn">
                  <div className="absolute left-0 w-full h-[2px] bg-cyan-300 shadow-[0_0_12px_3px_rgba(103,232,249,1)] opacity-0 group-hover/btn:animate-[laser-scan_1.5s_linear_infinite]"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In Securely'}
                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />}
                  </span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col gap-3 stagger-3 relative z-10">
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white/60 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all text-slate-700 font-bold text-[13px]">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                  Continue with Google
                </button>
              </div>

              {/* Redirect Link */}
              <div className="mt-6 text-center stagger-3 relative z-10">
                <p className="text-[13px] font-semibold text-slate-600">
                  New to FlexiBook?{' '}
                  <Link to="/signup" onClick={() => trackUserAction('NAVIGATED_TO_SIGNUP_FROM_LOGIN')} className="relative inline-block text-indigo-600 font-black overflow-hidden group/link">
                    <span className="relative z-10 transition-colors group-hover/link:text-indigo-800">Create an account</span>
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600 transform -translate-x-full group-hover/link:translate-x-0 transition-transform duration-300 ease-out"></span>
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;