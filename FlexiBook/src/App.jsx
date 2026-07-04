// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import HomePage from './HomePage';
import CustomerPage from './CustomerPage';
import AboutPage from './AboutPage';
import CategoriesPage from './CategoriesPage';
import LoginPage from './LoginPage';
import SignUpGateway from './SignUpGateway';
import CustomerRegister from './CustomerRegister';
import BusinessRegistration from './BusinessRegistration/BusinessRegistration';

function App() {
  return (
    <Router>
      <Header />

      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Main gateway paths */}
          <Route path="/business-register" element={<SignUpGateway />} />

          {/* ALIAS SAFETY NET: This catches /register and sends them to the gateway too */}
          <Route path="/register" element={<SignUpGateway />} />

          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/real-business-form" element={<BusinessRegistration />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
