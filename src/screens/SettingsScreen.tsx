import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';
import { Switch, List, Divider } from 'react-native-paper';
import { useLocalAuth } from '../hooks/useLocalAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen: React.FC = () => {
  const { theme, isDarkTheme } = useTheme();
  const localAuth = useLocalAuth();
  const [useBiometricAuth, setUseBiometricAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar o tipo de biometria para exibição adequada
  const biometricName = localAuth.biometricType === 'FACE_ID' 
    ? 'Face ID' 
    : localAuth.biometricType === 'TOUCH_ID' 
      ? 'Touch ID' 
      : 'biometria';

  useEffect(() => {
    // Carregar preferência de autenticação biométrica
    const loadBiometricPreference = async () => {
      try {
        setIsLoading(true);
        const preference = await AsyncStorage.getItem('@auth:useBiometricAuth');
        setUseBiometricAuth(preference === 'true');
      } catch (error) {
        console.error('Erro ao carregar preferências de biometria:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBiometricPreference();
  }, []);

  const handleToggleBiometricAuth = async (value: boolean) => {
    try {
      if (value && !localAuth.isBiometricAvailable) {
        Alert.alert(
          'Biometria não disponível',
          'Seu dispositivo não suporta autenticação biométrica ou não há dados biométricos registrados.'
        );
        return;
      }

      if (value) {
        // Se o usuário está ativando a autenticação biométrica
        if (localAuth.hasSavedCredentials()) {
          // Já existem credenciais salvas, apenas atualizar a preferência
          await AsyncStorage.setItem('@auth:useBiometricAuth', 'true');
          setUseBiometricAuth(true);
          Alert.alert(
            'Autenticação Biométrica Ativada',
            `O login com ${biometricName} será solicitado automaticamente na próxima vez.`
          );
        } else {
          // Não existem credenciais salvas, perguntar ao usuário se deseja configurar agora
          Alert.alert(
            'Configurar Autenticação Biométrica',
            `Para usar o ${biometricName} nos próximos logins, você precisa fazer login novamente para salvar suas credenciais. Deseja fazer isso agora?`,
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Configurar',
                onPress: () => {
                  // Redirecionar para a tela de login com flag para ativar biometria após login
                  AsyncStorage.setItem('@auth:configBiometricAfterLogin', 'true')
                    .then(() => {
                      Alert.alert(
                        'Redirecionando',
                        'Você será redirecionado para a tela de login. Após fazer login, suas credenciais serão salvas para uso com biometria.'
                      );
                      // Aqui você poderia navegar para a tela de login se tiver acesso à navegação
                    });
                }
              }
            ]
          );
        }
      } else {
        // Usuário está desativando a autenticação biométrica
        // Perguntar se também deseja remover as credenciais salvas
        Alert.alert(
          'Desativar Autenticação Biométrica',
          'Deseja também remover suas credenciais salvas para autenticação biométrica?',
          [
            {
              text: 'Manter credenciais',
              onPress: async () => {
                await AsyncStorage.setItem('@auth:useBiometricAuth', 'false');
                setUseBiometricAuth(false);
              },
              style: 'cancel'
            },
            {
              text: 'Remover tudo',
              onPress: async () => {
                await Promise.all([
                  AsyncStorage.setItem('@auth:useBiometricAuth', 'false'),
                  localAuth.removeCredentials()
                ]);
                setUseBiometricAuth(false);
                Alert.alert('Sucesso', 'Autenticação biométrica desativada e credenciais removidas.');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao alternar autenticação biométrica:', error);
      Alert.alert('Erro', 'Houve um erro ao configurar a autenticação biométrica.');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.header, { color: theme.colors.text }]}>
        Configurações
      </Text>
      
      <ThemeSelector />
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Segurança e Privacidade
        </Text>
        
        {localAuth.isBiometricAvailable ? (
          <List.Item
            title={`Login com ${biometricName}`}
            description={`Usar ${biometricName} para fazer login automaticamente`}
            left={props => <List.Icon {...props} icon={
              localAuth.biometricType === 'FACE_ID'
                ? 'face-recognition'
                : 'fingerprint'
            } />}
            right={() => (
              <Switch
                value={useBiometricAuth}
                onValueChange={handleToggleBiometricAuth}
                disabled={isLoading}
              />
            )}
          />
        ) : (
          <List.Item
            title="Login com biometria não disponível"
            description="Seu dispositivo não suporta biometria ou não está configurado"
            left={props => <List.Icon {...props} icon="fingerprint-off" />}
          />
        )}
      </View>
      
      {/* Outras seções de configurações podem ser adicionadas aqui */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default SettingsScreen;