import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleRegisterUser = () => {
    navigation.navigate("Register");
  };

  return (
    <ScrollView style={[styles.container]}>
      <Text style={[styles.title]}>Bem-vindo!</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Cadastro de Usuários</Text>
          <Text variant="bodyMedium">
            Acesse a área de cadastro de usuários para adicionar novos usuários
            ao sistema.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleRegisterUser}>Cadastrar Usuário</Button>
        </Card.Actions>
      </Card>
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
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoutButton: {
    borderColor: "#ff5252",
  },
});

export default HomeScreen;
