import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handleRegisterUser = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Bem-vindo!</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Cadastro de Usuários</Title>
          <Paragraph>
            Acesse a área de cadastro de usuários para adicionar novos usuários ao sistema.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleRegisterUser}>Cadastrar Usuário</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Sua Conta</Title>
          <Paragraph>
            Gerencie suas informações e preferências de conta.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button>Meu Perfil</Button>
        </Card.Actions>
      </Card>
      
      <View style={styles.logoutContainer}>
        <Button 
          mode="outlined" 
          onPress={handleLogout} 
          style={styles.logoutButton}
        >
          Sair
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginVertical: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoutButton: {
    borderColor: '#ff5252',
  }
});

export default HomeScreen;