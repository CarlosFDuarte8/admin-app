import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Button, Title, Text, Checkbox } from 'react-native-paper';
import { useAuthContext } from '../context/AuthContext';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [login, setLogin] = useState('carlos.duarte@inv.net.br');
  const [senha, setSenha] = useState('Abcd@123');
  const { isLoading, isAuthenticated, user, login: doLogin } = useAuthContext();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showConfigPrompt, setShowConfigPrompt] = useState(false);
  const localAuth = useLocalAuth();

  // Verificar autenticação biométrica disponível ao carregar
  useEffect(() => {
    const initializeScreen = async () => {
      await checkBiometricAvailability();
      await checkBiometricSettings();
      checkPostLoginBiometricConfig();
    };
    
    initializeScreen();
  }, []);

  // Verificar configurações de biometria
  const checkBiometricSettings = async () => {
    try {
      const useBiometricAuth = await AsyncStorage.getItem('@auth:useBiometricAuth');
      setIsBiometricEnabled(useBiometricAuth === 'true');
    } catch (error) {
      console.error("Erro ao verificar configurações de biometria:", error);
    }
  };
  
  // Verificar se precisa configurar biometria após o login
  const checkPostLoginBiometricConfig = async () => {
    try {
      const configBiometric = await AsyncStorage.getItem('@auth:configBiometricAfterLogin');
      if (configBiometric === 'true') {
        setShowConfigPrompt(true);
        setRememberMe(true);
        // Limpar a flag para não mostrar novamente
        await AsyncStorage.removeItem('@auth:configBiometricAfterLogin');
      }
    } catch (error) {
      console.error("Erro ao verificar configuração pós-login:", error);
    }
  };

  // Tentar login biométrico automático quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      const tryBiometricLogin = async () => {
        // Só tenta login biométrico se estiver habilitado nas configurações
        if (localAuth.hasSavedCredentials() && isBiometricAvailable && isBiometricEnabled) {
          // Personalizar mensagem com base no tipo de biometria
          const authType = localAuth.biometricType === 'FACE_ID' ? 'Face ID' : 
                          localAuth.biometricType === 'TOUCH_ID' ? 'Touch ID' : 'biometria';
          
          setTimeout(() => {
            Alert.alert(
              `Login com ${authType}`,
              `Deseja fazer login com seu ${authType}?`,
              [
                {
                  text: 'Não',
                  style: 'cancel'
                },
                {
                  text: 'Sim',
                  onPress: handleBiometricAuth
                }
              ]
            );
          }, 500);
        }
      };

      tryBiometricLogin();
    }, [localAuth.hasSavedCredentials(), isBiometricAvailable, isBiometricEnabled, localAuth.biometricType])
  );

  useEffect(() => {
    if (loginError) {
      Alert.alert('Erro de Login', loginError);
    }
  }, [loginError]);

  useEffect(() => {
    // Quando o usuário estiver autenticado, navegar para a tela principal
    if (isAuthenticated && user) {
      console.log("Usuário autenticado, navegando para Home");
      
      // Verificar se é o primeiro login e precisa configurar biometria
      if (showConfigPrompt && rememberMe) {
        configureBiometricAfterLogin();
      }
      
      navigation.navigate('Home');
    }
  }, [isAuthenticated, user, navigation, showConfigPrompt, rememberMe]);

  // Configurar biometria após login bem-sucedido
  const configureBiometricAfterLogin = async () => {
    try {
      if (!localAuth.isBiometricAvailable) return;
      
      // Tipo de biometria para exibição
      const authType = localAuth.biometricType === 'FACE_ID' ? 'Face ID' : 
                      localAuth.biometricType === 'TOUCH_ID' ? 'Touch ID' : 'biometria';
      
      // Perguntar ao usuário se deseja configurar biometria
      Alert.alert(
        'Configurar Login Biométrico',
        `Deseja configurar o login com ${authType} para acessos futuros?`,
        [
          {
            text: 'Não',
            style: 'cancel'
          },
          {
            text: 'Sim',
            onPress: async () => {
              // Salvar credenciais e ativar biometria
              if (login && senha) {
                const saved = await localAuth.saveCredentials({ login, senha });
                if (saved) {
                  await AsyncStorage.setItem('@auth:useBiometricAuth', 'true');
                  Alert.alert(
                    'Configuração Concluída',
                    `O login com ${authType} foi configurado com sucesso.`
                  );
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erro ao configurar biometria após login:", error);
    }
  };

  // Verificar disponibilidade de biometria
  const checkBiometricAvailability = async () => {
    try {
      const available = localAuth.isBiometricAvailable;
      const enrolled = localAuth.isBiometricEnrolled;
      setIsBiometricAvailable(available && enrolled);
    } catch (error) {
      console.error("Erro ao verificar disponibilidade biométrica:", error);
    }
  };

  const handleBiometricAuth = async () => {
    if (!localAuth.isBiometricAvailable || !localAuth.isBiometricEnrolled) {
      Alert.alert(
        'Biometria não disponível', 
        'Seu dispositivo não suporta ou não possui biometria configurada.'
      );
      return;
    }

    try {
      const result = await localAuth.authenticateWithBiometrics();
      
      if (result.success && result.credentials) {
        // Preencher os campos com as credenciais salvas
        setLogin(result.credentials.login);
        setSenha(result.credentials.senha);
        
        // Fazer login automaticamente
        console.log(`Tentando login biométrico com: ${result.credentials.login}`);
        await doLogin({ login: result.credentials.login, senha: result.credentials.senha });
      }
    } catch (error) {
      console.error("Erro ao autenticar com biometria:", error);
    }
  };

  const handleLogin = async () => {
    if (!login || !senha) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos');
      return;
    }

    setLoginError(null);
    try {
      console.log(`Tentando login com: ${login}`);
      await doLogin({ login, senha });
      
      // Salvar credenciais se a opção estiver marcada
      if (rememberMe && localAuth.isBiometricAvailable) {
        // Verificar se é o primeiro login, para mostrar a pergunta de configuração mais tarde
        if (!showConfigPrompt && !localAuth.hasSavedCredentials()) {
          setShowConfigPrompt(true);
        } else {
          const saved = await localAuth.saveCredentials({ login, senha });
          if (saved) {
            // Personalizar mensagem com base no tipo de biometria
            const authType = localAuth.biometricType === 'FACE_ID' ? 'Face ID' : 
                            localAuth.biometricType === 'TOUCH_ID' ? 'Touch ID' : 'biometria';
            
            console.log(`Credenciais salvas para uso com ${authType}`);
            
            // Perguntar ao usuário se deseja usar biometria em logins futuros
            Alert.alert(
              'Ativar Login Biométrico',
              `Deseja usar ${authType} para logins futuros?`,
              [
                {
                  text: 'Não',
                  style: 'cancel',
                  onPress: () => AsyncStorage.setItem('@auth:useBiometricAuth', 'false')
                },
                {
                  text: 'Sim',
                  onPress: () => AsyncStorage.setItem('@auth:useBiometricAuth', 'true')
                }
              ]
            );
          }
        }
      }
      
      // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
    } catch (err) {
      console.error("Erro ao realizar login:", err);
      setLoginError(err instanceof Error ? err.message : "Falha ao realizar login");
    }
  };

  // Determinar o ícone e texto a serem usados no botão de biometria
  const getBiometricButtonProps = () => {
    switch (localAuth.biometricType) {
      case 'FACE_ID':
        return {
          icon: 'face-recognition',
          text: 'Entrar com Face ID'
        };
      case 'TOUCH_ID':
        return {
          icon: 'fingerprint',
          text: 'Entrar com Touch ID'
        };
      case 'FINGERPRINT':
        return {
          icon: 'fingerprint',
          text: 'Entrar com Digital'
        };
      default:
        return {
          icon: 'fingerprint',
          text: 'Entrar com Biometria'
        };
    }
  };

  const biometricButtonProps = getBiometricButtonProps();

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login</Title>
      
      <TextInput
        label="Login"
        value={login}
        onChangeText={setLogin}
        style={styles.input}
        keyboardType='email-address'
        autoCapitalize='none'
        textContentType='emailAddress'
        mode="outlined"
      />
      
      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      
      <View style={styles.rememberContainer}>
        <Checkbox.Item
          label="Lembrar-me"
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => setRememberMe(!rememberMe)}
          position="leading"
          style={styles.checkbox}
        />
      </View>
      
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={isLoading}
        style={styles.button}
      >
        Entrar
      </Button>
      
      {localAuth.hasSavedCredentials() && isBiometricEnabled && (
        <Button 
          mode="outlined" 
          onPress={handleBiometricAuth}
          style={styles.biometricButton}
          icon={biometricButtonProps.icon}
        >
          {biometricButtonProps.text}
        </Button>
      )}
      
      <View style={styles.registerContainer}>
        <Text>Não tem uma conta?</Text>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Register')}
        >
          Cadastre-se
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  biometricButton: {
    marginTop: 12,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    padding: 0,
  },
});

export default LoginScreen;