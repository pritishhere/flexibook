// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.jsx' // 🔴 Theme Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* 🔴 Iske bina slider kaam nahi karega */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)