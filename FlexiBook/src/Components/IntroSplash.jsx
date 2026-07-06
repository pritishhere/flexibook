// src/Components/IntroSplash.jsx
import React, { useState } from 'react';

const IntroSplash = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);

  // Yeh function tab chalega jab video poora ho jayega ya user 'Skip' dabayega
  const handleIntroComplete = () => {
    setIsFading(true); // Fade-out animation start karo
    
    // 1 second (1000ms) ke baad component ko DOM se hamesha ke liye hata do
    setTimeout(() => {
      onFinish();
    }, 1000); 
  };

  return (
    // z-[9999] ensures yeh sabse upar rahe. pointer-events-none fade hote waqt clicks ko piche pass karega
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 🔴 MAGIC HERE: Seedha '/flexibook-intro.mp4' likha hai kyunki file public folder mein hai */}
      <video
        src="/flexibook-intro.mp4" 
        autoPlay
        muted // Browser autoplay ke liye ye zaroori hai
        playsInline // Mobile pe video full screen me stuck na ho isliye
        onEnded={handleIntroComplete} // Video khatam hote hi fade out trigger hoga
        className="w-full h-full object-cover" // Aspect ratio maintain rahega
      />

      {/* Elegant Skip Button */}
      <button 
        onClick={handleIntroComplete}
        className={`absolute bottom-8 right-8 px-6 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all duration-300 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Skip Intro &rarr;
      </button>
    </div>
  );
};

export default IntroSplash;