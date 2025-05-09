import { DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Tema claro personalizado
export const LightTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    primary: '#007bff',
    accent: '#f1c40f',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#212121',
    border: '#e0e0e0',
    notification: '#f50057',
  },
};

// Tema escuro personalizado
export const DarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    primary: '#0d6efd',
    accent: '#ffc107',
    background: '#121212',
    card: '#1e1e1e',
    text: '#f8f9fa',
    border: '#2c2c2c',
    notification: '#ff4081',
  },
};

export type AppTheme = typeof LightTheme;