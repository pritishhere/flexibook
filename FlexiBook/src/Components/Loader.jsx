import React from 'react';

const Loader = () => {
  return (
    // Background - Minimalist clean glass effect
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-xl overflow-hidden">
      
      {/* 🔴 THE MASTER ALIGNMENT HUB (Bohot chota aur compact kiya: w-16 h-16) */}
      <div className="relative flex items-center justify-center w-16 h-16">

        {/* LAYER 1: Outer Orbit (Border thodi patli ki taaki chote size pe over-crowded na lage) */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-blue-400/40 animate-orbit-1 opacity-70"></div>

        {/* LAYER 2: Inner Asymmetric Orbit */}
        <div className="absolute inset-2 rounded-full border-t-2 border-r-[1.5px] border-transparent border-t-purple-500 border-r-cyan-400 animate-orbit-2 drop-shadow-lg"></div>

        {/* LAYER 3: The Radar Sonar Waves (Ekdum choti: w-4 h-4) */}
        <div className="absolute w-4 h-4 rounded-full border-blue-500 animate-sonar-wave"></div>
        <div className="absolute w-4 h-4 rounded-full border-purple-500 animate-sonar-wave sonar-delay-1"></div>
        <div className="absolute w-4 h-4 rounded-full border-cyan-400 animate-sonar-wave sonar-delay-2"></div>

        {/* LAYER 4: THE QUANTUM CORE (Micro core ball: w-2.5 h-2.5) */}
        <div className="relative z-10 w-2.5 h-2.5 rounded-full animate-quantum-core"></div>

        {/* LAYER 5: The Energy Satellite (Chota dot: w-1 h-1) */}
        <div className="absolute inset-1 animate-orbit-1">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_1px_#22d3ee]"></div>
        </div>

      </div>

      {/* 🔴 THE FUTURISTIC TYPOGRAPHY */}
      <div className="mt-4 flex flex-col items-center z-20">
        
        {/* 🌟 TEXT SIZE EKDUM CHOTA KIYA: text-[10px] */}
        <h1 className="text-[10px] font-black tracking-[0.3em] uppercase animate-cyber-text whitespace-nowrap">
          Initializing engine...
        </h1>

      {/* Subtext chota kiya: text-[8px] */}
      <p className="text-[7px] font-black tracking-[0.3em] uppercase animate-sub-cyber-text whitespace-nowrap mt-1">
          preparing your book...
      </p>

        {/* Digital Data Loader (Bars ki height aur width choti ki: h-[2px]) */}
        <div className="flex gap-1 mt-2">
          <div className="w-4 h-[2px] bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
          <div className="w-2.5 h-[2px] bg-purple-500 rounded-full animate-pulse delay-75 shadow-[0_0_8px_#8b5cf6]"></div>
          <div className="w-1.5 h-[2px] bg-cyan-400 rounded-full animate-pulse delay-150 shadow-[0_0_8px_#06b6d4]"></div>
        </div>
        
      </div>

    </div>
  );
};

export default Loader;