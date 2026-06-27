import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import familyBg from './family-bg.png'; // Importing your local background image

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
    navigate('/');
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 96px)', 
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // Matches the layout styling scheme from the login view container
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${familyBg})`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '450px', 
        padding: '35px 30px', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1e293b', fontWeight: '700', fontSize: '1.6rem' }}>
          Create Customer Account
        </h2>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Full Name</label>
            <input 
              type="text" name="name" value={name} onChange={onChange} required placeholder="John Doe"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Email Address</label>
            <input 
              type="email" name="email" value={email} onChange={onChange} required placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Password</label>
            <input 
              type="password" name="password" value={password} onChange={onChange} required placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Confirm Password</label>
            <input 
              type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
            />
          </div>

          <button type="submit" style={{ 
            width: '100%', padding: '13px', backgroundColor: '#2563eb', color: 'white', 
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
          }}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegister;