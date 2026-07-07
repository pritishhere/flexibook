import{a as e,o as t,r as n,t as r}from"./index-BWJm6A1j.js";import{t as i}from"./family-bg-CK5hnoVQ.js";var a=t(e(),1),o=r(),s=()=>{let e=n(),[t,r]=(0,a.useState)(``),[s,c]=(0,a.useState)(``),[l,u]=(0,a.useState)(!1),[d,f]=(0,a.useState)(!1),[p,m]=(0,a.useState)([]),[h,g]=(0,a.useState)([]),[_,v]=(0,a.useState)(!1),[y,b]=(0,a.useState)(!1),x=(0,a.useRef)(null),S=[{name:`Hospitals`,category:`Healthcare`,type:`Category`,icon:`🏥`},{name:`Dentist`,category:`Healthcare`,type:`Specialist`,icon:`🦷`},{name:`General Physician`,category:`Healthcare`,type:`Specialist`,icon:`👨‍⚕️`},{name:`AIIMS Delhi`,category:`Healthcare`,type:`Top Business`,icon:`⭐`},{name:`Apollo Hospitals`,category:`Healthcare`,type:`Top Business`,icon:`⭐`},{name:`Hair Salons`,category:`Beauty & Wellness`,type:`Category`,icon:`✂️`},{name:`Spa & Massage`,category:`Beauty & Wellness`,type:`Category`,icon:`💆‍♀️`},{name:`Car Wash`,category:`Automotive`,type:`Service`,icon:`🚗`},{name:`Bike Repair`,category:`Automotive`,type:`Service`,icon:`🏍️`},{name:`Restaurants`,category:`Food & Dining`,type:`Category`,icon:`🍽️`},{name:`Cafes`,category:`Food & Dining`,type:`Category`,icon:`☕`},{name:`Tutors & Coaching`,category:`Education`,type:`Category`,icon:`📚`},{name:`Gyms & Fitness Centers`,category:`Fitness`,type:`Category`,icon:`💪`},{name:`Yoga Classes`,category:`Fitness`,type:`Category`,icon:`🧘‍♀️`},{name:`Electrician`,category:`Home Repair`,type:`Service`,icon:`⚡`},{name:`Plumber`,category:`Home Repair`,type:`Service`,icon:`🔧`}];return(0,o.jsxs)(`div`,{className:`w-full min-h-screen font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white relative bg-transparent`,children:[(0,o.jsx)(`style`,{children:`
        /* Staggered Entrance Animations */
        @keyframes fadeUpReveal {
          0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .reveal-1 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .reveal-2 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .reveal-3 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .reveal-4 { animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

        /* Dynamic Glowing Orbs (Locked to background with z-[-10]) */
        .aurora-bg {
          position: fixed;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: -10;
          pointer-events: none;
        }
        .orb-1, .orb-2, .orb-3 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 20s infinite ease-in-out alternate;
        }
        .orb-1 { width: 600px; height: 600px; background: rgba(59, 130, 246, 0.3); top: -200px; left: -100px; }
        .orb-2 { width: 500px; height: 500px; background: rgba(16, 185, 129, 0.2); bottom: -100px; right: -100px; animation-delay: -5s; }
        .orb-3 { width: 400px; height: 400px; background: rgba(99, 102, 241, 0.2); top: 30%; left: 40%; animation-delay: -10s; }
        
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, 150px) scale(1.2); }
        }

        /* Glass Section Container */
        .ultra-glass {
          background: var(--ultra-glass-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid var(--border-glass);
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.02);
        }

        /* Floating Command Center */
        .command-center {
          background: var(--surface) !important;
          border-radius: 24px;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02), inset 0 2px 4px rgba(255,255,255,1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .command-center input {
          color: var(--text-main) !important;
          background: transparent !important;
        }
        .command-center input::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.8;
        }
        .command-center .input-group:hover {
          background: var(--hover-bg) !important;
        }
        .command-center .dropdown-card {
          background: var(--surface) !important;
          border: 1px solid var(--border-soft) !important;
        }
        .command-center .dropdown-item {
          color: var(--text-main) !important;
        }
        .command-center .dropdown-item:hover {
          background: var(--hover-bg) !important;
        }
        .command-center .dropdown-item p {
          color: var(--text-main) !important;
        }
        .command-center .dropdown-item p.text-slate-500,
        .command-center .dropdown-item p.text-slate-400 {
          color: var(--text-muted) !important;
        }
        .command-center::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 26px;
          background: linear-gradient(90deg, #3b82f6, #10b981, #6366f1);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s ease;
          filter: blur(12px);
        }
        .command-center:focus-within {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px -20px rgba(59,130,246,0.2), 0 0 0 1px rgba(0,0,0,0.02);
        }
        .command-center:focus-within::before {
          opacity: 0.4;
        }

        /* Shimmer Button */
        .shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: rotate(30deg) translateX(-100%);
          transition: transform 0.8s ease;
        }
        .shimmer-btn:hover::after {
          transform: rotate(30deg) translateX(100%);
        }

        /* Hero Premium Cards */
        .premium-card {
          position: relative;
          background: var(--surface-card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 15px 35px -10px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 1;
        }
        .premium-card::before {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent);
          transform: skewX(-25deg);
          transition: left 0.8s ease;
          z-index: -1;
        }
        .premium-card:hover::before { left: 150%; }
        .premium-card.customer:hover { transform: translateY(-10px) scale(1.02); border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25), inset 0 0 0 1px rgba(255,255,255,1); }
        .premium-card.business:hover { transform: translateY(-10px) scale(1.02); border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25), inset 0 0 0 1px rgba(255,255,255,1); }
        .icon-box { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .premium-card:hover .icon-box { transform: scale(1.12) rotate(5deg); }

        /* ================= 🔴 NEW: PREMIUM SAAS BENTO CARDS (Why Choose Us) ================= */
        .bento-premium {
          position: relative;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          z-index: 1;
        }
        
        /* Glass Sweep on Hover */
        .bento-premium::before {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent);
          transform: skewX(-25deg);
          transition: left 0.7s ease;
          z-index: -1;
        }
        .bento-premium:hover::before {
          left: 150%;
        }

        /* Dynamic Colored Shadows based on Theme */
        .bento-premium:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.95);
        }
        .bento-premium.blue:hover { border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.emerald:hover { border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.orange:hover { border-color: rgba(249, 115, 22, 0.3); box-shadow: 0 20px 40px -15px rgba(249, 115, 22, 0.15), inset 0 0 0 1px #fff; }
        .bento-premium.purple:hover { border-color: rgba(168, 85, 247, 0.3); box-shadow: 0 20px 40px -15px rgba(168, 85, 247, 0.15), inset 0 0 0 1px #fff; }

        /* Smooth Icon Pop */
        .bento-icon-box {
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .bento-premium:hover .bento-icon-box {
          transform: scale(1.15);
          box-shadow: 0 10px 25px -5px currentColor; /* Creates a glow of the icon's color */
        }
      `}),(0,o.jsx)(`div`,{className:`fixed inset-0 w-full h-full bg-cover bg-no-repeat bg-[center_right_-15rem] lg:bg-center -z-10 pointer-events-none`,style:{backgroundImage:`url(${i})`},children:(0,o.jsx)(`div`,{className:`absolute inset-0 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/90 md:via-[#f8fafc]/80 to-transparent`})}),(0,o.jsxs)(`div`,{className:`aurora-bg`,children:[(0,o.jsx)(`div`,{className:`orb-1`}),(0,o.jsx)(`div`,{className:`orb-2`}),(0,o.jsx)(`div`,{className:`orb-3`})]}),(0,o.jsx)(`section`,{className:`relative z-10 w-full min-h-[95vh] flex items-center pt-20 pb-10`,children:(0,o.jsx)(`div`,{className:`max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full`,children:(0,o.jsxs)(`div`,{className:`w-full md:w-[85%] lg:w-[70%] xl:w-[55%] relative z-20`,children:[(0,o.jsxs)(`div`,{className:`reveal-1 inline-flex items-center bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-slate-800 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6`,children:[(0,o.jsxs)(`span`,{className:`relative flex h-2.5 w-2.5 mr-2.5`,children:[(0,o.jsx)(`span`,{className:`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75`}),(0,o.jsx)(`span`,{className:`relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500`})]}),`Next-Gen Appointment OS`]}),(0,o.jsxs)(`h1`,{className:`reveal-2 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black text-textMain tracking-tighter mb-5 leading-[1.05]`,children:[`Book Anything. `,(0,o.jsx)(`br`,{}),(0,o.jsx)(`span`,{className:`text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500`,children:`Wait For Nothing.`})]}),(0,o.jsx)(`p`,{className:`reveal-2 text-base sm:text-lg text-textMuted mb-10 max-w-lg leading-relaxed font-medium`,children:`Join millions experiencing the future of queue management. Smart, instant, and effortlessly beautiful.`}),(0,o.jsxs)(`form`,{onSubmit:n=>{n.preventDefault(),e(`/customers?service=${encodeURIComponent(t.trim().toLowerCase())}&location=${encodeURIComponent(s.trim().toLowerCase())}`)},className:`reveal-3 command-center p-2 flex flex-col md:flex-row items-center gap-1 mb-10 max-w-3xl z-50`,children:[(0,o.jsxs)(`div`,{className:`relative flex-1 flex items-center px-4 py-3 w-full group input-group rounded-xl transition-colors`,children:[(0,o.jsx)(`span`,{className:`text-slate-400 mr-2.5 group-focus-within:text-blue-600 transition-colors duration-300`,children:(0,o.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,o.jsx)(`line`,{x1:`21`,y1:`21`,x2:`16.65`,y2:`16.65`})]})}),(0,o.jsx)(`input`,{type:`text`,value:t,onChange:e=>{let t=e.target.value;if(r(t),u(!0),t.trim()===``){m([]);return}let n=t.toLowerCase();m(S.filter(e=>e.name.toLowerCase().includes(n)||e.category.toLowerCase().includes(n)).slice(0,8))},onFocus:()=>u(!0),onBlur:()=>setTimeout(()=>u(!1),200),placeholder:`What service do you need?`,className:`w-full outline-none text-textMain bg-transparent text-sm sm:text-base font-semibold placeholder:text-textMuted`,autoComplete:`off`}),l&&t.trim().length>0&&(0,o.jsx)(`div`,{className:`absolute top-[115%] left-0 w-full dropdown-card bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto transform origin-top animate-in fade-in zoom-in-95 duration-200`,children:p.length>0?(0,o.jsxs)(`ul`,{className:`p-2`,children:[(0,o.jsx)(`li`,{className:`px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider`,children:`Top Matches`}),p.map((e,t)=>(0,o.jsxs)(`li`,{onMouseDown:()=>{r(e.name),u(!1)},className:`dropdown-item px-4 py-2.5 hover:bg-white/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors group`,children:[(0,o.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,o.jsx)(`span`,{className:`text-xl drop-shadow-sm group-hover:scale-110 transition-transform`,children:e.icon}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`p`,{className:`text-slate-900 font-bold text-sm`,children:e.name}),(0,o.jsx)(`p`,{className:`text-slate-500 text-[11px] font-medium`,children:e.category})]})]}),(0,o.jsx)(`span`,{className:`text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors`,children:e.type})]},t))]}):(0,o.jsx)(`div`,{className:`p-5 text-sm text-slate-500 text-center font-medium`,children:`No matches found.`})})]}),(0,o.jsx)(`div`,{className:`hidden md:block w-px h-8 bg-slate-200`}),(0,o.jsxs)(`div`,{className:`relative flex-1 flex items-center px-4 py-3 w-full group input-group rounded-xl transition-colors`,children:[(0,o.jsx)(`span`,{className:`text-slate-400 mr-2.5 group-focus-within:text-emerald-500 transition-colors duration-300`,children:(0,o.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`,{d:`M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z`}),(0,o.jsx)(`circle`,{cx:`12`,cy:`10`,r:`3`})]})}),(0,o.jsx)(`input`,{type:`text`,value:s,onChange:e=>{let t=e.target.value;c(t),f(!0),x.current&&clearTimeout(x.current),t.trim().length>2?(v(!0),x.current=setTimeout(async()=>{try{g(await(await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${t}&countrycodes=in&limit=5&addressdetails=1`)).json())}catch(e){console.error(`Location API Failed`,e)}v(!1)},500)):(g([]),v(!1))},onFocus:()=>f(!0),onBlur:()=>setTimeout(()=>f(!1),200),placeholder:`Where? (e.g. City)`,className:`w-full outline-none text-textMain bg-transparent text-sm sm:text-base font-semibold placeholder:text-textMuted`,autoComplete:`off`}),(0,o.jsx)(`button`,{type:`button`,onClick:e=>{e.preventDefault(),b(!0),navigator.geolocation?navigator.geolocation.getCurrentPosition(async e=>{let{latitude:t,longitude:n}=e.coords;try{let e=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${t}&lon=${n}`)).json();c(`${e.address.city||e.address.town||e.address.state_district||``}, ${e.address.state||``}`)}catch{c(`Location Found`)}finally{b(!1),f(!1)}},()=>b(!1)):b(!1)},className:`text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-300`,title:`Detect Location`,children:y?(0,o.jsx)(`div`,{className:`w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin`}):(0,o.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`}),(0,o.jsx)(`path`,{d:`M12 2v3`}),(0,o.jsx)(`path`,{d:`M12 19v3`}),(0,o.jsx)(`path`,{d:`M2 12h3`}),(0,o.jsx)(`path`,{d:`M19 12h3`}),(0,o.jsx)(`circle`,{cx:`12`,cy:`12`,r:`7`})]})}),d&&s.trim().length>2&&(0,o.jsx)(`div`,{className:`absolute top-[115%] left-0 w-full dropdown-card bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto transform origin-top animate-in fade-in zoom-in-95 duration-200`,children:_?(0,o.jsxs)(`div`,{className:`p-6 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm font-medium`,children:[(0,o.jsx)(`div`,{className:`w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin`}),`Scanning precise locations...`]}):h.length>0?(0,o.jsxs)(`ul`,{className:`p-2`,children:[(0,o.jsx)(`li`,{className:`px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider`,children:`Locations Found`}),h.map((e,t)=>{let n=e.display_name.split(`, `);return(0,o.jsxs)(`li`,{onMouseDown:()=>{c(`${n[0]}, ${n.slice(1,3).join(`, `)}`),f(!1)},className:`dropdown-item px-4 py-2 hover:bg-white/80 rounded-xl cursor-pointer flex items-start gap-3 transition-colors group`,children:[(0,o.jsx)(`span`,{className:`text-slate-300 mt-0.5 group-hover:text-emerald-500 transition-colors`,children:(0,o.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`,{d:`M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z`}),(0,o.jsx)(`circle`,{cx:`12`,cy:`10`,r:`3`})]})}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`p`,{className:`text-textMain font-bold text-sm`,children:n[0]}),(0,o.jsx)(`p`,{className:`text-textMuted text-[11px] mt-0.5 font-medium`,children:n.slice(1,3).join(`, `)})]})]},t)})]}):(0,o.jsx)(`div`,{className:`p-5 text-sm text-slate-500 text-center font-medium`,children:`No places found.`})})]}),(0,o.jsx)(`button`,{type:`submit`,className:`shimmer-btn bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors duration-300 w-full md:w-auto shrink-0 shadow-lg`,children:`Search`})]}),(0,o.jsxs)(`div`,{className:`reveal-4 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl`,children:[(0,o.jsxs)(`div`,{className:`premium-card customer group cursor-pointer`,onClick:()=>e(`/customers`),children:[(0,o.jsx)(`div`,{className:`absolute -right-4 -bottom-4 text-[100px] opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none`,children:`👤`}),(0,o.jsx)(`div`,{className:`icon-box w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-600 rounded-[14px] flex items-center justify-center shrink-0 text-2xl mb-4 shadow-inner relative z-10`,children:`👤`}),(0,o.jsx)(`h4`,{className:`font-black text-textMain text-xl mb-2 group-hover:text-blue-600 transition-colors relative z-10`,children:`I'm a Customer`}),(0,o.jsx)(`p`,{className:`text-sm text-textMuted mb-5 font-medium leading-relaxed relative z-10`,children:`Book elite appointments or join live queues instantly with zero wait times.`}),(0,o.jsxs)(`div`,{className:`flex items-center text-xs font-bold text-textMain group-hover:text-blue-600 transition-colors bg-surface w-fit px-4 py-2 rounded-full border border-borderSoft group-hover:border-blue-300 relative z-10`,children:[`Get Started `,(0,o.jsx)(`span`,{className:`ml-2 group-hover:translate-x-1.5 transition-transform duration-300 text-sm`,children:`🚀`})]})]}),(0,o.jsxs)(`div`,{className:`premium-card business group cursor-pointer`,onClick:()=>e(`/business-register`),children:[(0,o.jsx)(`div`,{className:`absolute -right-4 -bottom-4 text-[100px] opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none`,children:`🏪`}),(0,o.jsx)(`div`,{className:`icon-box w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-600 rounded-[14px] flex items-center justify-center shrink-0 text-2xl mb-4 shadow-inner relative z-10`,children:`🏪`}),(0,o.jsx)(`h4`,{className:`font-black text-textMain text-xl mb-2 group-hover:text-emerald-600 transition-colors relative z-10`,children:`Business Owner`}),(0,o.jsx)(`p`,{className:`text-sm text-textMuted mb-5 font-medium leading-relaxed relative z-10`,children:`Manage appointments and scale your operations beautifully with smart tools.`}),(0,o.jsxs)(`div`,{className:`flex items-center text-xs font-bold text-textMain group-hover:text-emerald-600 transition-colors bg-surface w-fit px-4 py-2 rounded-full border border-borderSoft group-hover:border-emerald-300 relative z-10`,children:[`Register Now `,(0,o.jsx)(`span`,{className:`ml-2 group-hover:translate-x-1.5 transition-transform duration-300 text-sm`,children:`✨`})]})]})]})]})})}),(0,o.jsx)(`section`,{className:`relative z-10 w-full ultra-glass py-24`,children:(0,o.jsxs)(`div`,{className:`max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16`,children:[(0,o.jsxs)(`div`,{className:`mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6`,children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`h2`,{className:`text-4xl md:text-5xl lg:text-6xl font-black text-textMain mb-4 tracking-tight drop-shadow-sm`,children:`Why Choose Us?`}),(0,o.jsx)(`p`,{className:`text-textMuted max-w-xl text-lg font-medium`,children:`A modern solution designed to save time for you and your business.`})]}),(0,o.jsxs)(`div`,{className:`flex -space-x-3`,children:[(0,o.jsx)(`div`,{className:`w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-lg z-30 text-lg`,children:`⭐`}),(0,o.jsx)(`div`,{className:`w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-lg z-20 text-lg`,children:`🔥`}),(0,o.jsx)(`div`,{className:`h-12 px-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg z-10 text-white text-sm font-bold pl-6`,children:`5k+ Trusted`})]})]}),(0,o.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8`,children:[{color:`blue`,title:`Easy Booking`,desc:`Book appointments or join queues in just a few clicks.`,svg:(0,o.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`,ry:`2`}),(0,o.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,o.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,o.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`}),(0,o.jsx)(`path`,{d:`M9 16l2 2 4-4`})]})},{color:`emerald`,title:`Live Sync`,desc:`Real-time updates on your queue or appointment status.`,svg:(0,o.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`}),(0,o.jsx)(`path`,{d:`M3 3v5h5`})]})},{color:`orange`,title:`Save Time`,desc:`Skip the line and save valuable time for what matters most.`,svg:(0,o.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,o.jsx)(`polyline`,{points:`12 6 12 12 16 14`})]})},{color:`purple`,title:`Bank-Grade Secure`,desc:`Your data is safe with us. We ensure a secure experience.`,svg:(0,o.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`,{d:`M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`}),(0,o.jsx)(`path`,{d:`M9 12l2 2 4-4`})]})}].map((e,t)=>(0,o.jsxs)(`div`,{className:`bento-premium ${e.color} group flex flex-col items-start cursor-default`,children:[(0,o.jsx)(`div`,{className:`bento-icon-box w-16 h-16 bg-${e.color}-50 border border-${e.color}-200 text-${e.color}-600 rounded-2xl flex items-center justify-center mb-6`,children:e.svg}),(0,o.jsx)(`h4`,{className:`text-2xl font-bold text-slate-900 mb-3 group-hover:text-black transition-colors`,children:e.title}),(0,o.jsx)(`p`,{className:`text-base text-slate-600 font-medium leading-relaxed group-hover:text-slate-800 transition-colors`,children:e.desc})]},t))})]})})]})};export{s as default};