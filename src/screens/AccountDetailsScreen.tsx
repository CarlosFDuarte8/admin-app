import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Avatar,
  Divider,
  List,
  Button,
  IconButton,
  TextInput,
} from "react-native-paper";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const AccountDetailsScreen = () => {
  const { user, refreshUserData } = useAuthContext();
  const { theme, isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para guardar os valores formatados das propriedades do usuário
  const [formattedUserInfo, setFormattedUserInfo] = useState({
    nome: '',
    email: '',
    login: '',
    profile: 'USER',
    userType: '',
    mobilePhone: '',
    ativo: true,
    grouper: false,
    consumptionControl: '',
  });

  // Estados para edição
  const [editedInfo, setEditedInfo] = useState({
    nome: '',
    email: '',
    mobilePhone: '',
  });

  // Processa os dados do usuário
  useEffect(() => {
    if (user) {
      console.log('Processando dados do usuário em detalhes:', user);
      const processedInfo = {
        nome: typeof user.nome === 'string' ? user.nome : 'Usuário',
        email: typeof user.email === 'string' ? user.email : '',
        login: typeof user.login === 'string' ? user.login : '',
        profile: typeof user.profile === 'string' ? user.profile : 'USER',
        userType: typeof user.userType === 'string' ? user.userType : 
                 (user.userType && typeof user.userType === 'object' ? 
                  (user.userType.nome || 'Desconhecido') : ''),
        mobilePhone: typeof user.mobilePhone === 'string' ? user.mobilePhone : '',
        ativo: user.ativo === true,
        grouper: user.grouper === true,
        consumptionControl: typeof user.consumptionControl === 'string' ? user.consumptionControl : '',
      };
      
      setFormattedUserInfo(processedInfo);
      setEditedInfo({
        nome: processedInfo.nome,
        email: processedInfo.email,
        mobilePhone: processedInfo.mobilePhone || '',
      });
    }
  }, [user]);

  const handleSaveChanges = () => {
    // Aqui implementaríamos a lógica para salvar as alterações
    // Por ora, apenas simulamos o sucesso
    console.log('Salvando alterações:', editedInfo);
    setIsEditing(false);
    
    // Atualizar os dados formatados para refletir as alterações
    setFormattedUserInfo({
      ...formattedUserInfo,
      nome: editedInfo.nome,
      email: editedInfo.email,
      mobilePhone: editedInfo.mobilePhone,
    });
    
    // Atualizar os dados no contexto
    refreshUserData();
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Detalhes da Conta
        </Text>
        <IconButton
          icon={isEditing ? "check" : "pencil"}
          size={24}
          onPress={isEditing ? handleSaveChanges : toggleEdit}
        />
      </View>

      <View style={styles.profileSection}>
        <Avatar.Icon
          size={80}
          icon="account"
          style={[styles.avatar, { backgroundColor: isDarkTheme ? '#666' : '#e0e0e0' }]}
          color={isDarkTheme ? '#eee' : '#555'}
        />
        
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              label="Nome"
              value={editedInfo.nome}
              onChangeText={(text) => setEditedInfo({...editedInfo, nome: text})}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Email"
              value={editedInfo.email}
              onChangeText={(text) => setEditedInfo({...editedInfo, email: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <TextInput
              label="Telefone"
              value={editedInfo.mobilePhone}
              onChangeText={(text) => setEditedInfo({...editedInfo, mobilePhone: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text variant="titleMedium" style={styles.userName}>
              {formattedUserInfo.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {formattedUserInfo.email || formattedUserInfo.login || "Email não disponível"}
            </Text>
            {formattedUserInfo.mobilePhone && (
              <Text variant="bodyMedium" style={styles.userPhone}>
                {formattedUserInfo.mobilePhone}
              </Text>
            )}
          </View>
        )}
      </View>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader>Informações da Conta</List.Subheader>
        
        <List.Item
          title="Perfil"
          description={formattedUserInfo.profile}
          left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
        />
        
        {formattedUserInfo.userType && (
          <List.Item
            title="Tipo de Usuário"
            description={formattedUserInfo.userType}
            left={props => <List.Icon {...props} icon="account-details" color={theme.colors.primary} />}
          />
        )}
        
        <List.Item
          title="Status"
          description={formattedUserInfo.ativo ? "Ativo" : "Inativo"}
          left={props => <List.Icon {...props} icon="account-check" color={formattedUserInfo.ativo ? "#4CAF50" : "#F44336"} />}
        />
        
        {formattedUserInfo.consumptionControl && (
          <List.Item
            title="Controle de Consumo"
            description={
              formattedUserInfo.consumptionControl === 'byTest' ? 'Por Teste' :
              formattedUserInfo.consumptionControl === 'perCapsule' ? 'Por Cápsula' :
              formattedUserInfo.consumptionControl === 'ilimited' ? 'Ilimitado' :
              formattedUserInfo.consumptionControl
            }
            left={props => <List.Icon {...props} icon="counter" color={theme.colors.primary} />}
          />
        )}
      </List.Section>

      <Divider style={styles.divider} />

      {!isEditing && (
        <Button
          mode="contained"
          onPress={toggleEdit}
          style={styles.editButton}
          icon="account-edit"
        >
          Editar Perfil
        </Button>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
    marginTop: 8,
  },
  userEmail: {
    opacity: 0.7,
    marginTop: 4,
  },
  userPhone: {
    opacity: 0.7,
    marginTop: 4,
  },
  divider: {
    height: 0.5,
    marginVertical: 16,
  },
  editForm: {
    width: '90%',
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});

export default AccountDetailsScreen;