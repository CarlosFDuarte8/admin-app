import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (credentials: { login: string; senha: string }) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const auth = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado ao iniciar o app
    
    checkLoginState();
}, []);

const checkLoginState = async () => {
  try {
    const userData = await AsyncStorage.getItem('@auth:user');
    if (userData) {
      // Restaurar o estado de autenticação se encontrar dados do usuário
      const user = JSON.parse(userData);
      console.log('User restored from AsyncStorage', user);
      auth.setState({
        isLoading: false,
        isAuthenticated: true,
        error: null,
        user,
      });
    }
  } catch (error) {
    console.log('Erro ao carregar usuário', error);
  } finally {
    setIsInitializing(false);
  }
};

  // Modificar as funções login e logout para persistir ou remover os dados no AsyncStorage
  const handleLogin = async (credentials: { login: string; senha: string }) => {
    const user = await auth.login(credentials);
    console.log('User', user);
    await AsyncStorage.setItem('@auth:user', JSON.stringify(user));
    await checkLoginState()
    return user;
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('@auth:user');
    auth.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading || isInitializing,
        user: auth.user,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);