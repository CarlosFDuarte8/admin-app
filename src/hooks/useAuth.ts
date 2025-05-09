import { useState } from "react";
import apiClient from "../api/client";

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

  const getMe = async () => {
    try {
      const response = await apiClient.get("/api/me");
      console.log("User ME:", response.data);
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
        error:
          error instanceof Error ? error.message : "Falha ao obter usuário",
      });
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setState({ ...state, isLoading: true, error: null });

    try {
      console.log("Login credentials:", credentials);
      const response = await apiClient.post<{
        token: string;
        login: string;
        refreshToken: string;
      }>("/api/login", credentials);

      console.log("User:", response.data.token);
      await getMe();
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
        error:
          error instanceof Error ? error.message : "Falha ao realizar login",
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
    setState, // Exportando a função setState para permitir alterações diretas ao estado
  };
};
