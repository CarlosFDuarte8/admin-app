import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, ActivityIndicator, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { AuthRoutes } from "./auth.route";
import { AppRoutes } from "./app.route";
import { useAuthContext } from "../context/AuthContext";

export const AppNavigator = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Adicionar um log para depuração da mudança de estado de autenticação
  useEffect(() => {
    console.log(
      "Estado de autenticação mudou:",
      isAuthenticated ? "Autenticado" : "Não autenticado"
    );
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      {isAuthenticated ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
};
