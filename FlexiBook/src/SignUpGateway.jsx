import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import familyBg from './family-bg.png'; 

const SignUpGateway = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(''); 

  const getCardStyle = (cardType) => ({
    flex: 1,
    padding: '40px 28px 32px 28px', // Added extra top padding for card balance
    backgroundColor: hoveredCard === cardType ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
    border: hoveredCard === cardType ? '2px solid #2563eb' : '1px solid #cbd5e1',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: hoveredCard === cardType ? 'translateY(-6px)' : 'translateY(0)',
    boxShadow: hoveredCard === cardType 
      ? '0 20px 25px -5px rgba(37, 99, 235, 0.15), 0 10px 10px -5px rgba(37, 99, 235, 0.1)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    position: 'relative' // Essential for holding the absolute positioned badge
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
        maxWidth: '680px', 
        padding: '50px 40px', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        
        {/* Compact, Long-Tail Back Arrow */}
        <Link 
          to="/login" 
          style={{
            position: 'absolute', top: '28px', left: '28px', color: '#475569', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s, color 0.2s',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="12" x2="3" y2="12"></line>
            <polyline points="10 19 3 12 10 5"></polyline>
          </svg>
        </Link>

        {/* Heading Section */}
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#0f172a', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em', marginTop: '12px' }}>
          Join FlexiBook
        </h2>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '15px', marginTop: '0', marginBottom: '45px', fontWeight: '400' }}>
          Select how you want to use our platform to get started
        </p>

        {/* Flex Split Gateway Content */}
        <div style={{ display: 'flex', gap: '24px', flexDirection: 'row' }}>
          
          {/* Choice 1: Customer Card */}
          <div 
            style={getCardStyle('customer')}
            onMouseEnter={() => setHoveredCard('customer')}
            onMouseLeave={() => setHoveredCard('')}
            onClick={() => navigate('/customer-register')}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#2563eb'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            
            {/* Flex container to cleanly hold Title and disappearing directional arrow */}
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              As a Customer
              <span style={{ 
                transition: 'all 0.2s ease', 
                transform: hoveredCard === 'customer' ? 'translateX(3px)' : 'translateX(0)',
                opacity: hoveredCard === 'customer' ? 1 : 0.4
              }}>→</span>
            </h3>
            
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              Book appointments, track schedules, and connect with local services seamlessly.
            </p>

            {/* Value Metric Footnote */}
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '4px 10px', borderRadius: '99px' }}>
              ⏱️ Setup in 60s
            </span>
          </div>

          {/* Choice 2: Business Card */}
          <div 
            style={getCardStyle('business')}
            onMouseEnter={() => setHoveredCard('business')}
            onMouseLeave={() => setHoveredCard('')}
            onClick={() => navigate('/real-business-form')}
          >
            {/* ADVANCED BADGE ACCENT ELEMENT */}
            <div style={{
              position: 'absolute', top: '-12px', right: '20px',
              backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: '700',
              padding: '4px 12px', borderRadius: '99px', letterSpacing: '0.05em',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
            }}>
              FOR PROFESSIONAL USE
            </div>

            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#10b981'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              As a Business
              <span style={{ 
                transition: 'all 0.2s ease', 
                transform: hoveredCard === 'business' ? 'translateX(3px)' : 'translateX(0)',
                opacity: hoveredCard === 'business' ? 1 : 0.4,
                color: '#10b981'
              }}>→</span>
            </h3>
            
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              Manage clients, automate your custom slots, and grow your brand operation.
            </p>

            <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '99px' }}>
              💼 Dashboard Enabled
            </span>
          </div>

        </div>

        {/* Footer Navigation Link */}
        <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '14px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUpGateway;