import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { UserForm } from "../components/UserForm";
import { useUserRegistration } from "../hooks/useUserRegistration";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/app.route";
import { User } from "../models/User";
import { useTheme } from "../theme/ThemeContext";
import { ActivityIndicator, Text } from "react-native-paper";
import { UserLoggedType } from "../types/UserType";

const RegisterUserScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "Register">>();
  const userId = params?.userId; // Usar optional chaining caso params seja undefined
  const [userData, setUserData] = useState<UserLoggedType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const { registerUser, isLoading, error, success, getUserById, putUserById } =
    useUserRegistration();

  // Carregar dados do usuário se estiver em modo de edição
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setLoadingUser(true);
        setIsEditing(true);
        try {
          const user = await getUserById(userId.toString());
          if (user) {
            // Transformar o campo profile se for um objeto
            if (
              user.profile &&
              typeof user.profile === "object" &&
              user.profile.nome
            ) {
              user.profile = user.profile.nome;
            }
            setUserData(user);
          }
        } catch (err) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar dados do usuário"
          );
          Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
        } finally {
          setLoadingUser(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  // Lidar com erro no hook
  useEffect(() => {
    if (error) {
      Alert.alert("Erro", error);
    }
  }, [error]);

  // Lidar com sucesso no hook - só exibe o alerta após o envio do formulário
  useEffect(() => {
    if (success && formSubmitted) {
      Alert.alert(
        "Sucesso",
        isEditing
          ? "Usuário atualizado com sucesso!"
          : "Usuário cadastrado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
      setFormSubmitted(false);
    }
  }, [success, navigation, isEditing, formSubmitted]);

  // Função para submeter o formulário
  const handleSubmit = async (formData: UserLoggedType) => {
    setFormSubmitted(true);
    if (isEditing && userId) {
      // Se está editando e tem userId, usa o putUserById
      await putUserById(userId.toString(), formData);
    } else {
      // Senão, usa o registerUser para criar novo usuário
      await registerUser(formData);
    }
  };

  // Mostra indicador de carregamento enquanto busca dados do usuário
  if (loadingUser) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            color: theme.colors.text,
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Carregando dados do usuário...
        </Text>
      </View>
    );
  }

  // Mostra mensagem de erro se falhar ao carregar dados
  if (loadError && isEditing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text
          style={{ color: theme.colors.error, textAlign: "center" }}
        >{`${loadError}`}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <UserForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={userData}
        isEditing={isEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default RegisterUserScreen;
