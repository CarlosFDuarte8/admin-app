import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';

const SettingsScreen: React.FC = () => {
  const { theme, isDarkTheme } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.header, { color: theme.colors.text }]}>
        Configurações
      </Text>
      
      <ThemeSelector />
      
      {/* Outras seções de configurações podem ser adicionadas aqui */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
});

export default SettingsScreen;