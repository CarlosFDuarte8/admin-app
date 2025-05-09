import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  Avatar,
  Card,
  Button,
  Menu,
  Divider,
  IconButton,
} from "react-native-paper";
import { useAuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationAppProps } from "../navigation/app.route";

const ProfileScreen = () => {
  const { user, logout, refreshUserData } = useAuthContext();
  const navigation = useNavigation<NavigationAppProps>();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = async () => {
    closeMenu();
    // Pequeno atraso para o menu fechar antes do logout
    setTimeout(() => {
      logout();
    }, 300);
  };

  const handleSettings = () => {
    closeMenu();
    navigation.navigate("Settings");
  };

  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.header}>
        <Text variant="headlineMedium">Perfil</Text>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
        >
          <Menu.Item
            leadingIcon="cog"
            onPress={handleSettings}
            title="Configurações"
          />
          <Divider />
          <Menu.Item leadingIcon="logout" onPress={handleLogout} title="Sair" />
        </Menu>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Icon size={80} icon="account" style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text variant="titleLarge">{user?.nome || "Usuário"}</Text>
            <Text variant="bodyMedium">
              {user?.email || user?.login || "Email não disponível"}
            </Text>
            {user?.telefone && (
              <Text variant="bodyMedium">{user.telefone}</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="account-edit"
          style={styles.actionButton}
          onPress={() => {
            /* Navegar para edição de perfil quando implementado */
            refreshUserData();
          }}
        >
          Editar Perfil
        </Button>

        <Button
          mode="outlined"
          icon="cog"
          style={styles.actionButton}
          onPress={handleSettings}
        >
          Configurações
        </Button>

        <Button
          mode="outlined"
          icon="logout"
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          Sair
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 12,
    borderColor: "#ff5252",
  },
});

export default ProfileScreen;
