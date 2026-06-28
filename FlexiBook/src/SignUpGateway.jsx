// src/SignUpGateway.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpGateway = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: '850px', 
      margin: '80px auto', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>
        Join FlexiBook
      </h2>
      <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '1.1rem' }}>
        Choose how you want to use our platform to get started.
      </p>

      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        width: '100%', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* CARD 1: CUSTOMER */}
        <div style={{
          flex: '1',
          minWidth: '280px',
          maxWidth: '380px',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '40px 30px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👤</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
              Create Customer Account
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '25px' }}>
              Book smart appointments, manage your reservations, and track your history easily.
            </p>
          </div>
          <button 
            onClick={() => navigate('/customer-register')} // Matches App.jsx precisely
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f1f5f9',
              color: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign Up as Customer
          </button>
        </div>

        {/* CARD 2: BUSINESS */}
        <div style={{
          flex: '1',
          minWidth: '280px',
          maxWidth: '380px',
          border: '2px solid #2563eb', 
          borderRadius: '12px',
          padding: '40px 30px',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(37,99,235,0.1)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💼</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
              Register Your Business
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '25px' }}>
              List your services, configure available booking slots, and grow your business queue.
            </p>
          </div>
          <button 
            onClick={() => navigate('/real-business-form')} // Matches App.jsx precisely
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
            }}
          >
            Register Business
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpGateway;