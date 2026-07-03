import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png'; 

const CustomerRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [focusedField, setFocusedField] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Weak (Too short)', color: '#ef4444', width: '30%' };
    const hasMetrics = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
    if (password.length >= 8 && hasMetrics) return { label: 'Strong (Secure)', color: '#10b981', width: '100%' };
    return { label: 'Medium', color: '#f59e0b', width: '65%' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword ? password === confirmPassword : null;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms || isLoading || passwordsMatch === false) return;

    setIsLoading(true);
    
    // Clean data formatting values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      setIsLoading(false);

      // 1. SAVE PROFILE DATA TO STORE
      const userData = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword
      };
      localStorage.setItem('registeredUser', JSON.stringify(userData));

      // 2. FORCE INSTANT SIGN-IN SESSION FLAGS
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserEmail', cleanEmail);

      // 3. SECURE SEAMLESS BYPASS REDIRECT
      alert(`Welcome aboard, ${cleanName}! Taking you straight to your account...`);
      navigate('/'); 
    }, 1500);
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
        
        {/* Clean Back Navigation to Home View */}
        <Link to="/" style={{ position: 'absolute', top: '26px', left: '26px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.transform = 'translateX(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><line x1="21" y1="12" x2="3" y2="12"></line><polyline points="10 19 3 12 10 5"></polyline></svg>
        </Link>

        <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800', tracking: '-0.025em', marginTop: '16px' }}>Create Customer Account</h2>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '0', marginBottom: '28px' }}>Join FlexiBook today to manage your bookings</p>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Full Name</label>
            <input type="text" name="name" value={name} onChange={onChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="John Doe" style={getInputStyle('name')} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Email Address</label>
            <input type="email" name="email" value={email} onChange={onChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="you@example.com" style={getInputStyle('email')} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Password</label>
            <input type="password" name="password" value={password} onChange={onChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="••••••••" style={getInputStyle('password')} />
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: strength.color, marginTop: '4px', display: 'block' }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')} required disabled={isLoading} placeholder="••••••••" style={getInputStyle('confirmPassword')} />
            {passwordsMatch !== null && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: passwordsMatch ? '#10b981' : '#ef4444', marginTop: '6px', display: 'block' }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '13px', cursor: 'pointer', lineHeight: '1.4' }}>
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} disabled={isLoading} style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#2563eb' }} />
              <span>I agree to the <span style={{ color: '#2563eb', fontWeight: '600' }}>Terms of Service</span> and <span style={{ color: '#2563eb', fontWeight: '600' }}>Privacy Policy</span>.</span>
            </label>
          </div>

          <button type="submit" disabled={!agreeTerms || isLoading || passwordsMatch === false} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: (!agreeTerms || isLoading || passwordsMatch === false) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', opacity: (!agreeTerms || isLoading || passwordsMatch === false) ? 0.5 : 1 }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;