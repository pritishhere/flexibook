// src/LoginPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png';

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('email');
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapsLocked, setIsCapsLocked] = useState(false);

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const { email, phone, password } = formData;
  const navigate = useNavigate();

  useEffect(() => {
    if (loginMode === 'email' && emailRef.current) emailRef.current.focus();
    else if (loginMode === 'phone' && phoneRef.current) phoneRef.current.focus();
  }, [loginMode]);

  const onChange = (e) => {
    if (e.target.name === 'phone') {
      const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [e.target.name]: onlyDigits });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) setIsCapsLocked(true);
    else setIsCapsLocked(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setAlert({ type: '', message: '' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      setIsLoading(false);

      const savedData = localStorage.getItem('registeredUser');
      let registeredUser = null;
      if (savedData) {
        registeredUser = JSON.parse(savedData);
      }

      // 1. MASTER ADMIN BYPASS
      if (cleanEmail === 'admin' && cleanPassword === 'admin') {
        setAlert({ type: 'success', message: 'Master Admin Access Granted!' });
        setTimeout(() => navigate('/'), 1200);
        return;
      }

      // 2. DYNAMIC STORED PROFILE RECORD VALIDATION
      if (registeredUser && cleanEmail === registeredUser.email && cleanPassword === registeredUser.password) {
        setAlert({ type: 'success', message: `Welcome back, ${registeredUser.name}! Redirecting...` });
        localStorage.setItem('isAuthenticated', 'true');
        setTimeout(() => navigate('/'), 1200);
      }
      // 3. SECURE LOCAL MACHINE MOCK CREDENTIAL CHECK
      else if (loginMode === 'email' && cleanEmail === 'test@example.com' && cleanPassword === 'password123') {
        setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
        localStorage.setItem('isAuthenticated', 'true');
        setTimeout(() => navigate('/'), 1200);
      } else {
        setAlert({ type: 'error', message: 'Invalid credentials. Please try again.' });
      }
    }, 1500);
  };

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: fieldName === 'password' ? '12px 45px 12px 16px' : '12px 16px',
    marginTop: '6px',
    border: focusedField === fieldName ? '2px solid #2563eb' : '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
  });

  return (
    <div style={{
      minHeight: 'calc(100vh - 96px)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url(${familyBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 36px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        position: 'relative'
      }}>

        <Link to="/" style={{
          position: 'absolute',
          top: '26px',
          left: '26px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s'
        }} onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateX(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
            <line x1="21" y1="12" x2="3" y2="12"></line>
            <polyline points="10 19 3 12 10 5"></polyline>
          </svg>
        </Link>

        <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em', marginTop: '16px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '0', marginBottom: '24px' }}>Please sign in to your FlexiBook account</p>

        <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.08)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
          <button type="button" disabled={isLoading} onClick={() => setLoginMode('email')} style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: loginMode === 'email' ? '#ffffff' : 'transparent',
            color: loginMode === 'email' ? '#0f172a' : '#64748b',
            boxShadow: loginMode === 'email' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
          }}>Email Address</button>
          <button type="button" disabled={isLoading} onClick={() => setLoginMode('phone')} style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: loginMode === 'phone' ? '#ffffff' : 'transparent',
            color: loginMode === 'phone' ? '#0f172a' : '#64748b',
            boxShadow: loginMode === 'phone' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
          }}>Phone Number</button>
        </div>

        {alert.message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            backgroundColor: alert.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: alert.type === 'success' ? '#166534' : '#991b1b',
            border: alert.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca'
          }}>{alert.message}</div>
        )}

        <form onSubmit={onSubmit}>
          {loginMode === 'email' ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Email Address</label>
              <input ref={emailRef} type="email" name="email" value={email} onChange={onChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="name@example.com" style={getInputStyle('email')} />
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Phone Number</label>
              <input ref={phoneRef} type="tel" name="phone" value={phone} onChange={onChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')} required maxLength={10} disabled={isLoading} placeholder="Enter 10-digit number" style={getInputStyle('phone')} />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={onChange} onKeyDown={handleKeyDown} onKeyUp={handleKeyDown} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="••••••••" style={getInputStyle('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '56%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"></path></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {isCapsLocked && (
              <div style={{ color: '#b45309', fontSize: '12px', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠️</span> Caps Lock is active
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', fontSize: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }} />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading} style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            opacity: isLoading ? 0.8 : 1
          }}>
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Sign Up</Link>
        </div>

        {/* Business Owner Sign In Link */}
        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }}>
          Are you a business owner?{' '}
          <Link to="/business-login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Sign In here</Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;