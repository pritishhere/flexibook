// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import SignUpGateway from './SignupGateway';
import CustomerRegister from './CustomerRegister';
import BusinessLogin from './BusinessLogin';
import BusinessSignUp from './BusinessSignup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Gateway Selection Screen */}
        <Route path="/signup" element={<SignUpGateway />} />
        <Route path="/signup-gateway" element={<SignUpGateway />} />
        
        {/* Customer Forms */}
        <Route path="/customer-register" element={<CustomerRegister />} />
        
        {/* Business Forms */}
        <Route path="/business-login" element={<BusinessLogin />} />
        <Route path="/business-register" element={<BusinessSignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;