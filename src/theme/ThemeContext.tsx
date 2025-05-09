import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, AppTheme } from './themes';

// Definição dos tipos de temas possíveis
export type ThemeType = 'light' | 'dark' | 'system';

// Interface para o contexto de tema
interface ThemeContextProps {
  theme: AppTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDarkTheme: boolean;
}

// Criação do contexto de tema
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Chave para armazenar a preferência de tema no AsyncStorage
const THEME_PREFERENCE_KEY = '@theme_preference';

// Provedor do contexto de tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para armazenar o tipo de tema selecionado
  const [themeType, setThemeType] = useState<ThemeType>('system');
  
  // Obtém o tema do sistema
  const systemTheme = useColorScheme();
  
  // Verifica se o tema atual é dark
  const isDarkTheme = themeType === 'dark' || (themeType === 'system' && systemTheme === 'dark');
  
  // Define o tema com base na preferência
  const theme = isDarkTheme ? DarkTheme : LightTheme;

  // Carrega a preferência de tema do usuário ao iniciar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeType = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedThemeType) {
          setThemeType(savedThemeType as ThemeType);
        }
      } catch (e) {
        console.error('Erro ao carregar preferência de tema:', e);
      }
    };

    loadThemePreference();
  }, []);

  // Salva a preferência de tema quando ela muda
  const handleSetThemeType = async (type: ThemeType) => {
    setThemeType(type);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, type);
    } catch (e) {
      console.error('Erro ao salvar preferência de tema:', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        setThemeType: handleSetThemeType,
        isDarkTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar o contexto de tema
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};