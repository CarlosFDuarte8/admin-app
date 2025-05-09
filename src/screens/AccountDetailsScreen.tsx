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
import { UserLoggedType } from "../types/UserType";

const AccountDetailsScreen = () => {
  const { user, refreshUserData } = useAuthContext();
  const { theme, isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para guardar os valores formatados das propriedades do usuário
  const [formattedUserInfo, setFormattedUserInfo] = useState<UserLoggedType>({
    id: 0,
    nome: '',
    email: '',
    settingsPassword: '',
    profile: {
      id: 0,
      nome: '',
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    },
    grouper: false,
    grouperId: 0,
    usersLicense: 0,
    devicesLicense: 0,
    consumptionControl: '',
    createdAt: '',
    updatedAt: '',
    userType: 'client'
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
      
      // Criar objeto com valores padrão seguindo o tipo UserLoggedType
      const processedInfo: UserLoggedType = {
        id: user.id || 0,
        nome: user.nome || 'Usuário',
        email: user.email || '',
        settingsPassword: user.settingsPassword || '',
        profile: {
          id: typeof user.profile === 'object' ? user.profile.id || 0 : 0,
          nome: typeof user.profile === 'object' ? user.profile.nome || '' : 
                (typeof user.profile === 'string' ? user.profile : ''),
          createdAt: typeof user.profile === 'object' ? user.profile.createdAt || '' : '',
          updatedAt: typeof user.profile === 'object' ? user.profile.updatedAt || '' : '',
          deletedAt: typeof user.profile === 'object' ? user.profile.deletedAt || null : null
        },
        grouper: user.grouper === true,
        grouperId: user.grouperId || 0,
        usersLicense: user.usersLicense || 0,
        devicesLicense: user.devicesLicense || 0,
        consumptionControl: user.consumptionControl || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
        userType: user.userType || 'client',
        mobilePhone: user.mobilePhone || '',
        cpf: user.cpf || '',
        birthday: user.birthday || '',
        ativo: user.ativo === true
      };
      
      if (user.address) {
        processedInfo.address = typeof user.address === 'object' ? {
          addressId: user.address.addressId || 0,
          zipcode: user.address.zipcode || '',
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          country: user.address.country || '',
          createdAt: user.address.createdAt || '',
          updatedAt: user.address.updatedAt || '',
          deletedAt: user.address.deletedAt || ''
        } : undefined;
      }
      
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
              {formattedUserInfo.email || "Email não disponível"}
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
          description={typeof formattedUserInfo.profile === 'object' ? formattedUserInfo.profile.nome : 'Não definido'}
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
          description={formattedUserInfo.ativo === true ? "Ativo" : "Inativo"}
          left={props => <List.Icon {...props} icon="account-check" color={formattedUserInfo.ativo === true ? "#4CAF50" : "#F44336"} />}
        />
        
        {formattedUserInfo.cpf && (
          <List.Item
            title="CPF"
            description={formattedUserInfo.cpf}
            left={props => <List.Icon {...props} icon="card-account-details" color={theme.colors.primary} />}
          />
        )}
        
        {formattedUserInfo.birthday && (
          <List.Item
            title="Data de Nascimento"
            description={formattedUserInfo.birthday}
            left={props => <List.Icon {...props} icon="cake-variant" color={theme.colors.primary} />}
          />
        )}
        
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

      {formattedUserInfo.address && (
        <>
          <Divider style={styles.divider} />
          <List.Section>
            <List.Subheader>Endereço</List.Subheader>
            <List.Item
              title="Rua"
              description={formattedUserInfo.address.street}
              left={props => <List.Icon {...props} icon="road" color={theme.colors.primary} />}
            />
            <List.Item
              title="Cidade/Estado"
              description={`${formattedUserInfo.address.city}, ${formattedUserInfo.address.state}`}
              left={props => <List.Icon {...props} icon="city" color={theme.colors.primary} />}
            />
            <List.Item
              title="CEP"
              description={formattedUserInfo.address.zipcode}
              left={props => <List.Icon {...props} icon="mail" color={theme.colors.primary} />}
            />
            <List.Item
              title="País"
              description={formattedUserInfo.address.country}
              left={props => <List.Icon {...props} icon="flag" color={theme.colors.primary} />}
            />
          </List.Section>
        </>
      )}

      {(formattedUserInfo.grouper || formattedUserInfo.usersLicense > 0 || formattedUserInfo.devicesLicense > 0) && (
        <>
          <Divider style={styles.divider} />
          <List.Section>
            <List.Subheader>Informações de Licença</List.Subheader>
            {formattedUserInfo.grouper && (
              <List.Item
                title="Gerenciador de Grupo"
                description="Este usuário pode gerenciar outros usuários"
                left={props => <List.Icon {...props} icon="account-group" color={theme.colors.primary} />}
              />
            )}
            {formattedUserInfo.usersLicense > 0 && (
              <List.Item
                title="Licenças de Usuário"
                description={`${formattedUserInfo.usersLicense} licença(s)`}
                left={props => <List.Icon {...props} icon="license" color={theme.colors.primary} />}
              />
            )}
            {formattedUserInfo.devicesLicense > 0 && (
              <List.Item
                title="Licenças de Dispositivo"
                description={`${formattedUserInfo.devicesLicense} licença(s)`}
                left={props => <List.Icon {...props} icon="devices" color={theme.colors.primary} />}
              />
            )}
            {formattedUserInfo.nextPaymentDate && (
              <List.Item
                title="Próximo Pagamento"
                description={formattedUserInfo.nextPaymentDate}
                left={props => <List.Icon {...props} icon="calendar" color={theme.colors.primary} />}
              />
            )}
          </List.Section>
        </>
      )}

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