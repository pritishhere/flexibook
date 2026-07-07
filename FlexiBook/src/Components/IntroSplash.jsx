// src/Components/IntroSplash.jsx
import React, { useState, useEffect, useRef } from 'react';

const IntroSplash = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);
  const [showUnmute, setShowUnmute] = useState(false); 
  const videoRef = useRef(null);

  useEffect(() => {
    // 🧠 SMART AUTOPLAY LOGIC
    if (videoRef.current) {
      videoRef.current.volume = 0.8; // Volume 80%
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // 🚨 Agar browser audio block kare, toh mute karke chalao aur Unmute button dikhao
          videoRef.current.muted = true;
          videoRef.current.play();
          setShowUnmute(true); 
        });
      }
    }
  }, []);

  // 🔊 User is function se aawaz khol dega
  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.currentTime = 0; // Video wapas 0 se start hogi perfect sync ke liye
      setShowUnmute(false);
    }
  };

  const handleIntroComplete = () => {
    setIsFading(true); 
    // Smooth 1.2 second fade out transition
    setTimeout(() => {
      onFinish();
    }, 1200); 
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center transition-opacity duration-[1200ms] ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        /* ========================================================
           🚀 FINAL PRO-LEVEL ENGINE (WATERMARK DESTROYER)
        ======================================================== */
        
        .ultra-hd-video {
          /* 🔥 EXACT SCALE SET TO 1.27 BY BOSS: Watermark completely out of frame! */
          transform: translate3d(0, 0, 0) scale(1.27); 
          will-change: transform; 
          backface-visibility: hidden;
          perspective: 1000px;
          /* Lag-free cinematic color booster */
          filter: contrast(1.05) saturate(1.1) brightness(1.02); 
        }

        .film-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
          z-index: 20;
          pointer-events: none;
        }

        .premium-vignette {
          background: radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.9) 100%);
          z-index: 10;
          pointer-events: none;
        }

        /* Premium Pulse Animation for Unmute Button */
        @keyframes subtlePulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
          70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        
        .pro-unmute-btn {
          animation: subtlePulse 2s infinite;
        }
      `}</style>

      {/* 🔴 THE 4K VIDEO LAYER */}
      <video
        ref={videoRef}
        src="/intro-video.mp4" 
        playsInline
        preload="auto" 
        onEnded={handleIntroComplete} 
        onError={handleIntroComplete} 
        className="absolute inset-0 w-full h-full object-cover ultra-hd-video pointer-events-none" 
      />

      {/* 🔴 CINEMATIC OVERLAYS */}
      <div className="absolute inset-0 w-full h-full film-grain opacity-[0.03]"></div>
      <div className="absolute inset-0 w-full h-full premium-vignette"></div>

      {/* 🔊 PRO-LEVEL UNMUTE BUTTON (Glassmorphism + SVG) */}
      {showUnmute && (
        <button 
          onClick={handleUnmute}
          className="absolute top-12 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center gap-3 hover:bg-white/10 hover:border-white/40 transition-all duration-300 z-50 cursor-pointer pro-unmute-btn group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 group-hover:text-white transition-colors"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-white/90 group-hover:text-white transition-colors">
            UNMUTE SOUND
          </span>
        </button>
      )}

      {/* ⏭️ SKIP BUTTON */}
      <button 
        onClick={handleIntroComplete}
        className={`absolute bottom-8 right-8 px-6 py-2.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-xl text-white/50 text-[10px] sm:text-xs tracking-[0.3em] font-mono hover:bg-white/20 hover:text-white transition-all duration-500 z-50 group cursor-pointer ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        SKIP <span className="group-hover:translate-x-1.5 inline-block transition-transform duration-300 ease-out">&rarr;</span>
      </button>

    </div>
  );
};

export default IntroSplash;