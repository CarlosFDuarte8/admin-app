import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { useAuthContext } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [login, setLogin] = useState('carlos.duarte@inv.net.br');
  const [senha, setSenha] = useState('Abcd@123');
  const { isLoading, isAuthenticated, user, login: doLogin } = useAuthContext();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (loginError) {
      Alert.alert('Erro de Login', loginError);
    }
  }, [loginError]);

  useEffect(() => {
    // Quando o usuário estiver autenticado, navegar para a tela principal
    if (isAuthenticated && user) {
      console.log("Usuário autenticado, navegando para Home");
      navigation.navigate('Home');
    }
  }, [isAuthenticated, user, navigation]);

  const handleLogin = async () => {
    if (!login || !senha) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos');
      return;
    }

    setLoginError(null);
    try {
      console.log(`Tentando login com: ${login}`);
      await doLogin({ login, senha });
      // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
    } catch (err) {
      console.error("Erro ao realizar login:", err);
      setLoginError(err instanceof Error ? err.message : "Falha ao realizar login");
    }
  };

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
      
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={isLoading}
        style={styles.button}
      >
        Entrar
      </Button>
      
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
});

export default LoginScreen;