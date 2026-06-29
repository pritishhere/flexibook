import React from 'react';
import { Header } from './Header'; // Apne Header ka sahi path check kar lein
import { Footer } from './Footer'; // Apne Footer ka sahi path check kar lein

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Default Header */}
      <Header />

      {/* Har page ki alag body yahan load hogi */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Default Footer */}
      <Footer />
    </div>
  );
};

export default Layout;