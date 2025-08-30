import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark theme
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark theme colors
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      surface: 'rgba(15, 23, 42, 0.95)',
      surfaceSecondary: 'rgba(30, 41, 59, 0.95)',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: 'rgba(148, 163, 184, 0.1)',
      borderSecondary: 'rgba(148, 163, 184, 0.2)',
      accent: 'rgba(139, 92, 246, 0.4)',
      hover: 'rgba(148, 163, 184, 0.2)',
      card: 'rgba(15, 23, 42, 0.8)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    } : {
      // Light theme colors - Pure white and black
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffffff 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      surfaceSecondary: 'rgba(255, 255, 255, 0.95)',
      text: '#000000',
      textSecondary: '#333333',
      border: 'rgba(0, 0, 0, 0.1)',
      borderSecondary: 'rgba(0, 0, 0, 0.2)',
      accent: 'rgba(139, 92, 246, 0.2)',
      hover: 'rgba(0, 0, 0, 0.05)',
      card: 'rgba(255, 255, 255, 0.95)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.3)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
