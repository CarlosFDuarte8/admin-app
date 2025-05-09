import React, { useEffect } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { AuthRoutes } from "./auth.route";
import { AppRoutes } from "./app.route";
import { useAuthContext } from "../context/AuthContext";
import { SplashScreen } from "../components/SplashScreen";

export const AppNavigator = () => {
  const { theme, isDarkTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Criar um tema compatível com o NavigationContainer
  const navigationTheme = {
    ...(isDarkTheme ? NavigationDarkTheme : DefaultTheme),
    colors: {
      ...(isDarkTheme ? NavigationDarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
  };

  // Adicionar um log para depuração da mudança de estado de autenticação
  useEffect(() => {
    console.log(
      "Estado de autenticação mudou:",
      isAuthenticated ? "Autenticado" : "Não autenticado"
    );
  }, [isAuthenticated]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      {isAuthenticated ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
};
