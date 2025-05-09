import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text,
  Button,
  RadioButton,
  TextInput,
  Switch,
  HelperText
} from 'react-native-paper';
import { User } from '../models/User';
import { useTheme } from '../theme/ThemeContext';
import { UserLoggedType } from '../types/UserType';

interface UserFormProps {
  onSubmit: (user: UserLoggedType) => void;
  isLoading: boolean;
  initialData?: UserLoggedType | null;
  isEditing?: boolean;
}

const defaultUser: UserLoggedType = {
  nome: '',
  email: '',
  ativo: true,
  profile: 'USER',
  senha: '',
  genre: '',
  nextPaymentDate: undefined,
  settingsPassword: '0000',
  grouper: true,
  grouperId: 0,
  usersLicense: 0,
  devicesLicense: 1,
  consumptionControl: 'byTest',
  userType: 'demonstration',

};

export const UserForm: React.FC<UserFormProps> = ({ 
  onSubmit, 
  isLoading, 
  initialData = null, 
  isEditing = false 
}) => {
  const { theme } = useTheme();
  const [user, setUser] = useState<UserLoggedType>(initialData || defaultUser);
  const [showPassword, setShowPassword] = useState(false);

  // Atualizar o formulário quando initialData mudar
  useEffect(() => {
    if (initialData) {
      console.log('Dados iniciais recebidos no formulário:', initialData);
      // Verificar o formato do campo profile e corrigir se necessário
      const formattedData = { ...initialData };
      if (formattedData.profile && 
          typeof formattedData.profile === 'object' && 
          formattedData.profile !== null &&
          'nome' in formattedData.profile) {
        formattedData.profile = (formattedData.profile as {nome: string}).nome;
      }
      setUser(formattedData);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit(user);
  };

  const handleChange = (field: keyof UserLoggedType, value: any) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
        </Text>
        
        <TextInput
          label="Nome"
          mode="outlined"
          value={user.nome}
          onChangeText={(text) => handleChange('nome', text)}
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        
        <TextInput
          label="Email"
          mode="outlined"
          value={user.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          style={styles.input}
          autoCapitalize="none"
          theme={{ colors: { primary: theme.colors.primary } }}
          disabled={isEditing} // Desabilitar edição de email se for edição
        />
        
        {/* Campo de senha (opcional para edição) */}
        {(!isEditing || (isEditing && user.senha)) && (
          <TextInput
            label={isEditing ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}
            mode="outlined"
            value={user.senha}
            onChangeText={(text) => handleChange('senha', text)}
            secureTextEntry={!showPassword}
            right={<TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
        )}
        
        <TextInput
          label="PIN"
          mode="outlined"
          value={user.settingsPassword}
          onChangeText={(text) => handleChange('settingsPassword', text)}
          style={styles.input}
          keyboardType="numeric"
          maxLength={4}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <HelperText type="info" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Perfil:
          </HelperText>
          <RadioButton.Group 
            onValueChange={(value) => handleChange('profile', value)} 
            value={typeof user.profile === 'string' ? user.profile : ''}
          >
            <View style={styles.radioOption}>
              <RadioButton value="USER" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Usuário</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="ADMIN" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Administrador</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <HelperText type="info" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Gênero:
          </HelperText>
          <RadioButton.Group 
            onValueChange={(value) => handleChange('genre', value)} 
            value={user.genre || ''}
          >
            <View style={styles.radioOption}>
              <RadioButton value="" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Não especificado</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="F" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Feminino</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="M" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Masculino</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <HelperText type="info" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Controle de Consumo:
          </HelperText>
          <RadioButton.Group 
            onValueChange={(value) => handleChange('consumptionControl', value)} 
            value={user.consumptionControl}
          >
            <View style={styles.radioOption}>
              <RadioButton value="byTest" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Por Teste</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="perCapsule" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Por Cápsula</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="ilimited" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Ilimitado</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <HelperText type="info" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tipo de Usuário:
          </HelperText>
          <RadioButton.Group 
            onValueChange={(value) => handleChange('userType', value)} 
            value={user.userType}
          >
            <View style={styles.radioOption}>
              <RadioButton value="demonstration" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Demonstração</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="official" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Oficial</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="research" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Pesquisa</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="developer" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>Desenvolvedor</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={{ color: theme.colors.text }}>Ativo:</Text>
          <Switch
            value={user.ativo}
            onValueChange={(value) => handleChange('ativo', value)}
            color={theme.colors.primary}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={{ color: theme.colors.text }}>Agrupador:</Text>
          <Switch
            value={user.grouper}
            onValueChange={(value) => handleChange('grouper', value)}
            color={theme.colors.primary}
          />
        </View>
        
        <Button
          mode="contained"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          {isEditing ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
});