// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Ye detect karega ki aap kis URL par hain

  // Ek chota sa function jo check karega ki link active hai ya nahi
  const getDesktopLinkStyle = (path) => {
    return location.pathname === path
      ? "text-sm xl:text-base font-bold text-blue-600 border-b-2 border-blue-600 pb-1" // Active Style (Blue aur neeche ek line)
      : "text-sm xl:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"; // Normal Style
  };

  const getMobileLinkStyle = (path) => {
    return location.pathname === path
      ? "text-base font-bold text-blue-600 py-2" // Active Style Mobile
      : "text-base font-medium text-gray-600 py-2"; // Normal Style Mobile
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-20 md:h-24 flex items-center justify-between">
        
        {/* 1. LOGO SECTION */}
        <div className="flex-1 flex justify-start items-center pl-2 sm:pl-4">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="FlexiBook Logo" 
              className="h-60 sm:h-35 md:h-45 lg:h-65 xl:h-65 w-auto object-contain cursor-pointer transform hover:scale-105 transition-transform duration-200" 
            />
          </Link>
        </div>

        {/* 2. NAVIGATION LINKS - Dynamic styling ke saath */}
        <nav className="flex-none hidden lg:flex items-center justify-center gap-6 xl:gap-10 mt-1">
          <Link to="/" className={getDesktopLinkStyle('/')}>
            Home
          </Link>
          <Link to="/customers" className={getDesktopLinkStyle('/customers')}>
            For Customers
          </Link>
          <a href="#" className="text-sm xl:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
            For Businesses
          </a>
          <a href="#" className="text-sm xl:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
            Categories
          </a>
          <a href="#" className="text-sm xl:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
            Contact Us
          </a>
        </nav>

        {/* 3. AUTH BUTTONS */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-3 xl:gap-5 pr-2 sm:pr-4">
          {/* Linked Desktop Login Button */}
          <Link to="/login" className={getDesktopLinkStyle('/login')}>
            <button className="text-sm xl:text-base font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              Login
            </button>
          </Link>
          
          {/* FIXED: Wrapped Desktop Sign Up Button in a Link to /business-register */}
          <Link to="/business-register">
            <button className="text-sm xl:text-base font-semibold bg-blue-600 text-white px-5 xl:px-7 py-2 xl:py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200">
              Sign Up
            </button>
          </Link>
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
          <Link to="/" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/')}>
            Home
          </Link>
          <Link to="/customers" onClick={() => setIsOpen(false)} className={getMobileLinkStyle('/customers')}>
            For Customers
          </Link>
          <a href="#" className="text-base font-medium text-gray-600 py-2">For Businesses</a>
          <a href="#" className="text-base font-medium text-gray-600 py-2">Categories</a>
          <a href="#" className="text-base font-medium text-gray-600 py-2">Contact Us</a>
          <hr className="border-gray-100 my-2" />
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Linked Mobile Login Button */}
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
              <button className="w-full text-center text-base font-semibold text-gray-700 py-3 border border-gray-200 rounded-lg">
                Login
              </button>
            </Link>
            
            {/* FIXED: Wrapped Mobile Sign Up Button in a Link and close dropdown on click */}
            <Link to="/business-register" onClick={() => setIsOpen(false)} className="w-full">
              <button className="w-full text-center text-base font-semibold bg-blue-600 text-white py-3 rounded-lg">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};