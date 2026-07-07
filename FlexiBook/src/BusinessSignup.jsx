// src/BusinessSignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png';

const BusinessSignUp = () => {
  const navigate = useNavigate();
  const [focusedField, setFocusedField] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyTaxId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { companyName, companyTaxId, email, password, confirmPassword } = formData;

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
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        name: companyName.trim(),
        taxId: companyTaxId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: 'business'
      };
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserEmail', userData.email);

      alert(`Welcome aboard, ${userData.name}! Taking you straight to your business platform...`);
      navigate('/');
    }, 1500);
  };

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    marginTop: '6px',
    border: focusedField === fieldName ? '2px solid #10b981' : '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(16, 185, 129, 0.15)' : 'none'
  });

  const getPasswordInputStyle = (fieldName) => ({
    ...getInputStyle(fieldName),
    paddingRight: '44px'
  });

  const EyeIcon = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  );

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        
        <Link to="/signup" style={styles.backBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
            <line x1="21" y1="12" x2="3" y2="12"></line>
            <polyline points="10 19 3 12 10 5"></polyline>
          </svg>
        </Link>

        <h2 style={styles.title}>Create Corporate Account</h2>
        <p style={styles.subtitle}>Register your firm to manage your operations</p>
        
        <form onSubmit={onSubmit}>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={styles.label}>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={companyName}
              onChange={onChange}
              onFocus={() => setFocusedField('companyName')}
              onBlur={() => setFocusedField('')}
              required
              style={getInputStyle('companyName')}
              placeholder="Acme Corporation"
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={styles.label}>Company Registration No. / Tax ID</label>
            <input
              type="text"
              name="companyTaxId"
              value={companyTaxId}
              onChange={onChange}
              onFocus={() => setFocusedField('companyTaxId')}
              onBlur={() => setFocusedField('')}
              required
              style={getInputStyle('companyTaxId')}
              placeholder="CRN-12345-XYZ"
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={styles.label}>Corporate Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              required
              style={getInputStyle('email')}
              placeholder="partnerships@company.com"
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                style={getPasswordInputStyle('password')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: strength.color, marginTop: '4px', display: 'block' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                required
                style={getPasswordInputStyle('confirmPassword')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
            {passwordsMatch !== null && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: passwordsMatch ? '#10b981' : '#ef4444', marginTop: '6px', display: 'block' }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '13px', cursor: 'pointer', lineHeight: '1.4' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
                style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#10b981' }}
              />
              <span>
                I agree to the <span style={{ color: '#10b981', fontWeight: '600' }}>Terms of Service</span> and <span style={{ color: '#10b981', fontWeight: '600' }}>Privacy Policy</span>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!agreeTerms || isLoading || passwordsMatch === false}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: (!agreeTerms || isLoading || passwordsMatch === false) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              opacity: (!agreeTerms || isLoading || passwordsMatch === false) ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Registering...' : 'Register Business'}
          </button>
        </form>

        <div style={styles.footerLink}>
          Already have a business account?{' '}
          <span
            onClick={() => navigate('/business-login')}
            style={styles.linkSpan}
            onMouseOver={(e) => e.target.style.color = '#059669'}
            onMouseOut={(e) => e.target.style.color = '#10b981'}
          >
            Sign In
          </span>
        </div>

      </div>
    </div>
  );
};

const styles = {
  body: {
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
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, system-ui, sans-serif'
  },
  container: {
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
  },
  backBtn: {
    position: 'absolute',
    top: '26px',
    left: '26px',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  title: {
    textAlign: 'center',
    marginBottom: '6px',
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.025em',
    marginTop: '16px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '32px'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#334155',
    fontSize: '14px'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '3px'
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '14px',
    color: '#64748b'
  },
  linkSpan: {
    color: '#10b981',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
    transition: 'color 0.2s ease'
  }
};

export default BusinessSignUp;