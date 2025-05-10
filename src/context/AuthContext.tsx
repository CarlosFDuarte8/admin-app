import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { Alert } from "react-native";

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (credentials: { login: string; senha: string }) => Promise<any>;
  logout: (keepBiometricCredentials?: boolean) => Promise<void>;
  refreshUserData: () => Promise<any>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuth();
  const localAuth = useLocalAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado ao iniciar o app
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      console.log("Verificando estado de login...");
      const token = await AsyncStorage.getItem("@auth:token");
      const userData = await AsyncStorage.getItem("@auth:user");

      console.log("Token encontrado:", token ? "Sim" : "Não");
      console.log("Dados de usuário encontrados:", userData ? "Sim" : "Não");

      if (token && userData) {
        // Restaurar o estado de autenticação se encontrar o token e dados do usuário
        const user = JSON.parse(userData);
        console.log("User restored from AsyncStorage:", user);

        auth.setState({
          isLoading: false,
          isAuthenticated: true,
          error: null,
          user,
        });
      } else {
        console.log("Usuário não autenticado.");
        // Se não encontrar token ou usuário, garantir que o estado está como não autenticado
        auth.setState({
          isLoading: false,
          isAuthenticated: false,
          error: null,
          user: null,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Função para atualizar os dados do usuário usando o token existente
  const refreshUserData = async () => {
    try {
      console.log("Atualizando dados do usuário...");

      try {
        // Tentar obter dados do usuário via getMe (que agora usa o endpoint correto)
        const userData = await auth.getMe();
        await AsyncStorage.setItem("@auth:user", JSON.stringify(userData));
        console.log("Dados do usuário atualizados com sucesso");
        return userData;
      } catch (error: any) {
        console.error("Erro ao atualizar dados do usuário:", error);

        // Verificar se o erro é 404 (endpoint não existe)
        if (error.response && error.response.status === 404) {
          console.log(
            "Endpoint /api/usuario/me não disponível, usando dados em cache"
          );

          // Obter dados do usuário do cache
          const cachedUserData = await AsyncStorage.getItem("@auth:user");
          if (cachedUserData) {
            const user = JSON.parse(cachedUserData);
            return user;
          }
        }

        // Se o erro for de autenticação (401), fazer logout
        if (error.response && error.response.status === 401) {
          console.log("Token expirado ou inválido, realizando logout");
          await handleLogout();
        }

        throw error;
      }
    } catch (error) {
      console.error("Erro ao processar atualização de dados:", error);
      throw error;
    }
  };

  // Função login para autenticar o usuário
  const handleLogin = async (credentials: { login: string; senha: string }) => {
    try {
      console.log("Iniciando processo de login no AuthContext");
      const user = await auth.login(credentials);
      console.log("Login bem-sucedido:", user);
      return user;
    } catch (error) {
      console.error("Erro durante o login:", error);
      throw error;
    }
  };

  // Função melhorada de logout para incluir opção de manter credenciais biométricas
  const handleLogout = async (keepBiometricCredentials = false) => {
    console.log("Iniciando processo de logout...");

    // Se o usuário deseja remover credenciais biométricas
    if (!keepBiometricCredentials && localAuth.hasSavedCredentials()) {
      try {
        // Perguntar ao usuário antes de remover credenciais biométricas
        Alert.alert(
          "Credenciais Biométricas",
          "Deseja remover suas credenciais biométricas salvas?",
          [
            {
              text: "Manter",
              onPress: () => console.log("Mantendo credenciais biométricas"),
              style: "cancel",
            },
            {
              text: "Remover",
              onPress: async () => {
                await localAuth.removeCredentials();
                console.log("Credenciais biométricas removidas com sucesso");
              },
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.error("Erro ao remover credenciais biométricas:", error);
      }
    }

    try {
      // Lista de todas as chaves relacionadas à autenticação que devem ser removidas
      const authKeys = [
        "@auth:token",
        "@auth:refreshToken",
        "@auth:user",
        // Adicione aqui outras chaves relacionadas à autenticação se necessário
      ];

      // Remove todos os itens em paralelo
      await Promise.all(authKeys.map((key) => AsyncStorage.removeItem(key)));

      // Chama o logout no hook de autenticação para atualizar o estado
      await auth.logout();

      console.log(
        "Logout realizado com sucesso, todos os dados de autenticação foram removidos"
      );

      // Note: A navegação para a tela de login deve ser feita no componente que chama o logout
      // ou usando um listener que monitora mudanças no estado de autenticação

      return;
    } catch (error) {
      console.error("Erro durante o logout:", error);
      // Mesmo em caso de erro, tentamos atualizar o estado para não autenticado
      auth.setState({
        isLoading: false,
        isAuthenticated: false,
        error: null,
        user: null,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading || isInitializing,
        user: auth.user,
        login: handleLogin,
        logout: handleLogout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
