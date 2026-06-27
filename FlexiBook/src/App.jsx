// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Aapke components aur pages import kar rahe hain
// Dhyan dein: Agar file paths alag hain toh inhe apne hisaab se adjust kar lena
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './HomePage';
import CustomerPage from './CustomerPage';
import LoginPage from './LoginPage'; // <-- 1. Your Login Page imported here!
import BusinessRegistration from "./BusinessRegistration/BusinessRegistration";
function App() {
  return (
    <Router>
      {/* Header sabse upar rahega, har page par dikhega */}
      <Header />
      {/* Routes decide karta hai ki URL ke hisaab se kaunsa page dikhana hai */}
      <div className="min-h-screen">
        <Routes>
          {/* Jab URL '/' ho, toh HomePage dikhao */}
          <Route path="/" element={<HomePage />} />     
          {/* Jab URL '/customers' ho, toh CustomerPage dikhao */}
          <Route path="/customers" element={<CustomerPage />} />
          {/* Jab URL '/login' ho, toh LoginPage dikhao */}
          <Route path="/login" element={<LoginPage />} /> {/* <-- 2. Your Login Route added here! */}       
          {/*show business registration*/ }
          <Route path="/business-register" element={<BusinessRegistration />} />
        </Routes>
      </div>
      {/* Footer sabse neeche rahega, har page par dikhega */}
      <Footer />
    </Router>
  );
}
export default App;