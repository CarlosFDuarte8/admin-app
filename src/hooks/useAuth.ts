import { useState } from "react";
import apiClient from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      console.log("Chamando getMe");
      const token = await AsyncStorage.getItem("@auth:token");
      console.log("Token no getMe:", token);

      // Verificar se já temos dados do usuário no AsyncStorage
      const cachedUserData = await AsyncStorage.getItem("@auth:user");
      const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : null;

      try {
        // Endpoint correto para obter dados do usuário
        const response = await apiClient.get("/api/usuario/me");
        console.log("Resposta getMe:", response.data);

        // Atualizar o estado após obter os dados do usuário
        const userData = response.data;
        setState({
          ...state,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          user: userData,
        });

        return userData;
      } catch (apiError) {
        console.warn("Erro ao acessar /api/usuario/me:", apiError);

        // Se ocorrer um erro mas tivermos dados do usuário em cache, usamos esses dados
        if (cachedUser) {
          console.log("Usando dados do usuário em cache:", cachedUser);
          setState({
            ...state,
            isLoading: false,
            isAuthenticated: true,
            error: null,
            user: cachedUser,
          });
          return cachedUser;
        }

        // Se não tivermos dados em cache, propagamos o erro
        throw apiError;
      }
    } catch (error) {
      console.error("Erro em getMe:", error);

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
    try {
      console.log("Iniciando login com:", credentials);
      setState({ ...state, isLoading: true, error: null });

      // Fazer a requisição de login
      const response = await apiClient.post("/api/login", credentials);
      console.log("Resposta do login:", response.data);
      

      if (!response.data || !response.data.token) {
        throw new Error("Token não recebido do servidor");
      }

      // Armazenar o token no AsyncStorage
      await AsyncStorage.setItem("@auth:token", response.data.token);
      console.log("Token armazenado:", response.data.token);

      // Armazenar o refreshToken se disponível
      if (response.data.refreshToken) {
        await AsyncStorage.setItem(
          "@auth:refreshToken",
          response.data.refreshToken
        );
      }

      // Criar objeto com informações do usuário disponíveis na resposta de login
      let user = {
        login: credentials.login,
        ...response.data,
      };

      try {
        // Tentar obter mais informações do usuário via endpoint correto
        console.log("Chamando getMe após login");
        const userData = await getMe();
        console.debug("Dados do usuário obtidoss :", userData);
        user = { ...user, ...userData };
      } catch (meError) {
        // Se falhar, continuamos com os dados que já temos
        const error = meError as any;
        if (error.response && error.response.status === 404) {
          console.log(
            "Endpoint /api/usuario/me com problemas, usando dados básicos do usuário"
          );
        } else {
          console.error("Erro ao obter dados adicionais do usuário:", meError);
        }
        // Continuamos mesmo se getMe falhar, já temos informações básicas do usuário
      }

      // Atualizar o estado com o usuário logado
      setState({
        isLoading: false,
        isAuthenticated: true,
        error: null,
        user,
      });

      // Armazenar os dados do usuário
      await AsyncStorage.setItem("@auth:user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Erro no login:", error);

      setState({
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error:
          error instanceof Error ? error.message : "Falha ao realizar login",
      });

      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remover tokens e dados do usuário do AsyncStorage
      await AsyncStorage.removeItem("@auth:token");
      await AsyncStorage.removeItem("@auth:refreshToken");
      await AsyncStorage.removeItem("@auth:user");

      // Atualizar o estado
      setState({
        isLoading: false,
        isAuthenticated: false,
        error: null,
        user: null,
      });

      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return {
    ...state,
    login,
    logout,
    getMe,
    setState, // Exportando a função setState para permitir alterações diretas ao estado
  };
};
