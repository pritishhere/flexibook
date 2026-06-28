import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png'; // Importing your local background image

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with:", email, password);
    navigate('/');
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 96px)', // Adjusts perfectly below your header height
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // Uses your local image with a light overlay tint for readability
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
        backgroundColor: '#ffffff', // Crisp white block ensures contrast
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          color: '#1e293b', 
          fontSize: '1.6rem', 
          fontWeight: '700' 
        }}>
          Login to FlexiBook
        </h2>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#475569' }}>
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              value={email} 
              onChange={onChange} 
              required 
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                marginTop: '5px',
                border: '1px solid #cbd5e1', 
                borderRadius: '6px',
                backgroundColor: '#f8fafc', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#475569' }}>
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              value={password} 
              onChange={onChange} 
              required 
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                marginTop: '5px',
                border: '1px solid #cbd5e1', 
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <Link to="/" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
            <button 
              type="button" 
              style={{ 
                width: '100%', 
                padding: '13px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
                position: 'relative', 
                zIndex: 9999 
              }}
            >
              Login
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;