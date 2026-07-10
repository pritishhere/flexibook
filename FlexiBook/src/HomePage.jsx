// src/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Ticket, CheckCircle2, Loader2 } from 'lucide-react';
import heroBg from './family-bg.png';

const HomePage = () => {
  const navigate = useNavigate();

  // ==========================================
  // 🔴 STATES FOR SEARCH BAR
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const locTimerRef = useRef(null);

  // ==========================================
  // 🟢 LIVE QUEUE ENGINE STATES
  // ==========================================
  const [systemStatus, setSystemStatus] = useState('booting'); 
  const [logs, setLogs] = useState(['Initializing system...']);
  const [isJoining, setIsJoining] = useState(false);
  
  const [queueData, setQueueData] = useState({
    currentlyServing: 'H1',
    totalWaiting: 7,
    estimatedWaitTime: '15 - 20 mins',
    upNext: [
      { ticket: 'H2', name: 'Rahul S.', time: '5 mins' },
      { ticket: 'H3', name: 'Sneha M.', time: '10 mins' },
      { ticket: 'H4', name: 'Amit K.', time: '15 mins' }
    ]
  });

  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user in HomePage", e);
  }
  const currentServeRef = useRef(1); 
  const nextAddRef = useRef(4); 

  // ==========================================
  // 🧠 LIVE QUEUE ENGINE LOGIC
  // ==========================================
  useEffect(() => {
    let intervalId;
    const timeoutId = setTimeout(() => {
      setSystemStatus('online');
      setLogs(p => [...p, 'Connected to Live Queue.', 'Receiving updates...']);
      
      intervalId = setInterval(() => {
        currentServeRef.current += 1;
        nextAddRef.current += 1;
        
        const newlyServingTicket = `H${currentServeRef.current}`;
        const newTicketToAdd = `H${nextAddRef.current}`;

        setQueueData((prev) => {
          const newUpNext = prev.upNext.slice(1); 
          newUpNext.push({
            ticket: newTicketToAdd,
            name: ['Vikram', 'Pooja', 'Neha', 'Karan', 'Guest'][Math.floor(Math.random() * 5)],
            time: '15 mins'
          });

          return {
            currentlyServing: newlyServingTicket,
            totalWaiting: 7, 
            estimatedWaitTime: '12 - 15 mins',
            upNext: newUpNext
          };
        });

        setLogs(p => {
          const updatedLogs = [...p, `Now serving ${newlyServingTicket}`];
          return updatedLogs.slice(-2); 
        });

      }, 5000); 
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleJoinQueue = () => {
    if (!user) {
      alert("Please authenticate to generate a ticket.");
      navigate('/login');
      return;
    }
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      alert("Ticket Generated! You are in the pipeline.");
    }, 1500);
  };

  // ==========================================
  // 🗄️ MASSIVE MOCK DICTIONARY & HANDLERS
  // ==========================================
  const allServicesData = [
    { name: "Hospitals", category: "Healthcare", type: "Category", icon: "🏥" },
    { name: "Dentist", category: "Healthcare", type: "Specialist", icon: "🦷" },
    { name: "General Physician", category: "Healthcare", type: "Specialist", icon: "👨‍⚕️" },
    { name: "AIIMS Delhi", category: "Healthcare", type: "Top Business", icon: "⭐" },
    { name: "Apollo Hospitals", category: "Healthcare", type: "Top Business", icon: "⭐" },
    { name: "Hair Salons", category: "Beauty & Wellness", type: "Category", icon: "✂️" },
    { name: "Spa & Massage", category: "Beauty & Wellness", type: "Category", icon: "💆‍♀️" },
    { name: "Car Wash", category: "Automotive", type: "Service", icon: "🚗" },
    { name: "Bike Repair", category: "Automotive", type: "Service", icon: "🏍️" },
    { name: "Restaurants", category: "Food & Dining", type: "Category", icon: "🍽️" },
    { name: "Cafes", category: "Food & Dining", type: "Category", icon: "☕" },
    { name: "Tutors & Coaching", category: "Education", type: "Category", icon: "📚" },
    { name: "Gyms & Fitness Centers", category: "Fitness", type: "Category", icon: "💪" },
    { name: "Yoga Classes", category: "Fitness", type: "Category", icon: "🧘‍♀️" },
    { name: "Electrician", category: "Home Repair", type: "Service", icon: "⚡" },
    { name: "Plumber", category: "Home Repair", type: "Service", icon: "🔧" }
  ];

  const handleServiceChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowServiceDropdown(true);

    if (val.trim() === "") {
      setServiceSuggestions([]);
      return;
    }
    const searchLower = val.toLowerCase();
    const filtered = allServicesData.filter(item => 
      item.name.toLowerCase().includes(searchLower) || 
      item.category.toLowerCase().includes(searchLower)
    );
    setServiceSuggestions(filtered.slice(0, 8));
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocationQuery(val);
    setShowLocationDropdown(true);

    if (locTimerRef.current) clearTimeout(locTimerRef.current);

    if (val.trim().length > 2) {
      setIsLocationLoading(true);
      locTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}&countrycodes=in&limit=5&addressdetails=1`);
          const data = await res.json();
          setLocationSuggestions(data);
        } catch (error) {
          console.error("Location API Failed", error);
        }
        setIsLocationLoading(false);
      }, 500);
    } else {
      setLocationSuggestions([]);
      setIsLocationLoading(false);
    }
  };

  const handleDetectLocation = (e) => {
    e.preventDefault();
    setIsLocatingGPS(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.state_district || "";
            setLocationQuery(`${city}, ${data.address.state || ""}`);
          } catch (error) {
            setLocationQuery("Location Found");
          } finally {
            setIsLocatingGPS(false);
            setShowLocationDropdown(false);
          }
        },
        () => setIsLocatingGPS(false)
      );
    } else {
      setIsLocatingGPS(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const serviceParam = encodeURIComponent(searchQuery.trim().toLowerCase());
    const locationParam = encodeURIComponent(locationQuery.trim().toLowerCase());
    navigate(`/customers?service=${serviceParam}&location=${locationParam}`);
  };

  return (
    <div className="w-full min-h-screen font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white relative bg-transparent">
      
      <style>{`
        /* Staggered Entrance Animations */
        @keyframes fadeUpReveal { 0% { opacity: 0; transform: translateY(30px); filter: blur(10px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        .reveal-1 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .reveal-2 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .reveal-3 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .reveal-4 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

        /* Dynamic Glowing Orbs */
        .aurora-bg { position: fixed; width: 100vw; height: 100vh; overflow: hidden; z-index: -10; pointer-events: none; }
        .orb-1, .orb-2, .orb-3 { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 20s infinite ease-in-out alternate; }
        .orb-1 { width: 600px; height: 600px; background: rgba(59, 130, 246, 0.15); top: 0px; left: -100px; opacity: 0.8; }
        .orb-2 { width: 500px; height: 500px; background: rgba(16, 185, 129, 0.2); bottom: -100px; right: -100px; animation-delay: -5s; opacity: 0.6; }
        .orb-3 { width: 400px; height: 400px; background: rgba(99, 102, 241, 0.2); top: 30%; left: 40%; animation-delay: -10s; opacity: 0.6; }
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 150px) scale(1.2); } }

        .ultra-glass { background: linear-gradient(to bottom, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.9) 15%, rgba(248, 250, 252, 1) 100%); }

        /* Command Center Search Box */
        .command-center { background: #ffffff !important; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02), inset 0 2px 4px rgba(255,255,255,1); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; }
        .command-center input { color: #0f172a !important; background: transparent !important; }
        .command-center input::placeholder { color: #64748b !important; opacity: 0.8; }
        .command-center .input-group:hover { background: #f8fafc !important; }
        .command-center .dropdown-card { background: #ffffff !important; border: 1px solid #e2e8f0 !important; }
        .command-center .dropdown-item { color: #0f172a !important; }
        .command-center .dropdown-item:hover { background: #f8fafc !important; }
        .command-center::before { content: ''; position: absolute; inset: -3px; border-radius: 26px; background: linear-gradient(90deg, #3b82f6, #10b981, #6366f1); z-index: -1; opacity: 0; transition: opacity 0.4s ease; filter: blur(12px); }
        .command-center:focus-within { transform: translateY(-5px); box-shadow: 0 30px 60px -20px rgba(59,130,246,0.2), 0 0 0 1px rgba(0,0,0,0.02); }
        .command-center:focus-within::before { opacity: 0.4; }

        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: rotate(30deg) translateX(-100%); transition: transform 0.8s ease; }
        .shimmer-btn:hover::after { transform: rotate(30deg) translateX(100%); }

        .premium-card { position: relative; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-radius: 20px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 15px 35px -10px rgba(0,0,0,0.05); overflow: hidden; transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); z-index: 1; }
        .premium-card::before { content: ''; position: absolute; top: 0; left: -150%; width: 100%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent); transform: skewX(-25deg); transition: left 0.8s ease; z-index: -1; }
        .premium-card:hover::before { left: 150%; }
        .premium-card.customer:hover { transform: translateY(-10px) scale(1.02); border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25), inset 0 0 0 1px rgba(255,255,255,1); }
        .premium-card.business:hover { transform: translateY(-10px) scale(1.02); border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25), inset 0 0 0 1px rgba(255,255,255,1); }
        .premium-card:hover .icon-box { transform: scale(1.12) rotate(5deg); }

        .bento-premium { position: relative; background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 24px; padding: 32px; box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5); transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); overflow: hidden; z-index: 1; }
        .bento-premium::before { content: ''; position: absolute; top: 0; left: -150%; width: 100%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent); transform: skewX(-25deg); transition: left 0.7s ease; z-index: -1; }
        .bento-premium:hover::before { left: 150%; }
        .bento-premium:hover { transform: translateY(-8px); background: rgba(255, 255, 255, 0.95); }
        .bento-premium.blue:hover { border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.emerald:hover { border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.orange:hover { border-color: rgba(249, 115, 22, 0.3); box-shadow: 0 20px 40px -15px rgba(249, 115, 22, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.purple:hover { border-color: rgba(168, 85, 247, 0.3); box-shadow: 0 20px 40px -15px rgba(168, 85, 247, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium:hover .bento-icon-box { transform: scale(1.15); box-shadow: 0 10px 25px -5px currentColor; }

        /* ========================================================
           🔥 THE UNIQUE MIND-BLOWING CARD ANIMATIONS 🔥
           ======================================================== */
        /* 1. Neon Flowing Border for the Main Live Card */
        .glow-border-wrapper {
          position: relative;
          border-radius: 1.3rem;
          padding: 2.5px; 
          background: linear-gradient(45deg, #3b82f6, #10b981, #6366f1, #3b82f6, #10b981);
          background-size: 300% 300%;
          animation: borderFlowMove 4s linear infinite;
          box-shadow: 0 15px 35px -10px rgba(59, 130, 246, 0.3);
        }
        .glow-border-inner {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          border-radius: 1.2rem;
          height: 100%;
          width: 100%;
        }
        @keyframes borderFlowMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* 2. Anti-Gravity 3D Float Animations (Each card moves differently) */
        .float-3d-1 { animation: antiGravity1 6s ease-in-out infinite; }
        .float-3d-2 { animation: antiGravity2 7s ease-in-out infinite alternate; }
        .float-3d-3 { animation: antiGravity3 8s ease-in-out infinite; }

        @keyframes antiGravity1 { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-8px) rotate(1.5deg); } 
        }
        @keyframes antiGravity2 { 
          0%, 100% { transform: translateY(0) scale(1); } 
          50% { transform: translateY(-12px) scale(1.02); } 
        }
        @keyframes antiGravity3 { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-6px) rotate(-1.5deg); } 
        }

        /* 3. The Flowing Dashed Arrow */
        .animated-arrow path {
          stroke-dasharray: 6 6;
          animation: dashFlow 1.5s linear infinite;
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -12; }
        }
      `}</style>

      {/* ================= FULL PAGE PARALLAX BACKGROUND ================= */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-no-repeat bg-[center_right_-15rem] lg:bg-center -z-10 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 md:via-white/80 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
      </div>

      <div className="aurora-bg">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
        <div className="orb-3"></div>
      </div>

      {/* ================= MAIN CONTENT (HERO SECTION) ================= */}
      <section className="relative z-10 w-full min-h-[95vh] flex items-center pt-20 pb-10">
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full relative flex flex-col lg:flex-row items-center">
          
          {/* ================= ⬅️ LEFT COLUMN (Original content) ================= */}
          <div className="w-full md:w-[85%] lg:w-[65%] xl:w-[55%] relative z-20">
            
            <div className="reveal-1 inline-flex items-center bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-slate-800 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6">
              <span className="relative flex h-2.5 w-2.5 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              Next-Gen Appointment OS
            </div>
            
            <h1 className="reveal-2 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black text-slate-900 tracking-tighter mb-5 leading-[1.05]">
              Book Anything. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500">Wait For Nothing.</span>
            </h1>
            
            <p className="reveal-2 text-base sm:text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              Join millions experiencing the future of queue management. Smart, instant, and effortlessly beautiful.
            </p>

            <form 
              onSubmit={handleSearchSubmit} 
              className="reveal-3 command-center p-2 flex flex-col md:flex-row items-center gap-1 mb-10 max-w-3xl z-50"
            >
              <div className="relative flex-1 flex items-center px-4 py-3 w-full group input-group rounded-xl transition-colors">
                <span className="text-slate-400 mr-2.5 group-focus-within:text-blue-600 transition-colors duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input 
                  type="text" value={searchQuery} onChange={handleServiceChange}
                  onFocus={() => setShowServiceDropdown(true)} onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)}
                  placeholder="What service do you need?" 
                  className="w-full outline-none text-slate-900 bg-transparent text-sm sm:text-base font-semibold placeholder:text-slate-500" autoComplete="off"
                />
                
                {showServiceDropdown && searchQuery.trim().length > 0 && (
                  <div className="absolute top-[115%] left-0 w-full dropdown-card bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto transform origin-top animate-in fade-in zoom-in-95 duration-200">
                    {serviceSuggestions.length > 0 ? (
                      <ul className="p-2">
                        <li className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Matches</li>
                        {serviceSuggestions.map((item, idx) => (
                          <li key={idx} onMouseDown={() => { setSearchQuery(item.name); setShowServiceDropdown(false); }} className="dropdown-item px-4 py-2.5 hover:bg-white/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors group">
                            <div className="flex items-center gap-3">
                              <span className="text-xl drop-shadow-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                              <div>
                                <p className="text-slate-900 font-bold text-sm">{item.name}</p>
                                <p className="text-slate-500 text-[11px] font-medium">{item.category}</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                              {item.type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-5 text-sm text-slate-500 text-center font-medium">No matches found.</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              
              <div className="relative flex-1 flex items-center px-4 py-3 w-full group input-group rounded-xl transition-colors">
                <span className="text-slate-400 mr-2.5 group-focus-within:text-emerald-500 transition-colors duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <input 
                  type="text" value={locationQuery} onChange={handleLocationChange}
                  onFocus={() => setShowLocationDropdown(true)} onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                  placeholder="Where? (e.g. City)" 
                  className="w-full outline-none text-slate-900 bg-transparent text-sm sm:text-base font-semibold placeholder:text-slate-500" autoComplete="off"
                />

                <button type="button" onClick={handleDetectLocation} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-300" title="Detect Location">
                  {isLocatingGPS ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path><circle cx="12" cy="12" r="7"></circle>
                    </svg>
                  )}
                </button>

                {showLocationDropdown && locationQuery.trim().length > 2 && (
                  <div className="absolute top-[115%] left-0 w-full dropdown-card bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto transform origin-top animate-in fade-in zoom-in-95 duration-200">
                    {isLocationLoading ? (
                      <div className="p-6 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                         <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin"></div>
                         Scanning precise locations...
                      </div>
                    ) : locationSuggestions.length > 0 ? (
                      <ul className="p-2">
                         <li className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locations Found</li>
                        {locationSuggestions.map((place, idx) => {
                          const addressParts = place.display_name.split(", ");
                          return (
                            <li key={idx} onMouseDown={() => { setLocationQuery(`${addressParts[0]}, ${addressParts.slice(1, 3).join(", ")}`); setShowLocationDropdown(false); }} className="dropdown-item px-4 py-2 hover:bg-white/80 rounded-xl cursor-pointer flex items-start gap-3 transition-colors group">
                              <span className="text-slate-300 mt-0.5 group-hover:text-emerald-500 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
                              <div>
                                <p className="text-slate-900 font-bold text-sm">{addressParts[0]}</p>
                                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">{addressParts.slice(1, 3).join(", ")}</p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className="p-5 text-sm text-slate-500 text-center font-medium">No places found.</div>
                    )}
                  </div>
                )}
              </div>
              
              <button type="submit" className="shimmer-btn bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors duration-300 w-full md:w-auto shrink-0 shadow-lg">
                Search
              </button>
            </form>
            
            <div className="reveal-4 mb-8 max-w-2xl">
              <div className="rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="inline-block text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full mb-2">🧠 NEW</span>
                  <h3 className="text-2xl font-bold text-white">FlexiCare AI</h3>
                  <p className="text-cyan-100 text-sm mt-1">Describe your symptoms and get an AI recommendation instantly.</p>
                </div>
                <button onClick={() => navigate("/ai-symptom-checker")} className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:scale-105 transition">
                  Try AI →
                </button>
              </div>
            </div>

            <div className="reveal-4 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              <div className="premium-card customer group cursor-pointer" onClick={() => navigate('/customers')}>
                <div className="absolute -right-4 -bottom-4 text-[100px] opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">👤</div>
                <div className="icon-box w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-600 rounded-[14px] flex items-center justify-center shrink-0 text-2xl mb-4 shadow-inner relative z-10">👤</div>
                <h4 className="font-black text-slate-900 text-xl mb-2 group-hover:text-blue-600 transition-colors relative z-10">I'm a Customer</h4>
                <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed relative z-10">Book elite appointments or join live queues instantly with zero wait times.</p>
                <div className="flex items-center text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors bg-white w-fit px-4 py-2 rounded-full border border-gray-200 group-hover:border-blue-300 relative z-10">
                  Get Started <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300 text-sm">🚀</span>
                </div>
              </div>

              <div className="premium-card business group cursor-pointer" onClick={() => navigate('/business-register')}>
                <div className="absolute -right-4 -bottom-4 text-[100px] opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">🏪</div>
                <div className="icon-box w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-600 rounded-[14px] flex items-center justify-center shrink-0 text-2xl mb-4 shadow-inner relative z-10">🏪</div>
                <h4 className="font-black text-slate-900 text-xl mb-2 group-hover:text-emerald-600 transition-colors relative z-10">Business Owner</h4>
                <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed relative z-10">Manage appointments and scale your operations beautifully with smart tools.</p>
                <div className="flex items-center text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors bg-white w-fit px-4 py-2 rounded-full border border-gray-200 group-hover:border-emerald-300 relative z-10">
                  Register Now <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300 text-sm">✨</span>
                </div>
              </div>
            </div>

          </div>

          {/* ================= 🔴 UNIQUE ANIMATED WIDGET (ABSOLUTE SCROLL) 🔴 ================= */}
          {/* Changed 'fixed' to 'absolute' so it scrolls perfectly with the page */}
          <div className="absolute top-[10%] right-0 lg:right-[5%] xl:right-[10%] 2xl:right-[15%] z-[100] hidden lg:block pointer-events-none">
            
            <div className="relative w-[300px] h-[450px] pointer-events-auto origin-top">
              
              {/* CARD 1: ENGINE STATUS */}
              {/* Animation: float-3d-1 */}
              <div className="absolute top-0 left-0 w-[120px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2 shadow-sm z-30 float-3d-1">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-[8px] font-bold text-slate-800">Engine Status</h3>
                  <span className={`text-[6px] font-black px-1 py-0.5 rounded-full uppercase tracking-wider ${systemStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {systemStatus === 'online' ? '● LIVE' : '↻ CONN'}
                  </span>
                </div>
                <div className="bg-slate-900 rounded-md p-1.5 text-[8px] font-mono text-slate-300 h-[45px] overflow-hidden flex flex-col justify-end shadow-inner leading-tight">
                  {logs.map((l, i) => (
                    <div key={i} className={`truncate ${i === logs.length - 1 ? 'text-green-400 font-bold' : 'opacity-60'}`}>
                      {'>'} {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: LIVE STATUS */}
              {/* FIXED GAP (top-[100px]), Glowing Animated Border, float-3d-2 */}
              <div className="absolute top-[100px] left-[30px] w-[150px] glow-border-wrapper z-20 float-3d-2">
                <div className="glow-border-inner p-3.5">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800">Live Status</h4>
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                    </div>
                  </div>
                  <div className="mb-1.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      Now Serving {systemStatus === 'online' && <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>}
                    </p>
                    <p className="text-3xl font-black text-blue-600 tracking-tighter leading-none">
                      {systemStatus === 'online' ? queueData.currentlyServing : '--'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-semibold text-slate-600">
                      Wait: <span className="font-black text-slate-900">{queueData.estimatedWaitTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 🏹 THE ANIMATED ARROW */}
              {/* Animation: Flowing dashes */}
              <div className="absolute top-[185px] right-[75px] opacity-40 z-10 text-slate-500 animated-arrow">
                <svg className="w-16 h-20" viewBox="0 0 100 120" fill="none">
                  <path d="M 10,10 Q 90,30 75,100" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 75,100 L 85,85 L 65,88 Z" fill="currentColor" />
                </svg>
              </div>

              {/* CARD 3: UP NEXT */}
              {/* Animation: float-3d-3 */}
              <div className="absolute top-[260px] right-0 w-[160px] bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-lg border border-slate-100 z-20 float-3d-3">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-[10px] font-bold text-slate-800">Up Next</h4>
                  <span className="text-[8px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                    {queueData.totalWaiting} Waiting
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mb-2.5">
                  {queueData.upNext.slice(0, 2).map((person, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-800">{person.ticket}</span>
                      </div>
                      <span className="text-[8px] font-black text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {person.time}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleJoinQueue}
                  disabled={isJoining || systemStatus !== 'online'}
                  className="w-full bg-slate-900 text-white text-[9px] font-bold py-2 rounded-md hover:bg-blue-600 hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-1.5"
                >
                  {isJoining ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Ticket className="w-3 h-3"/> Get Ticket Now
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
          {/* ================= END WIDGET ================= */}

        </div>
      </section>

      {/* ================= 🌌 THE PREMIUM SAAS "WHY CHOOSE US" SECTION ================= */}
      <section className="relative z-10 w-full ultra-glass py-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">Why Choose Us?</h2>
              <p className="text-slate-600 max-w-xl text-lg font-medium">A modern solution designed to save time for you and your business.</p>
            </div>
            <div className="flex -space-x-3">
               <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-lg z-30 text-lg">⭐</div>
               <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-lg z-20 text-lg">🔥</div>
               <div className="h-12 px-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg z-10 text-white text-sm font-bold pl-6">5k+ Trusted</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { color: 'blue', title: 'Easy Booking', desc: 'Book appointments or join queues in just a few clicks.', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg> },
              { color: 'emerald', title: 'Live Sync', desc: 'Real-time updates on your queue or appointment status.', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg> },
              { color: 'orange', title: 'Save Time', desc: 'Skip the line and save valuable time for what matters most.', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
              { color: 'purple', title: 'Bank-Grade Secure', desc: 'Your data is safe with us. We ensure a secure experience.', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg> }
            ].map((item, idx) => (
              <div key={idx} className={`bento-premium ${item.color} group flex flex-col items-start cursor-default`}>
                <div className={`bento-icon-box w-16 h-16 bg-${item.color}-50 border border-${item.color}-200 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-6`}>{item.svg}</div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-black transition-colors">{item.title}</h4>
                <p className="text-base text-slate-600 font-medium leading-relaxed group-hover:text-slate-800 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;