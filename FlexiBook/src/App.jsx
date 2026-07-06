// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './Components/Header'; // 💡 NOTE: Apna ThemeSlider is Header component ke andar lagana!
import { Footer } from './Components/Footer';
import Loader from './Components/Loader'; 

/* ====================================================================
   🔥 1. ENTERPRISE CODE SPLITTING (Lazy Loading)
   Hum saare pages ko 'lazy' load kar rahe hain. Iska matlab jab user 
   page par jayega, TABHI live internet se us page ka code aayega. 
   Asli Real-Time Network test yahi hai!
==================================================================== */
const HomePage = lazy(() => import('./HomePage'));
const CustomerPage = lazy(() => import('./CustomerPage'));
const AboutPage = lazy(() => import('./AboutPage'));
const CategoriesPage = lazy(() => import('./CategoriesPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const SignUpGateway = lazy(() => import('./SignUpGateway'));
const CustomerRegister = lazy(() => import('./CustomerRegister'));
const BusinessRegistration = lazy(() => import('./BusinessRegistration/BusinessRegistration'));
const BusinessDashboard = lazy(() => import('./BusinessDashboard'));
const DoctorPortal = lazy(() => import('./DoctorPortal'));


/* ====================================================================
   🧠 2. THE NETWORK INTELLIGENCE ENGINE (Custom Hook)
   Yeh track karta hai Navigation, Offline status, aur API requests ko.
==================================================================== */
const useNetworkIntelligence = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Connection & Offline Tracker
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Route Change Navigation Tracker
  useEffect(() => {
    setIsNavigating(true);
    // Minimum 500ms delay to prevent loader flashing on extremely fast 5G networks
    // aur page ka code load hone ke baad isko band karna
    const timer = setTimeout(() => setIsNavigating(false), 500); 
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isNavigating, isOffline };
};


/* ====================================================================
   🛡️ 3. THE SMART LOADER WRAPPER
==================================================================== */
const IntelligentLoader = () => {
  const { isNavigating, isOffline } = useNetworkIntelligence();
  
  // Agar user offline hai ya naye route par ja raha hai, Loader dikhao
  if (isOffline || isNavigating) return <Loader />;
  return null;
};


/* ====================================================================
   👑 4. MAIN APP COMPONENT (With Semantic Theme & Suspense)
==================================================================== */
function App() {
  return (
    // 🚀 THE MASTER THEME WRAPPER: 
    // Isne pure App ko cover kar liya hai. Ab kisi bhi page mein bg color dene ki zaroorat nahi!
    <div className="min-h-screen w-full flex flex-col bg-base text-textMain transition-colors duration-500 font-sans">
      <Router>
        <IntelligentLoader />
        
        {/* Header mein apna <ThemeSlider /> zaroor import karke laga lijiye ga */}
        <Header />

        {/* Main Content Area (flex-grow pushes footer to the bottom automatically) */}
        <main className="flex-grow">
          {/* REACT SUSPENSE: Yeh sabse high-level feature hai. 
              Jab tak 'lazy' components ka internet se data poori tarah 
              download nahi ho jata, yeh automatically hamara <Loader /> dikhayega! 
          */}
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Main gateway paths */}
              <Route path="/business-register" element={<SignUpGateway />} />
              <Route path="/register" element={<SignUpGateway />} />
              <Route path="/customer-register" element={<CustomerRegister />} />
              <Route path="/real-business-form" element={<BusinessRegistration />} />
              <Route path="/business/dashboard" element={<BusinessDashboard />} />
              <Route path="/doctor/portal" element={<DoctorPortal />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </Router>
    </div>
  );
}

export default App;