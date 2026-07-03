// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import CustomerRegister from './CustomerRegister';
import ForgotPassword from './ForgotPassword'; // Imported newly created recovery component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Routing Configuration */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup-gateway" element={<CustomerRegister />} />
        <Route path="/customer-register" element={<CustomerRegister />} />
        
        {/* NEW: Operational endpoint mapping rule */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Catch-all fallback route defaults back to platform landing */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;