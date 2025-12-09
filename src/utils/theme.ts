import { Theme } from '../types/Task';

export const lightColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceLight: '#e8e8e8',
  text: '#1a1a1a',
  textSecondary: '#4a4a4a',
  textTertiary: '#808080',
  primary: '#4a9eff',
  primaryDark: '#3a8eef',
  border: '#d0d0d0',
  completed: '#4a9eff',
  priority: {
    high: '#ff6b6b',
    medium: '#ffa94d',
    low: '#51cf66',
  },
  checkbox: {
    checked: '#4a9eff',
    unchecked: '#d0d0d0',
  },
};

export const darkColors = {
  background: '#1a1a1a',
  surface: '#2a2a2a',
  surfaceLight: '#3a3a3a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  primary: '#4a9eff',
  primaryDark: '#3a8eef',
  border: '#404040',
  completed: '#4a9eff',
  priority: {
    high: '#ff6b6b',
    medium: '#ffa94d',
    low: '#51cf66',
  },
  checkbox: {
    checked: '#4a9eff',
    unchecked: '#404040',
  },
};

export const getColors = (theme: Theme) => {
  return theme === 'light' ? lightColors : darkColors;
};

