import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceFormScreen from '../screens/DeviceFormScreen';
import AccountDetailsScreen from '../screens/AccountDetailsScreen';
import { useTheme } from '../theme/ThemeContext';
import BottomTabNavigator from './bottom.route';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import { NavigationProp } from '@react-navigation/native';

export type AppStackParamList = {
    BottomTabNavigator: undefined;
  Home: undefined;
  Settings: undefined;
  DeviceForm: undefined;
  Register: undefined;
  AccountDetails: undefined;
};

export type NavigationAppProps = NavigationProp<AppStackParamList>;

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppRoutes: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="BottomTabNavigator"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="BottomTabNavigator"
        component={BottomTabNavigator}
        options={{ title: 'Página Inicial' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Página Inicial' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterUserScreen}
        options={{ title: 'Cadastro de Usuário' }}
      />
      <Stack.Screen
        name="DeviceForm"
        component={DeviceFormScreen}
        options={{ title: 'Cadastro de Dispositivo' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
        options={{ 
          title: 'Detalhes da Conta',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};