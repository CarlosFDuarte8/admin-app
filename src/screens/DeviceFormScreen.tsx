import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import CameraComponent from '../components/CameraComponent';

// Função para formatar o macAddress
function formatToMacAddress(input: string): string {
  // Remove caracteres não-hexadecimais
  const sanitized = input.replace(/[^a-fA-F0-9]/g, '');
  // Limita a 12 caracteres (formato MAC)
  const trimmed = sanitized.slice(0, 12);
  // Formata como XX:XX:XX:XX:XX:XX
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
  const [showCamera, setShowCamera] = useState(false);
  const [formattedMac, setFormattedMac] = useState("");

  // Atualiza o formato do MAC sempre que o valor mudar
  useEffect(() => {
    setFormattedMac(formatToMacAddress(formData.macAddress));
  }, [formData.macAddress]);

  const handleQRCodeCapture = (data: string) => {
    // Extrai apenas caracteres hexadecimais se o QR Code contiver outros caracteres
    const macFromQR = data.replace(/[^a-fA-F0-9:]/g, '');
    setFormData({ ...formData, macAddress: macFromQR });
    setShowCamera(false);
    
    Alert.alert("QR Code lido com sucesso", `MAC Address: ${macFromQR}`);
  };

  const handleSendData = () => {
    // Usar o MAC já formatado para enviar
    const dataToSend = { ...formData, macAddress: formattedMac };

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

      {/* Campo MAC Address com botão de QR Code */}
      <View style={styles.macAddressContainer}>
        <TextInput
          label="MAC Address"
          mode="outlined"
          value={formattedMac}
          style={styles.macInput}
          onChangeText={(text) => setFormData({ ...formData, macAddress: text })}
        />
        <IconButton
          icon="qrcode-scan"
          size={24}
          mode="contained"
          onPress={() => setShowCamera(true)}
          style={styles.qrButton}
        />
      </View>

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

      {/* Componente de câmera reutilizável */}
      <CameraComponent
        isVisible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleQRCodeCapture}
        mode="barcode"
        title="Escaneie o código QR do MAC Address"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  macAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  macInput: {
    flex: 1,
    marginRight: 8,
  },
  qrButton: {
    marginLeft: 4,
  },
  button: {
    marginTop: 20,
  }
});

export default DeviceFormScreen;