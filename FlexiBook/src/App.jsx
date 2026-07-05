// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './Components/Header';
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
   👑 4. MAIN APP COMPONENT (With React Suspense)
==================================================================== */
function App() {
  return (
    <Router>
      <IntelligentLoader />
      
      <Header />

      <div className="min-h-screen">
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
          </Routes>
        </Suspense>
      </div>

      <Footer />
    </Router>
  );
}

export default App;