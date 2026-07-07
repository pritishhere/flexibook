// src/BusinessLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png';

export default function BusinessLogin() {
  const navigate = useNavigate();
  const [focusedField, setFocusedField] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyEmail: '',
    companyTaxId: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Authenticating Business Account:', formData);
    alert('Logging into Business Console...');
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    borderColor: focusedField === fieldName ? '#10b981' : '#cbd5e1',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(16, 185, 129, 0.15)' : 'none'
  });

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        
        <button
          onClick={() => navigate('/signup')}
          style={styles.backBtn}
          onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
          onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
        >
          ← Back to Options
        </button>

        <div style={styles.headerArea}>
          <span style={styles.badge}>BUSINESS PORTAL</span>
          <h2 style={styles.title}>Partner Console</h2>
          <p style={styles.subtitle}>Manage your corporate profile, logistics, and analytics.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Registration No. / Tax ID</label>
            <input
              type="text"
              name="companyTaxId"
              placeholder="CRN-12345-XYZ"
              value={formData.companyTaxId}
              onChange={handleChange}
              onFocus={() => setFocusedField('companyTaxId')}
              onBlur={() => setFocusedField('')}
              style={getInputStyle('companyTaxId')}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Corporate Email Address</label>
            <input
              type="email"
              name="companyEmail"
              placeholder="partnerships@company.com"
              value={formData.companyEmail}
              onChange={handleChange}
              onFocus={() => setFocusedField('companyEmail')}
              onBlur={() => setFocusedField('')}
              style={getInputStyle('companyEmail')}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Account Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot corporate access?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                style={{ ...getInputStyle('password'), paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, backgroundColor: isHovered ? '#059669' : '#10b981' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Secure Corporate Login →
          </button>
        </form>

        <div style={styles.footerLink}>
          Not a registered business partner?{' '}
          <span
            onClick={() => navigate('/business-register')}
            style={styles.linkSpan}
            onMouseOver={(e) => e.target.style.color = '#059669'}
            onMouseOut={(e) => e.target.style.color = '#10b981'}
          >
            Apply for Business Account
          </span>
        </div>
      </div>
    </div>
  );
}

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
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    position: 'absolute',
    top: '26px',
    left: '26px',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  },
  headerArea: {
    textAlign: 'center',
    marginTop: '15px',
    marginBottom: '30px'
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  title: {
    color: '#0f172a',
    marginTop: '12px',
    marginBottom: '6px',
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    color: '#475569',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    textAlign: 'left'
  },
  forgotLink: {
    fontSize: '12px',
    color: '#10b981',
    textDecoration: 'none',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginTop: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease'
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
  submitBtn: {
    width: '100%',
    padding: '14px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.2s ease'
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
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  }
};