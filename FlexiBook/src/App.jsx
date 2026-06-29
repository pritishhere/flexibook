// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './HomePage';
import CustomerPage from './CustomerPage';
import LoginPage from './LoginPage'; 
import SignUpGateway from './SignUpGateway'; 
import CustomerRegister from './CustomerRegister'; // Imported the new registration form page
import BusinessRegistration from "./BusinessRegistration/BusinessRegistration";

function App() {
  return (
    <Router>
      {/* Header stays static at the top of every page */}
      <Header />
      
      {/* App wrapper to ensure full page layout scaling */}
      <div className="min-h-screen">
        <Routes>
          {/* Main Landing/Home Page */}
          <Route path="/" element={<HomePage />} />     
          
          {/* Customers Features Page */}
          <Route path="/customers" element={<CustomerPage />} />
          
          {/* Styled Login View */}
          <Route path="/login" element={<LoginPage />} />       
          
          {/* Gateway room that splits into Customer vs Business choices */}
          <Route path="/business-register" element={<SignUpGateway />} />
          
          {/* Full Customer Registration Account Form */}
          <Route path="/customer-register" element={<CustomerRegister />} />
          
          {/* Full Business Profile Registration Form */}
          <Route path="/real-business-form" element={<BusinessRegistration />} /> 
        </Routes>
      </div>
      
      {/* Footer stays static at the bottom of every page */}
      <Footer />
    </Router>
  );
}

export default App;