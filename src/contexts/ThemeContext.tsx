import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types/Task';
import { storage } from '../utils/storage';
import { getColors } from '../utils/theme';

interface ThemeContextType {
  theme: Theme;
  colors: ReturnType<typeof getColors>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storage.getTheme();
      setTheme(savedTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await storage.saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: getColors(theme), toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

