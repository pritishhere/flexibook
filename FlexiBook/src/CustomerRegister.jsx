import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png'; 

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [focusedField, setFocusedField] = useState('');

  const { name, email, password, confirmPassword } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Registering Customer:", name, email);
    alert("Account Created Successfully!");
    navigate('/login'); // Sends them straight to your clean login card
  };

  // Reusable, interactive input design config mapping
  const getInputStyle = (fieldName) => ({
    width: '100%', 
    padding: '12px 16px', 
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
        
        {/* Compact Long-Tail Back Arrow pointing beautifully back to the Gateway selection room */}
        <Link 
          to="/business-register" 
          style={{
            position: 'absolute',
            top: '26px',
            left: '26px',
            color: '#475569', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#2563eb';
            e.currentTarget.style.transform = 'translateX(-3px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="12" x2="3" y2="12"></line>
            <polyline points="10 19 3 12 10 5"></polyline>
          </svg>
        </Link>

        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '6px', 
          color: '#0f172a', 
          fontSize: '1.75rem', 
          fontWeight: '800',
          letterSpacing: '-0.025em',
          marginTop: '16px' 
        }}>
          Create Customer Account
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '14px',
          marginTop: '0',
          marginBottom: '28px',
          fontWeight: '400'
        }}>
          Join FlexiBook today to manage your bookings
        </p>
        
        <form onSubmit={onSubmit}>
          {/* Full Name Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Full Name</label>
            <input 
              type="text" name="name" value={name} onChange={onChange} 
              onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')}
              required placeholder="John Doe" style={getInputStyle('name')} 
            />
          </div>

          {/* Email Address Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Email Address</label>
            <input 
              type="email" name="email" value={email} onChange={onChange} 
              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
              required placeholder="you@example.com" style={getInputStyle('email')} 
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Password</label>
            <input 
              type="password" name="password" value={password} onChange={onChange} 
              onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
              required placeholder="••••••••" style={getInputStyle('password')} 
            />
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Confirm Password</label>
            <input 
              type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} 
              onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')}
              required placeholder="••••••••" style={getInputStyle('confirmPassword')} 
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Up
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '28px', 
          fontSize: '14px', 
          color: '#64748b', 
          fontWeight: '400' 
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;