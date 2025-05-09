import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { UserForm } from '../components/UserForm';
import { useUserRegistration } from '../hooks/useUserRegistration';

interface RegisterUserScreenProps {
  navigation: any;
}

const RegisterUserScreen: React.FC<RegisterUserScreenProps> = ({ navigation }) => {
  const { registerUser, isLoading, error, success } = useUserRegistration();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
    }
  }, [error]);

  React.useEffect(() => {
    if (success) {
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!', [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('Home') 
        }
      ]);
    }
  }, [success, navigation]);

  return (
    <View style={styles.container}>
      <UserForm onSubmit={registerUser} isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default RegisterUserScreen;