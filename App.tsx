import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DarkTheme } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const darkTheme = {
    ...DarkTheme, 
    colors: {
      ...DarkTheme.colors,
      primary: '#2563eb'
    }
  };

  return (
    <PaperProvider theme={darkTheme}>
      <SafeAreaView style={styles.container}>
        <AppNavigator />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});