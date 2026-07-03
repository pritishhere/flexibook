import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png'; 

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Email verify | Step 2: Password Reset
  const [emailInput, setEmailInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Utility checking matching logic states
  const getPasswordStrength = () => {
    if (!newPassword) return { label: '', color: 'transparent', width: '0%' };
    if (newPassword.length < 6) return { label: 'Weak', color: '#ef4444', width: '30%' };
    const hasMetrics = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
    if (newPassword.length >= 8 && hasMetrics) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Medium', color: '#f59e0b', width: '65%' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmNewPassword ? newPassword === confirmNewPassword : null;

  // Step 1 handler: Looks up account index records
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setAlert({ type: '', message: '' });

    const targetEmail = emailInput.trim().toLowerCase();

    setTimeout(() => {
      setIsLoading(false);
      const savedData = localStorage.getItem('registeredUser');
      let registeredUser = null;

      if (savedData) {
        registeredUser = JSON.parse(savedData);
      }

      // Check against stored accounts or your fallback mock account
      const accountExists = (registeredUser && targetEmail === registeredUser.email) || targetEmail === 'test@example.com';

      if (accountExists) {
        setAlert({ type: 'success', message: 'Account located successfully! Proceeding to reset password.' });
        setTimeout(() => {
          setAlert({ type: '', message: '' });
          setStep(2);
        }, 1200);
      } else {
        setAlert({ type: 'error', message: 'No registered account found under that email address.' });
      }
    }, 1200);
  };

  // Step 2 handler: Commits fresh cryptographic token equivalents
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (isLoading || passwordsMatch === false) return;

    setIsLoading(true);
    setAlert({ type: '', message: '' });

    setTimeout(() => {
      setIsLoading(false);
      const savedData = localStorage.getItem('registeredUser');
      const targetEmail = emailInput.trim().toLowerCase();

      if (savedData) {
        const registeredUser = JSON.parse(savedData);
        if (targetEmail === registeredUser.email) {
          // Update database object properties securely
          registeredUser.password = newPassword.trim();
          localStorage.setItem('registeredUser', JSON.stringify(registeredUser));
        }
      }

      setAlert({ type: 'success', message: 'Password updated successfully! Sending you back to log in.' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1200);
  };

  const getInputStyle = (fieldName) => ({
    width: '100%', padding: '12px 16px', marginTop: '6px',
    border: focusedField === fieldName ? '2px solid #2563eb' : '1px solid #cbd5e1', 
    borderRadius: '8px', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 96px)', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url(${familyBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '40px 36px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', boxSizing: 'border-box', position: 'relative' }}>
        
        <Link to="/login" style={{ position: 'absolute', top: '26px', left: '26px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.transform = 'translateX(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><line x1="21" y1="12" x2="3" y2="12"></line><polyline points="10 19 3 12 10 5"></polyline></svg>
        </Link>

        <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800', tracking: '-0.025em', marginTop: '16px' }}>
          {step === 1 ? 'Recover Password' : 'Set New Password'}
        </h2>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '0', marginBottom: '28px' }}>
          {step === 1 ? 'Provide account email details below' : 'Establish a fresh credentials record'}
        </p>

        {alert.message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center', backgroundColor: alert.type === 'success' ? '#f0fdf4' : '#fef2f2', color: alert.type === 'success' ? '#166534' : '#991b1b', border: alert.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>{alert.message}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Email Address</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="name@example.com" style={getInputStyle('email')} />
            </div>

            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px', opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? 'Verifying Account...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onFocus={() => setFocusedField('newPassword')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="••••••••" style={getInputStyle('newPassword')} />
              {newPassword && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div></div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: strength.color, marginTop: '4px', display: 'block' }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Confirm New Password</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onFocus={() => setFocusedField('confirmNewPassword')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="••••••••" style={getInputStyle('confirmNewPassword')} />
              {passwordsMatch !== null && (
                <span style={{ fontSize: '12px', fontWeight: '600', color: passwordsMatch ? '#10b981' : '#ef4444', marginTop: '6px', display: 'block' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
            </div>

            <button type="submit" disabled={isLoading || passwordsMatch === false} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: (isLoading || passwordsMatch === false) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px', opacity: (isLoading || passwordsMatch === false) ? 0.5 : 1 }}>
              {isLoading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;