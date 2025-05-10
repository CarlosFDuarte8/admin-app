import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface LocalAuthProps {
  login: string;
  senha: string;
}

export const useLocalAuth = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<LocalAuthProps | null>(null);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  // Verificar disponibilidade de autenticação biométrica ao carregar o hook
  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
  }, []);

  // Verificar se o dispositivo suporta autenticação biométrica
  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricEnrolled(enrolled);
        
        // Identificar o tipo de biometria principal disponível
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('FACE_ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'TOUCH_ID' : 'FINGERPRINT');
        } else {
          setBiometricType('BIOMETRIC');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar compatibilidade biométrica:', error);
    }
  };

  // Carregar credenciais salvas do armazenamento local
  const loadSavedCredentials = async () => {
    try {
      const credentials = await AsyncStorage.getItem('@auth:biometricCredentials');
      if (credentials) {
        setSavedCredentials(JSON.parse(credentials));
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais salvas:', error);
    }
  };

  // Salvar credenciais para uso com autenticação biométrica
  const saveCredentials = async (credentials: LocalAuthProps) => {
    try {
      await AsyncStorage.setItem('@auth:biometricCredentials', JSON.stringify(credentials));
      setSavedCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      return false;
    }
  };

  // Remover credenciais salvas
  const removeCredentials = async () => {
    try {
      await AsyncStorage.removeItem('@auth:biometricCredentials');
      setSavedCredentials(null);
      return true;
    } catch (error) {
      console.error('Erro ao remover credenciais:', error);
      return false;
    }
  };

  // Verificar se existem credenciais salvas
  const hasSavedCredentials = () => {
    return !!savedCredentials;
  };

  // Obter rótulo apropriado para o tipo de biometria
  const getBiometricPromptMessage = () => {
    switch (biometricType) {
      case 'FACE_ID':
        return 'Autenticar com Face ID';
      case 'TOUCH_ID':
        return 'Autenticar com Touch ID';
      case 'FINGERPRINT':
        return 'Autenticar com impressão digital';
      default:
        return 'Autenticação biométrica';
    }
  };

  // Autenticar usando biometria
  const authenticateWithBiometrics = async () => {
    if (!isBiometricAvailable || !isBiometricEnrolled) {
      console.warn('Autenticação biométrica não disponível ou não configurada no dispositivo');
      return { success: false, credentials: null };
    }

    try {
      // Verificar se há credenciais salvas
      if (!savedCredentials) {
        return { success: false, credentials: null };
      }

      // Obter mensagem personalizada para o tipo de biometria
      const promptMessage = getBiometricPromptMessage();
      
      // Solicitar autenticação biométrica
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use sua senha',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true, credentials: savedCredentials };
      } else {
        console.log('Autenticação biométrica cancelada ou falhou');
        return { success: false, credentials: null };
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      return { success: false, credentials: null };
    }
  };

  // Verificar quais tipos de autenticação biométrica estão disponíveis
  const getAvailableBiometricMethods = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const methodNames = types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Reconhecimento facial';
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Impressão digital';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Escaneamento de íris';
          default:
            return 'Outro método biométrico';
        }
      });
      return methodNames;
    } catch (error) {
      console.error('Erro ao buscar métodos biométricos:', error);
      return [];
    }
  };
  
  // Verifica se o dispositivo é um iPhone com Face ID
  const isIPhoneWithFaceID = () => {
    return Platform.OS === 'ios' && biometricType === 'FACE_ID';
  };

  return {
    isBiometricAvailable,
    isBiometricEnrolled,
    savedCredentials,
    biometricType,
    isIPhoneWithFaceID,
    hasSavedCredentials,
    authenticateWithBiometrics,
    saveCredentials,
    removeCredentials,
    getAvailableBiometricMethods,
    getBiometricPromptMessage,
  };
};