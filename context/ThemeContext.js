import React, { createContext, useContext, useState } from 'react';

// Theme configurations
const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#4CAF50',
      primaryDark: '#45a049',
      secondary: '#2196F3',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      cardBackground: '#FFFFFF',
      text: '#2C2C2C',
      textSecondary: '#666666',
      textLight: '#999999',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      income: '#4CAF50',
      expense: '#F44336',
      gradient: ['#4CAF50', '#45a049'],
    },
    statusBar: 'dark-content',
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#66BB6A',
      primaryDark: '#4CAF50',
      secondary: '#42A5F5',
      background: '#121212',
      surface: '#1E1E1E',
      cardBackground: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textLight: '#808080',
      border: '#404040',
      shadow: 'rgba(0, 0, 0, 0.3)',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      income: '#66BB6A',
      expense: '#EF5350',
      gradient: ['#66BB6A', '#4CAF50'],
    },
    statusBar: 'light-content',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    toggleTheme,
    setTheme,
    availableThemes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
