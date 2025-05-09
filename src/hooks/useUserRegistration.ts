import { useState } from "react";
import { User } from "../models/User";
import { UserService } from "../api/useService";
import { UserLoggedType } from "../types/UserType";

export const useUserRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerUser = async (userData: UserLoggedType) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Garantir que userData está no formato correto para API
      const formattedData = prepareUserData(userData);
      await UserService.registerActiveUser(formattedData);
      setSuccess(true);
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao cadastrar o usuário"
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await UserService.getUserById(userId);
      console.log("Dados do usuário recebidos:", user);
      return user;
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao buscar dados do usuário"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const putUserById = async (userId: string, userData: UserLoggedType) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Garantir que userData está no formato correto para API
      const formattedData = prepareUserData(userData);
      console.log("Enviando atualização de usuário:", formattedData);
      const user = await UserService.putUserById(userId, formattedData);
      setSuccess(true);
      return user;
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao atualizar o usuário"
      );
      setSuccess(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função utilitária para preparar os dados do usuário para envio à API
  const prepareUserData = (userData: UserLoggedType): UserLoggedType => {
    // Criar uma cópia para não modificar o objeto original
    const formattedData = { ...userData };

    // Verificar se a senha está vazia na edição e removê-la para não enviar
    if (formattedData.senha === "") {
      delete formattedData.senha;
    }

    // Garantir que profile é uma string (nome do perfil)
    if (
      formattedData.profile &&
      typeof formattedData.profile === "object" &&
      formattedData.profile.nome
    ) {
      formattedData.profile = formattedData.profile.nome;
    }

    return formattedData;
  };

  return { registerUser, isLoading, error, success, getUserById, putUserById };
};
