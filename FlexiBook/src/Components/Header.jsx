// src/Components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); 

  // Secure Auth State Memory se data read karne ke liye
  const isLoggedIn = !!localStorage.getItem('token');
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  // Professional Secure Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have been securely logged out. See you next time!');
    window.location.href = '/login';
  };

  const getDesktopLinkStyle = (path) => {
    return location.pathname === path
      ? "text-sm xl:text-base font-bold text-blue-600 border-b-2 border-blue-600 pb-1" 
      : "text-sm xl:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"; 
  };

  const getMobileLinkStyle = (path) => {
    return location.pathname === path
      ? "text-base font-bold text-blue-600 py-2" 
      : "text-base font-medium text-gray-600 py-2"; 
  }; 
  
  return (
    // 🔴 FIXED: Ab Header hamesha top par sticky rahega aur auth pages par gayab nahi hoga!
    <div className="w-full z-50 sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <header className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-20 md:h-24 flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <div className="flex-1 flex justify-start items-center pl-2 sm:pl-4">
            <Link to="/">
              <img 
                src="/logo.png" 
                alt="FlexiBook Logo" 
                className="h-35 sm:h-45 md:h-55 lg:h-65 w-auto object-contain cursor-pointer transform hover:scale-105 transition-transform duration-200" 
              />
            </Link>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex-none hidden lg:flex items-center justify-center gap-6 xl:gap-10 mt-1">
            <Link to="/" className={getDesktopLinkStyle('/')}>Home</Link>
            <Link to="/customers" className={getDesktopLinkStyle('/customers')}>For Customers</Link>
            <Link to="/business-register" className={getDesktopLinkStyle('/business-register')}>For Businesses</Link>
            <Link to="/categories" className={getDesktopLinkStyle('/categories')}>Categories</Link>
            <Link to="/about" className={getDesktopLinkStyle('/about')}>About Us</Link>
            {user?.role === 'admin' && (
              <Link to="/admin-complaints" className={getDesktopLinkStyle('/admin-complaints')}>Admin Central</Link>
            )}
          </nav>

          {/* AUTH BUTTONS (Desktop) */}
          <div className="hidden lg:flex flex-1 justify-end items-center gap-3 xl:gap-5 pr-2 sm:pr-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-full shadow-inner">
                  Hi, {user?.name?.split(' ')[0] || 'User'} 👋
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm xl:text-base font-bold text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 px-5 py-2 rounded-lg transition-all duration-200"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm xl:text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="text-sm xl:text-base font-semibold bg-blue-600 text-white px-5 xl:px-7 py-2 xl:py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE HAMBURGER MENU BUTTON */}
          <div className="flex lg:hidden flex-1 justify-end items-center pr-2">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600 p-2">
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-4 shadow-inner">
            <Link to="/" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/')}>Home</Link>
            <Link to="/customers" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/customers')}>For Customers</Link>
            <Link to="/business-register" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/business-register')}>For Businesses</Link>
            <Link to="/categories" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/categories')}>Categories</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/about')}>About Us</Link>
            {user?.role === 'admin' && (
              <Link to="/admin-complaints" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/admin-complaints')}>Admin Central</Link>
            )}
            <hr className="border-gray-100 my-2" />

            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="text-center text-base font-bold text-slate-700 py-2 bg-slate-50 rounded-lg">
                    Logged in as {user?.name || 'User'}
                  </div>
                  <button 
                    onClick={() => { setIsOpen(false); handleLogout(); }} 
                    className="w-full text-center text-base font-bold text-red-500 py-3 border border-red-100 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <button className="w-full text-center text-base font-semibold text-gray-800 py-3 border border-gray-200 rounded-lg">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full">
                    <button className="w-full text-center text-base font-semibold bg-blue-600 text-white py-3 rounded-lg">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};