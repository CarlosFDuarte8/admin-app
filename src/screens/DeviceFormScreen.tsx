import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';

// Função para formatar o macAddress
function formatToMacAddress(input: string): string {
  const sanitized = input.replace(/[^a-fA-F0-9]/g, '');
  const trimmed = sanitized.slice(0, 12);
  return (
    trimmed
      .match(/.{1,2}/g)
      ?.join(':')
      .toUpperCase() || ''
  );
}

const DeviceFormScreen = () => {
  const [formData, setFormData] = useState({
    userId: 1,
    ownerId: 1,
    campaignId: 13,
    remainingTests: 100,
    macAddress: "80E1266921E3",
    appVersion: "0",
    isConfigured: true,
    createdAt: "2025-05-09T13:35:31.775Z",
    updatedAt: "2025-05-09T13:35:31.775Z",
  });

  const handleSendData = () => {
    // Formata o macAddress antes de enviar
    const formattedMacAddress = formatToMacAddress(formData.macAddress);
    const dataToSend = { ...formData, macAddress: formattedMacAddress };

    // Simula um envio de dados
    Alert.alert('Dados enviados', JSON.stringify(dataToSend, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Enviar Dados</Text>

      <TextInput
        label="User ID"
        mode="outlined"
        value={String(formData.userId)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, userId: Number(text) })}
      />

      <TextInput
        label="Owner ID"
        mode="outlined"
        value={String(formData.ownerId)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, ownerId: Number(text) })}
      />

      <TextInput
        label="Campaign ID"
        mode="outlined"
        value={String(formData.campaignId)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, campaignId: Number(text) })}
      />

      <TextInput
        label="Remaining Tests"
        mode="outlined"
        value={String(formData.remainingTests)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, remainingTests: Number(text) })}
      />

      <TextInput
        label="MAC Address"
        mode="outlined"
        value={formData.macAddress}
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, macAddress: text })}
      />

      <TextInput
        label="App Version"
        mode="outlined"
        value={formData.appVersion}
        style={styles.input}
        onChangeText={(text) => setFormData({ ...formData, appVersion: text })}
      />

      <TextInput
        label="Is Configured (true/false)"
        mode="outlined"
        value={formData.isConfigured ? "true" : "false"}
        style={styles.input}
        onChangeText={(text) =>
          setFormData({ ...formData, isConfigured: text.toLowerCase() === "true" })
        }
      />

      <Button mode="contained" onPress={handleSendData} style={styles.button}>
        Enviar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});

export default DeviceFormScreen;