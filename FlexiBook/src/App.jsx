import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import Loader from './Components/Loader'; 
import IntroSplash from './Components/IntroSplash'; 
import SignUpPage from './SignUpPage'; 

/* ====================================================================
   🔥 1. ENTERPRISE CODE SPLITTING (Lazy Loading)
==================================================================== */
const HomePage = lazy(() => import('./HomePage'));
const CustomerPage = lazy(() => import('./CustomerPage'));
const AboutPage = lazy(() => import('./AboutPage'));
const CategoriesPage = lazy(() => import('./CategoriesPage'));
const Login = lazy(() => import('./Login'));
const CustomerRegister = lazy(() => import('./CustomerRegister'));
const BusinessRegistration = lazy(() => import('./BusinessRegistration/BusinessRegistration'));
const BusinessDashboard = lazy(() => import('./BusinessDashboard'));
const DoctorPortal = lazy(() => import('./DoctorPortal'));
const AISymptomChecker = lazy(() => import('./AISymptomChecker'));
const AdminComplaintsPanel = lazy(() => import('./AdminComplaintsPanel'));
const BusinessOwnerChoice = lazy(() => import("./BusinessOwnerChoice"));
const BookingHistory = lazy(() => import('./BookingHistory'));

// 🟢 TASK 2 STEP 2: Lazy load MasterDashboard
const MasterDashboard = lazy(() => import('./MasterDashboard'));


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
   🔐 4. ROLE-BASED ACCESS ROUTE GUARD
==================================================================== */
const RoleRoute = ({ children, allowedRoles = [], requireAuth = false }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  // 1. Require Login Guard
  if (requireAuth && !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role Restriction Guard for Logged-In Users
  if (token && user?.role) {
    const role = (user.role || '').toLowerCase();
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      if (role === 'business' || role === 'hospital') {
        return <Navigate to="/business/dashboard" replace />;
      }
      if (role === 'doctor') {
        return <Navigate to="/doctor/portal" replace />;
      }
      if (role === 'admin') {
        return <Navigate to="/admin-complaints" replace />;
      }
      return <Navigate to="/customers" replace />;
    }
  }

  return children;
};

/* ====================================================================
   👑 5. MAIN APP COMPONENT
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
                <Route path="/customers" element={
                  <RoleRoute allowedRoles={['patient', 'customer', 'doctor', 'admin']}>
                    <CustomerPage />
                  </RoleRoute>
                } />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/business-register" element={<BusinessRegistration />} />
                <Route path="/register" element={<BusinessRegistration />} />
                <Route path="/customer-register" element={<CustomerRegister />} />
                <Route path="/real-business-form" element={<BusinessRegistration />} />
                <Route path="/my-bookings" element={ <RoleRoute requireAuth={true} allowedRoles={['patient', 'customer']}> <BookingHistory /></RoleRoute> }/>
                <Route path="/business/dashboard" element={
                  <RoleRoute requireAuth={true} allowedRoles={['business', 'hospital', 'admin']}>
                    <BusinessDashboard />
                  </RoleRoute>
                } />
                <Route path="/doctor/portal" element={
                  <RoleRoute requireAuth={true} allowedRoles={['doctor', 'admin']}>
                    <DoctorPortal />
                  </RoleRoute>
                } />
                <Route path="/ai-symptom-checker" element={<AISymptomChecker />} />
                <Route path="/admin-complaints" element={
                  <RoleRoute requireAuth={true} allowedRoles={['admin']}>
                    <MasterDashboard />
                  </RoleRoute>
                } />
                <Route path="/business-owner" element={<BusinessOwnerChoice />} />

                {/* 🟢 TASK 2 STEP 2: Super Admin Master Dashboard Route */}
                <Route path="/admin-dashboard" element={<MasterDashboard />} />
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