import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Chip,
  Switch,
} from "react-native-paper";
import CameraComponent from "../components/CameraComponent";
import CampaignSearch from "../components/CampaignSearch";
import { useTheme } from "../theme/ThemeContext";

// Interface para os dados da campanha
interface Campaign {
  campaignId: number;
  name: string;
  isDefault: boolean;
  downloads: number;
  fragranceShots: number;
  deviceTests: number | null;
}

// Função para formatar o macAddress
function formatToMacAddress(input: string): string {
  // Remove caracteres não-hexadecimais
  const sanitized = input.replace(/[^a-fA-F0-9]/g, "");
  // Limita a 12 caracteres (formato MAC)
  const trimmed = sanitized.slice(0, 12);
  // Formata como XX:XX:XX:XX:XX:XX
  return (
    trimmed
      .match(/.{1,2}/g)
      ?.join(":")
      .toUpperCase() || ""
  );
}

const DeviceFormScreen = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    userId: 1,
    ownerId: 1,
    campaignId: 13,
    remainingTests: 100,
    macAddress: "80E1266921E3",
    appVersion: "0.0.1",
    isConfigured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [showCamera, setShowCamera] = useState(false);
  const [formattedMac, setFormattedMac] = useState("");
  const [showCampaignSearch, setShowCampaignSearch] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // Atualiza o formato do MAC sempre que o valor mudar
  useEffect(() => {
    setFormattedMac(formatToMacAddress(formData.macAddress));
  }, [formData.macAddress]);

  const handleQRCodeCapture = (data: string) => {
    // Extrai apenas caracteres hexadecimais se o QR Code contiver outros caracteres
    const macFromQR = data.replace(/[^a-fA-F0-9:]/g, "");
    setFormData({ ...formData, macAddress: macFromQR });
    setShowCamera(false);

    Alert.alert("QR Code lido com sucesso", `MAC Address: ${macFromQR}`);
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({ ...formData, campaignId: campaign.campaignId });
  };

  const handleSendData = () => {
    // Usar o MAC já formatado para enviar
    const dataToSend = { ...formData, macAddress: formattedMac };

    // Simula um envio de dados
    Alert.alert("Dados enviados", JSON.stringify(dataToSend, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Enviar Dados
      </Text>

      <TextInput
        label="User ID"
        mode="outlined"
        value={String(formData.userId)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) =>
          setFormData({ ...formData, userId: Number(text) })
        }
      />

      <TextInput
        label="Owner ID"
        mode="outlined"
        value={String(formData.ownerId)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) =>
          setFormData({ ...formData, ownerId: Number(text) })
        }
      />

      {/* Campo Campaign com visualização do ID e Nome */}
      <View style={styles.campaignSection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
          Campanha
        </Text>

        <View style={styles.campaignContainer}>
          <View style={styles.campaignInfo}>
            {/* ID da Campanha */}
            <View style={styles.campaignIdContainer}>
              <Text
                style={[
                  styles.campaignIdLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                ID:
              </Text>
              <TextInput
                mode="outlined"
                value={String(formData.campaignId)}
                keyboardType="numeric"
                style={styles.campaignIdInput}
                onChangeText={(text) =>
                  setFormData({ ...formData, campaignId: Number(text) })
                }
                dense
                disabled
              />
            </View>

            {/* Nome da Campanha (se estiver selecionada) */}
            {selectedCampaign ? (
              <Chip
                mode="flat"
                style={[
                  styles.campaignNameChip,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
                textStyle={{ color: theme.colors.onPrimaryContainer }}
              >
                {selectedCampaign.name}
              </Chip>
            ) : (
              <Text
                style={[
                  styles.campaignNamePlaceholder,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Selecione uma campanha
              </Text>
            )}
          </View>

          <IconButton
            icon="magnify"
            size={24}
            mode="contained"
            onPress={() => setShowCampaignSearch(true)}
            style={styles.searchButton}
          />
        </View>
      </View>

      <TextInput
        label="Remaining Tests"
        mode="outlined"
        value={String(formData.remainingTests)}
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(text) =>
          setFormData({ ...formData, remainingTests: Number(text) })
        }
      />

      {/* Campo MAC Address com botão de QR Code */}
      <View style={styles.macAddressContainer}>
        <TextInput
          label="MAC Address"
          mode="outlined"
          value={formattedMac}
          style={styles.macInput}
          onChangeText={(text) =>
            setFormData({ ...formData, macAddress: text })
          }
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
          setFormData({
            ...formData,
            isConfigured: text.toLowerCase() === "true",
          })
        }
      />
      <View
        style={[
          styles.macAddressContainer,
          {
            justifyContent: "space-between",
            alignItems: "center",
            alignSelf: "stretch",
            marginBottom: 0,
          },
        ]}
      >
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
          Configura Device?
        </Text>
        <Switch
          value={formData.isConfigured}
          onValueChange={(value) =>
            setFormData({ ...formData, isConfigured: value })
          }
        />
      </View>

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

      {/* Componente de pesquisa de campanhas */}
      <CampaignSearch
        visible={showCampaignSearch}
        onDismiss={() => setShowCampaignSearch(false)}
        onSelect={handleCampaignSelect}
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
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  campaignSection: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  campaignContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  campaignInfo: {
    flex: 1,
    marginRight: 8,
  },
  campaignIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  campaignIdLabel: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: "bold",
  },
  campaignIdInput: {
    flex: 0.3,
    height: 40,
  },
  campaignNameChip: {
    alignSelf: "flex-start",
  },
  campaignNamePlaceholder: {
    fontStyle: "italic",
  },
  searchButton: {
    marginLeft: 4,
  },
  macAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
});

export default DeviceFormScreen;
