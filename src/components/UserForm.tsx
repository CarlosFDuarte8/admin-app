import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text,
  Button,
  RadioButton,
  TextInput,
  Switch,
  HelperText
} from 'react-native-paper';
import { User } from '../models/User';

interface UserFormProps {
  onSubmit: (user: User) => void;
  isLoading: boolean;
}

const defaultUser: User = {
  nome: '',
  email: '',
  ativo: true,
  profile: 'USER',
  senha: '',
  genre: '',
  nextPaymentDate: null,
  settingsPassword: '0000',
  grouper: true,
  grouperId: 0,
  usersLicense: 0,
  devicesLicense: 1,
  consumptionControl: 'byTest',
  userType: 'demonstration'
};

export const UserForm: React.FC<UserFormProps> = ({ onSubmit, isLoading }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    onSubmit(user);
  };

  const handleChange = (field: keyof User, value: any) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <TextInput
        label="Nome"
        mode="outlined"
        value={user.nome}
        onChangeText={(text) => handleChange('nome', text)}
        style={styles.input}
      />
      
      <TextInput
        label="Email"
        mode="outlined"
        value={user.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput
        label="Senha"
        mode="outlined"
        value={user.senha}
        onChangeText={(text) => handleChange('senha', text)}
        secureTextEntry={!showPassword}
        right={<TextInput.Icon 
          icon={showPassword ? "eye-off" : "eye"} 
          onPress={() => setShowPassword(!showPassword)}
        />}
        style={styles.input}
      />
      <TextInput
        label="PIN"
        mode="outlined"
        value={user.settingsPassword}
        onChangeText={(text) => handleChange('settingsPassword', text)}
        // secureTextEntry={!showPassword}
        // right={<TextInput.Icon 
        //   icon={showPassword ? "eye-off" : "eye"} 
        //   onPress={() => setShowPassword(!showPassword)}
        // />}
        style={styles.input}
      />
      
      <View style={styles.section}>
        <HelperText type="info" style={styles.sectionTitle}>
          Perfil:
        </HelperText>
        <RadioButton.Group 
          onValueChange={(value) => handleChange('profile', value)} 
          value={user.profile}
        >
          <View style={styles.radioOption}>
            <RadioButton value="USER" />
            <Text>USER</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="ADMIN" />
            <Text>ADMIN</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      <View style={styles.section}>
        <HelperText type="info" style={styles.sectionTitle}>
          Gênero:
        </HelperText>
        <RadioButton.Group 
          onValueChange={(value) => handleChange('genre', value)} 
          value={user.genre}
        >
          <View style={styles.radioOption}>
            <RadioButton value="" />
            <Text>Não especificado</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="F" />
            <Text>Feminino</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="M" />
            <Text>Masculino</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      <View style={styles.section}>
        <HelperText type="info" style={styles.sectionTitle}>
          Controle de Consumo:
        </HelperText>
        <RadioButton.Group 
          onValueChange={(value) => handleChange('consumptionControl', value)} 
          value={user.consumptionControl}
        >
          <View style={styles.radioOption}>
            <RadioButton value="byTest" />
            <Text>Por Teste</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="perCapsule" />
            <Text>Por Cápsula</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="ilimited" />
            <Text>Ilimitado</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      <View style={styles.section}>
        <HelperText type="info" style={styles.sectionTitle}>
          Tipo de Usuário:
        </HelperText>
        <RadioButton.Group 
          onValueChange={(value) => handleChange('userType', value)} 
          value={user.userType}
        >
          <View style={styles.radioOption}>
            <RadioButton value="demonstration" />
            <Text>Demonstração</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="official" />
            <Text>Oficial</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="research" />
            <Text>Pesquisa</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="developer" />
            <Text>Desenvolvedor</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      <View style={styles.switchContainer}>
        <Text>Ativo:</Text>
        <Switch
          value={user.ativo}
          onValueChange={(value) => handleChange('ativo', value)}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text>Agrupador:</Text>
        <Switch
          value={user.grouper}
          onValueChange={(value) => handleChange('grouper', value)}
        />
      </View>
      
      <Button
        mode="contained"
        loading={isLoading}
        disabled={isLoading}
        onPress={handleSubmit}
        style={styles.button}
      >
        Cadastrar Usuário
      </Button>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
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