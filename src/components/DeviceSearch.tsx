import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";
import CameraComponent from "./CameraComponent";

interface Device {
  deviceId: number;
  macAddress: string;
  remainingTests: number;
  campaign: {
    campaignId: number;
    name: string;
  };
  [key: string]: any;
}

interface DeviceSearchProps {
  onSelect: (device: Device) => void;
  visible: boolean;
  onDismiss: () => void;
}

const DeviceSearch: React.FC<DeviceSearchProps> = ({
  onSelect,
  visible,
  onDismiss,
}) => {
  const [macAddress, setMacAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { theme } = useTheme();

  const formatMacAddress = (mac: string): string => {
    // Remove todos os caracteres não alfanuméricos
    const cleanMac = mac.replace(/[^A-Fa-f0-9]/g, "");
    
    // Formata como XX:XX:XX:XX:XX:XX
    return cleanMac
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(":") || "";
  };

  const handleSearch = async () => {
    if (!macAddress.trim()) {
      setError("Digite um MAC Address para buscar");
      return;
    }

    setLoading(true);
    setError(null);
    setDevice(null);

    try {
      // Formata o MAC address se necessário
      const formattedMac = formatMacAddress(macAddress);
      const response = await apiClient.get(`/api/devices/mac/${formattedMac}`);
      
      if (response.data) {
        setDevice(response.data);
      } else {
        setError("Dispositivo não encontrado");
      }
    } catch (err: any) {
      console.error("Erro ao buscar dispositivo:", err);
      setError(
        err.response?.status === 404
          ? "Dispositivo não encontrado. Verifique o MAC Address."
          : "Erro ao buscar dispositivo. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = () => {
    if (device) {
      onSelect(device);
      // Limpar o estado ao selecionar
      setMacAddress("");
      setDevice(null);
      onDismiss();
    }
  };

  const handleQRCodeCapture = (data: string) => {
    // Extrai apenas caracteres hexadecimais ou dois-pontos se o QR Code contiver outros caracteres
    const macFromQR = data.replace(/[^a-fA-F0-9:]/g, "");
    setMacAddress(macFromQR);
    setShowCamera(false);
    
    // Executa a busca automaticamente após capturar o QR code
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  return (
    <>
      <Modal
        visible={!showCamera && visible}
        transparent={false}
        animationType="slide"
        onRequestClose={onDismiss}
      >
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
          <View
            style={[styles.header, { borderBottomColor: theme.colors.outline }]}
          >
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={theme.colors.primary}
              onPress={onDismiss}
            />
            <Text
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              Buscar Dispositivo
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <TextInput
                label="MAC Address"
                mode="outlined"
                value={macAddress}
                onChangeText={setMacAddress}
                style={styles.searchInput}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleSearch}
              />
              <IconButton
                icon="qrcode-scan"
                mode="contained"
                onPress={() => setShowCamera(true)}
                style={styles.qrButton}
              />
              <Button
                mode="contained"
                onPress={handleSearch}
                loading={loading}
                disabled={loading}
                style={styles.searchButton}
              >
                Buscar
              </Button>
            </View>

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary}
                />
                <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                  Buscando dispositivo...
                </Text>
              </View>
            )}

            {device && (
              <View
                style={[
                  styles.deviceCard,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.deviceTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Dispositivo Encontrado
                </Text>
                
                <View style={styles.deviceInfo}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      MAC Address:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {device.macAddress}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      ID:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {device.deviceId}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Testes Restantes:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {device.remainingTests}
                    </Text>
                  </View>
                  
                  {device.campaign && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Campanha:
                      </Text>
                      <Text 
                        style={[
                          styles.infoValue, 
                          styles.campaignName,
                          { color: theme.colors.primary }
                        ]}
                      >
                        {device.campaign.name}
                      </Text>
                    </View>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSelectDevice}
                  style={styles.selectButton}
                >
                  Selecionar Dispositivo
                </Button>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Componente de câmera */}
      <CameraComponent
        isVisible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleQRCodeCapture}
        mode="barcode"
        title="Escaneie o código QR do MAC Address"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    justifyContent: "center",
  },
  qrButton: {
    marginRight: 8,
  },
  errorText: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
  },
  deviceCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  deviceInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "bold",
    marginRight: 8,
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  campaignName: {
    fontWeight: "bold",
  },
  selectButton: {
    marginTop: 8,
  },
});

export default DeviceSearch;