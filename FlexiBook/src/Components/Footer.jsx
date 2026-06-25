// src/components/Footer.jsx
import React from 'react';

export const Footer = () => {
  return (
    // 🔥 FIX: Yahan se 'mt-16' hata diya gaya hai taaki koi gap na rahe 🔥
    <footer className="bg-[#0B1120] border-t border-slate-800 pt-12 pb-6 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= MAIN GRID LAYOUT ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          {/* 1. BRANDING & SOCIALS */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4 cursor-pointer group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">FlexiBook</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Our platform helps you book appointments or join queues at your favorite places quickly, easily, and securely.
            </p>

            {/* Glowing Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {['FB', 'TW', 'IG', 'IN'].map((social, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,99,235,0.4)] transition-all duration-300"
                >
                  <span className="text-xs font-bold">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 2. LINKS SECTION */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column A */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">For Customers</h4>
              <ul className="flex flex-col gap-3">
                {['Browse Services', 'Find Businesses', 'FAQ'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column B */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">For Businesses</h4>
              <ul className="flex flex-col gap-3">
                {['Register Business', 'Dashboard', 'Pricing'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column C */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Company</h4>
              <ul className="flex flex-col gap-3">
                {['About Us', 'Terms of Service', 'Privacy Policy'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. NEWSLETTER SECTION */}
          <div className="lg:col-span-4 lg:pl-8 flex flex-col items-start sm:items-start">
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide uppercase">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest updates straight to your inbox. No spam, we promise!
            </p>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800/50 border border-slate-700 text-sm text-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-full placeholder-slate-500" 
              />
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 FlexiBook. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            Made with <span className="text-red-500 animate-pulse">❤</span> for a smarter tomorrow
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;