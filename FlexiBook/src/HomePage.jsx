// src/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from './family-bg.png'; // Make sure extension is correct

const HomePage = () => {
  return (
    <div className="w-full min-h-screen font-sans overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section 
        className="relative w-full bg-cover bg-no-repeat min-h-[90vh] flex items-center bg-[center_right_-25rem] sm:bg-[center_right_-15rem] md:bg-right lg:bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* MAGIC OVERLAY: Phones/Tablets pe solid white (90%), Laptops pe Right side transparent gradient */}
        <div className="absolute inset-0 bg-white/90 md:bg-white/80 lg:bg-transparent lg:bg-gradient-to-r lg:from-white/95 lg:via-white/85 lg:to-white/10 z-0"></div>

        {/* CONTAINER */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full py-12 md:py-20 lg:py-0">
          
          {/* TEXT AREA: Phones pe 100%, iPad pe 80%, Laptops pe 60%, PCs pe 50% width aur left shift */}
          <div className="w-full md:w-[80%] lg:w-[60%] xl:w-[50%] lg:-translate-x-8 xl:-translate-x-12 2xl:-translate-x-16 transition-transform duration-500">
            
            <div className="inline-flex items-center bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-base mb-6 border border-blue-100 shadow-sm">
              <span className="mr-2 text-blue-500">✓</span> Skip the Wait. Book Smart.
            </div>
            
            {/* Dynamic Text Scaling for all screens */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.15]">
              Smart Appointment <br className="hidden sm:block" />
              & Queue <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Booking System</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-800 lg:text-slate-700 mb-8 max-w-xl leading-relaxed font-medium">
              Book appointments or join queues online at your favorite places and save time. Experience convenience like never before.
            </p>

            {/* RESPONSIVE SEARCH BAR */}
            <div className="bg-white p-2 sm:p-2.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 flex flex-col md:flex-row items-center gap-2 mb-6 max-w-2xl">
              <div className="flex-1 flex items-center px-4 py-3 w-full group">
                <span className="text-slate-400 mr-3 text-lg group-focus-within:text-blue-600 transition-colors duration-300">🔍</span>
                <input type="text" placeholder="Search for services..." className="w-full outline-none text-slate-700 bg-transparent text-sm sm:text-base placeholder-slate-400" />
              </div>
              
              {/* Divider: Horizontal on phones, Vertical on tablets+ */}
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div className="block md:hidden w-full h-px bg-slate-100 my-1"></div>
              
              <div className="flex-1 flex items-center px-4 py-3 w-full group">
                <span className="text-slate-400 mr-3 text-lg group-focus-within:text-blue-600 transition-colors duration-300">📍</span>
                <input type="text" placeholder="Enter Location" className="w-full outline-none text-slate-700 bg-transparent text-sm sm:text-base placeholder-slate-400" />
              </div>
              
              <button className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-blue-800 hover:shadow-lg transition-all duration-300 w-full md:w-auto text-sm sm:text-base shrink-0">
                Search
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-10 text-xs sm:text-sm md:text-base text-slate-700 font-medium bg-white/80 lg:bg-white/60 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-slate-200/60 shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] sm:text-xs border-2 border-white shadow-sm">👨</div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] sm:text-xs border-2 border-white shadow-sm">👩</div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-[10px] sm:text-xs border-2 border-white shadow-sm">👦</div>
              </div>
              <p>Trusted by <span className="font-bold text-blue-600">5,000+</span> users today.</p>
            </div>

            {/* RESPONSIVE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white/95 backdrop-blur-md border border-blue-100 p-5 rounded-2xl flex flex-col xl:flex-row items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">👤</div>
                <div className="flex flex-col h-full w-full">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">I'm a Customer</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">Book appointments or join live queues.</p>
                  <Link to="/customers" className="inline-block mt-auto text-blue-600 border-2 border-blue-600 bg-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 hover:text-white text-center w-full transition-all shadow-sm">Get Started →</Link>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-emerald-100 p-5 rounded-2xl flex flex-col xl:flex-row items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">🏪</div>
                <div className="flex flex-col h-full w-full">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Business Owner</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">Manage appointments and grow sales.</p>
                  <button className="mt-auto text-emerald-600 border-2 border-emerald-600 bg-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-700 hover:text-white text-center w-full transition-all shadow-sm">Register Now →</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US SECTION ================= */}
      <section className="bg-white py-16 md:py-24 border-t border-slate-100 relative z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">A modern solution designed to save time for you and your business.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: '📅', color: 'blue', title: 'Easy Booking', desc: 'Book appointments or join queues in just a few clicks.' },
              { icon: '👥', color: 'emerald', title: 'Real-time Updates', desc: 'Get real-time updates on your queue or appointment status.' },
              { icon: '⏱️', color: 'orange', title: 'Save Time', desc: 'Skip the line and save valuable time for what matters most.' },
              { icon: '🛡️', color: 'purple', title: 'Secure & Reliable', desc: 'Your data is safe with us. We ensure a secure experience.' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left px-4 group">
                <div className={`w-16 h-16 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-sm`}>{item.icon}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                <p className="text-base text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;