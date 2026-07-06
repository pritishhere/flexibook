import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const setDark = () => setIsDarkMode(true);
  const setLight = () => setIsDarkMode(false);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setDark, setLight }}>
      {children}
    </ThemeContext.Provider>
  );
};
