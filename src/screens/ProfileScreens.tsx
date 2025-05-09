import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Text,
  Avatar,
  Divider,
  IconButton,
  useTheme as usePaperTheme,
  List,
} from "react-native-paper";
import { useAuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationAppProps } from "../navigation/app.route";
import { useTheme } from "../theme/ThemeContext";

const ProfileScreen = () => {
  const { user, logout, refreshUserData } = useAuthContext();
  const navigation = useNavigation<NavigationAppProps>();
  const { theme, isDarkTheme } = useTheme();
  const paperTheme = usePaperTheme();
  
  // Estado para guardar os valores formatados das propriedades do usuário
  const [formattedUserInfo, setFormattedUserInfo] = useState({
    nome: '',
    email: '',
    login: '',
    profile: 'USER',
    userType: '',
    mobilePhone: '',
  });

  // Processa os dados do usuário para garantir que tudo que é renderizado seja do tipo primitivo
  useEffect(() => {
    if (user) {
      console.log('Processando dados do usuário:', user);
      setFormattedUserInfo({
        nome: typeof user.nome === 'string' ? user.nome : 'Usuário',
        email: typeof user.email === 'string' ? user.email : '',
        login: typeof user.login === 'string' ? user.login : '',
        profile: typeof user.profile === 'string' ? user.profile : 'USER',
        userType: typeof user.userType === 'string' ? user.userType : 
                 (user.userType && typeof user.userType === 'object' ? 
                  (user.userType.nome || 'Desconhecido') : ''),
        mobilePhone: typeof user.mobilePhone === 'string' ? user.mobilePhone : '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    logout();
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const navigateToAccountDetails = () => {
    navigation.navigate("AccountDetails");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Cabeçalho com informações do perfil - agora clicável */}
      <TouchableOpacity 
        style={styles.headerContainer}
        onPress={navigateToAccountDetails}
        activeOpacity={0.7}
      >
        <View style={styles.profileHeader}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={[styles.avatar, { backgroundColor: isDarkTheme ? '#666' : '#e0e0e0' }]}
            color={isDarkTheme ? '#eee' : '#555'}
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge" style={styles.userName}>
              {formattedUserInfo.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {formattedUserInfo.email || formattedUserInfo.login || "Email não disponível"}
            </Text>
            <View style={styles.viewProfileContainer}>
              <Text variant="bodySmall" style={styles.viewProfileText}>
                Ver detalhes do perfil
              </Text>
              <IconButton 
                icon="chevron-right" 
                size={16} 
                style={styles.chevronIcon}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <Divider style={styles.divider} />
      
      {/* Seção de opções estilo lista */}
      <View style={styles.listSection}>
        <List.Section>
          <List.Subheader>Configurações</List.Subheader>
          
          <List.Item
            title="Configurações"
            left={props => <List.Icon {...props} icon="cog" color={theme.colors.primary} />}
            onPress={handleSettings}
            style={styles.listItem}
          />
          
          <List.Item
            title="Ajuda"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            style={styles.listItem}
          />
        </List.Section>
        
        <Divider style={styles.divider} />
        
        <List.Section>
          <List.Item
            title="Sair"
            titleStyle={{ color: '#FF3B30' }}
            left={props => <List.Icon {...props} icon="logout" color="#FF3B30" />}
            onPress={handleLogout}
            style={styles.listItem}
          />
        </List.Section>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "600",
  },
  userEmail: {
    opacity: 0.7,
  },
  viewProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewProfileText: {
    color: '#007AFF',
    fontSize: 12,
  },
  chevronIcon: {
    margin: 0,
    padding: 0,
    marginLeft: -8,
  },
  divider: {
    height: 0.5,
    marginVertical: 8,
  },
  listSection: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    opacity: 0.5,
  },
});

export default ProfileScreen;
