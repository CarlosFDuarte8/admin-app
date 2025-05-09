import { useState } from 'react';
import apiClient from '../api/client';

interface LoginCredentials {
  login: string;
  senha: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  user: any | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isAuthenticated: false,
    error: null,
    user: null,
  });

  const login = async (credentials: LoginCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const response = await apiClient.post('/api/login', credentials);
      setState({
        isLoading: false,
        isAuthenticated: true,
        error: null,
        user: response.data,
      });
      return response.data;
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Falha ao realizar login',
      });
      throw error;
    }
  };

  const logout = () => {
    setState({
      isLoading: false,
      isAuthenticated: false,
      error: null,
      user: null,
    });
  };

  return {
    ...state,
    login,
    logout,
  };
};