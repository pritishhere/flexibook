// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import Loader from './Components/Loader'; 
import IntroSplash from './Components/IntroSplash'; // 🔴 INTRO COMPONENT IMPORT KIYA

/* ====================================================================
   🔥 1. ENTERPRISE CODE SPLITTING (Lazy Loading)
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
==================================================================== */
const useNetworkIntelligence = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

  useEffect(() => {
    setIsNavigating(true);
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
  if (isOffline || isNavigating) return <Loader />;
  return null;
};

/* ====================================================================
   👑 4. MAIN APP COMPONENT
==================================================================== */
function App() {
  // 🔴 CHECK: Session memory to see if intro has already played
  const [introFinished, setIntroFinished] = useState(() => {
    return sessionStorage.getItem('hasSeenIntro') === 'true';
  });

  // 🔴 Function triggered when video ends or is skipped
  const handleIntroFinish = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setIntroFinished(true);
  };

  return (
    // Master Wrapper
    <div className="min-h-screen w-full flex flex-col bg-base text-textMain transition-colors duration-500 font-sans relative">
      
      {/* 🔴 THE MAGIC: Agar intro khatam nahi hua, toh sabse upar IntroSplash dikhao */}
      {!introFinished && <IntroSplash onFinish={handleIntroFinish} />}

      {/* 🔴 THE REVEAL: Jab intro chal raha ho, tab website hide rahegi, video end hone pe smoothly fade-in hogi */}
      <div 
        className={`w-full flex-grow flex flex-col transition-opacity duration-1000 ease-in-out ${
          introFinished ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'
        }`}
      >
        <Router>
          <IntelligentLoader />
          
          <Header />

          <main className="flex-grow pt-20">
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/customers" element={<CustomerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/login" element={<LoginPage />} />
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
    </div>
  );
}

export default App;