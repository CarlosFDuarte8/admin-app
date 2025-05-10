import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  Divider,
  Card,
  ActivityIndicator,
  Chip,
  IconButton,
  ProgressBar,
  HelperText,
  Switch,
  Modal,
  Portal,
} from "react-native-paper";
import CampaignSearch from "../components/CampaignSearch";
import QRCodesGrid from "../components/QRCodesGrid";
import DeviceSearch from "../components/DeviceSearch";
import { useTheme } from "../theme/ThemeContext";
import apiClient from "../api/client";
import { CapsuleType } from "../types/CapsuleType";
import ModalContainer from "../components/ModalContainer";

interface Fragrance {
  fragranceId: number;
  slot: number;
  name: string;
  selected: boolean;
  deselect?: boolean;
}

interface Campaign {
  campaignId: number;
  name: string;
  fragranceShots: number;
  deviceTests: number | null;
  collection: Array<any>;
  isDefault?: boolean;
  downloads?: number;
}

const CapsuleFormScreen = () => {
  const { theme, isDarkTheme } = useTheme();

  // Calcular a data atual e a data de vencimento (1 ano à frente)
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  const getExpirationDate = () => {
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  const today = getCurrentDate();
  const defaultExpirationDate = getExpirationDate();

  // Form data
  const [formData, setFormData] = useState<Partial<CapsuleType>>({
    customerCode: "",
    deviceId: 0,
    fragranceId: 0,
    dueDate: defaultExpirationDate, // Definindo a data de vencimento para 1 ano à frente
    serialNumber: "",
    remainingShots: 0,
    performedShots: 0,
  });

  // Campaign related states
  const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(
    null
  );
  const [loadCampaign, setLoadCampaign] = useState(false);
  const [collections, setCollections] = useState<Array<Fragrance>>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deviceTestsInCampaigns, setDeviceTestsInCampaigns] = useState<
    string | number
  >("");
  const [remainingTestsChecked, setRemainingTestsChecked] = useState(false);
  const [macAddress, setMacAddress] = useState("");
  const [showCampaignSearch, setShowCampaignSearch] = useState(false);
  const [showDeviceSearch, setShowDeviceSearch] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [allowSave, setAllowSave] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressSubmit, setProgressSubmit] = useState(0);
  const [valueRemainingShots, setValueRemainingShots] = useState(0);
  const [openQRCodes, setOpenQRCodes] = useState(false);
  const [qrCodes, setQRCodes] = useState<Array<any>>([]);
  const [devMode, setDevMode] = useState(false);

  // Adicionar indicadores de loading mais específicos
  const [loadingDevice, setLoadingDevice] = useState(false);
  const [processingValidation, setProcessingValidation] = useState(false);
  const [processingSave, setProcessingSave] = useState(false);

  // Novo estado para controlar se já existe uma campanha associada ao dispositivo
  const [deviceHasExistingCampaign, setDeviceHasExistingCampaign] =
    useState(false);
  const [originalCampaignName, setOriginalCampaignName] = useState<
    string | null
  >(null);

  // Effects
  useEffect(() => {
    loadingData();
  }, []);

  useEffect(() => {
    if (campaignSelected?.fragranceShots) {
      setValueRemainingShots(campaignSelected.fragranceShots);
    }
  }, [remainingTestsChecked, campaignSelected]);

  useEffect(() => {
    const isSelected = collections.filter((item) => item.selected === true);
    if (isSelected.length === collections.length && collections.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }

    if (isSelected.length < 1) {
      setAllowSave(true);
      setSelectAll(false);
    }
  }, [collections, allowSave]);

  // Functions
  const loadingData = async () => {
    try {
      const response = await apiClient.get("/api/settings");
      if (response.data && response.data.customerCode) {
        setFormData((prev) => ({
          ...prev,
          customerCode: response.data.customerCode,
        }));
        console.log("Código do cliente obtido:", response.data.customerCode);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Função para atualizar a campanha do dispositivo na API
  const updateDeviceCampaign = async (deviceId: number, campaignId: number) => {
    setLoading(true);
    try {
      await apiClient.put(
        `/api/devices/update-campaign/${deviceId}/${campaignId}`
      );
      console.log(
        `Campanha do dispositivo ${deviceId} atualizada para ${campaignId}`
      );
      return true;
    } catch (error) {
      console.error("Erro ao atualizar campanha do dispositivo:", error);
      Alert.alert(
        "Erro",
        "Não foi possível atualizar a campanha do dispositivo."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSeachCampaign = async (campaign: Campaign) => {
    // Se houver um dispositivo selecionado e já tiver uma campanha diferente associada,
    // perguntar se o usuário deseja alterar a campanha no dispositivo
    if (
      formData.deviceId &&
      deviceHasExistingCampaign &&
      originalCampaignName
    ) {
      // Mostrar confirmação apenas se a campanha selecionada for diferente da original
      if (campaign.campaignId !== campaignSelected?.campaignId) {
        Alert.alert(
          "Alterar Campanha do Dispositivo",
          `O dispositivo atual está associado à campanha "${originalCampaignName}". Deseja alterar para "${campaign.name}"?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Alterar",
              onPress: async () => {
                const success = await updateDeviceCampaign(
                  formData.deviceId as number,
                  campaign.campaignId
                );
                if (success) {
                  setLoadCampaign(true);
                  try {
                    const url = `/api/campaigns/${campaign.campaignId}`;
                    const response = await apiClient.get(url);
                    handleChangeSelect(response.data);
                    setOriginalCampaignName(campaign.name);
                  } catch (error) {
                    console.error("Erro ao buscar campanha:", error);
                    Alert.alert(
                      "Erro",
                      "Não foi possível carregar a campanha selecionada."
                    );
                  } finally {
                    setLoadCampaign(false);
                  }
                }
              },
            },
          ]
        );
        return;
      }
    }

    // Caso não precise de confirmação, segue o fluxo normal
    setLoadCampaign(true);
    try {
      const url = `/api/campaigns/${campaign.campaignId}`;
      const response = await apiClient.get(url);
      handleChangeSelect(response.data);
    } catch (error) {
      console.error("Erro ao buscar campanha:", error);
      Alert.alert("Erro", "Não foi possível carregar a campanha selecionada.");
    } finally {
      setLoadCampaign(false);
    }
  };

  const handleChangeSelect = (data: Campaign) => {
    const deviceTests = data.deviceTests;
    const newData = data.collection
      .map((item: any) => {
        return {
          fragranceId: item.fragranceId,
          slot: item.slot,
          name: item.fragrance.name,
          selected: false,
        };
      })
      .sort((a: any, b: any) => a.slot - b.slot);

    setCampaignSelected(data);
    setCollections(newData);
    setDeviceTestsInCampaigns(deviceTests || 0);
  };

  // Função atualizada para buscar o dispositivo e a campanha associada
  const handleDeviceSelect = async (device: any) => {
    setFormData((prev) => ({ ...prev, deviceId: device.deviceId }));
    setMacAddress(device.macAddress);

    // Verificar se existe campaignId no dispositivo
    if (device.campaignId) {
      // Marcar que o dispositivo já tem campanha associada
      setDeviceHasExistingCampaign(true);

      // Indicar que está carregando os dados da campanha
      setLoadingDevice(true);
      try {
        // Buscar detalhes da campanha usando apenas o ID
        const campaign = {
          campaignId: device.campaignId,
          name: "Carregando...", // Placeholder temporário enquanto busca os detalhes
        };

        // Salvar o nome da campanha original para referência futura
        // Vamos fazer uma chamada para obter o nome real
        try {
          const campaignResponse = await apiClient.get(
            `/api/campaigns/${device.campaignId}`
          );
          if (campaignResponse.data && campaignResponse.data.name) {
            setOriginalCampaignName(campaignResponse.data.name);
          }
        } catch (error) {
          console.error("Erro ao buscar nome da campanha:", error);
        }

        await handleChangeSeachCampaign(campaign);
      } catch (error) {
        console.error("Erro ao carregar dados da campanha:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar os dados da campanha associada ao dispositivo."
        );
      } finally {
        setLoadingDevice(false);
      }
    }
    // Verificar se existe o objeto campaign com campaignId
    else if (device.campaign && device.campaign.campaignId) {
      // Marcar que o dispositivo já tem campanha associada
      setDeviceHasExistingCampaign(true);
      // Salvar o nome da campanha original
      setOriginalCampaignName(device.campaign.name || null);

      setLoadingDevice(true);
      try {
        await handleChangeSeachCampaign({
          campaignId: device.campaign.campaignId,
          name: device.campaign.name || "Carregando...",
        });
      } catch (error) {
        console.error("Erro ao carregar dados da campanha:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar os dados da campanha associada ao dispositivo."
        );
      } finally {
        setLoadingDevice(false);
      }
    } else {
      // Caso não tenha campanha associada
      setDeviceHasExistingCampaign(false);
      setOriginalCampaignName(null);
      console.log("Dispositivo sem campanha associada");
      Alert.alert(
        "Aviso",
        "Este dispositivo não possui uma campanha associada. Por favor, selecione uma campanha manualmente."
      );
    }
  };

  const handleSearchDevice = async (device: any) => {
    setFormData((prev) => ({ ...prev, deviceId: device.id }));
    setMacAddress(device.label);
    handleChangeSeachCampaign(device.obj.campaign);
  };

  const handleCheckboxChange = (itemId: number) => {
    const updatedItems = collections.map((item) => {
      if (item.fragranceId === itemId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setCollections(updatedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItems = collections.map((item) => ({ ...item, selected: true }));
      setCollections(allItems);
      setSelectAll(true);
    } else {
      const allItems = collections.map((item) => ({
        ...item,
        selected: false,
      }));
      setCollections(allItems);
      setSelectAll(false);
    }
  };

  const checkCapsules = async (serialNumber: string, fragranceId: number) => {
    try {
      await apiClient.get(
        `/api/capsules/serial/${serialNumber}/${fragranceId}`
      );
      return { status: false, fragranceId, serialNumber };
    } catch (error) {
      return { status: true, fragranceId, serialNumber };
    }
  };

  const updateDeviceByMacAddress = async () => {
    try {
      const response = await apiClient.get(`/api/devices/mac/${macAddress}`);
      const deviceInfo = response.data;
      const deviceId = deviceInfo.deviceId;

      await apiClient.put(`/api/devices/${deviceId}`, {
        remainingTests: deviceTestsInCampaigns,
      });
    } catch (error) {
      console.error("Erro ao atualizar dispositivo:", error);
      throw error;
    }
  };

  // Função atualizada para validar cápsulas com indicadores de progresso
  const checkItemsInAPI = async () => {
    const { serialNumber } = formData;
    if (!serialNumber) {
      Alert.alert("Aviso", "Você precisa informar um número de série.");
      return;
    }

    setLoading(true);
    setProcessingValidation(true);
    const prepareData = collections.filter(
      (item) => item.selected && serialNumber
    );
    const totalItems = prepareData.length;

    if (totalItems === 0) {
      setLoading(false);
      setProcessingValidation(false);
      Alert.alert(
        "Aviso",
        "Você precisa selecionar pelo menos uma fragrância."
      );
      return;
    }

    let processedCount = 0;

    try {
      for (const [index, item] of prepareData.entries()) {
        try {
          const response = await checkCapsules(serialNumber, item.fragranceId);
          const itemExists = response.status;
          if (!itemExists) {
            prepareData[index].selected = response.status;
            prepareData[index].deselect = response.status;
          }
        } catch (error) {
          console.error("Erro ao verificar item na API:", error);
        }

        processedCount++;
        const currentProgress = Math.ceil((processedCount / totalItems) * 100);
        setProgress(currentProgress);
      }

      setCollections(prepareData);
      setAllowSave(false);

      const filterP = prepareData.filter((item) => item.deselect === false);
      if (filterP.length > 0) {
        Alert.alert(
          "Informação",
          "Algumas cápsulas já foram validadas e serão desmarcadas."
        );
        setSelectAll(false);
      }

      if (filterP.length === totalItems) {
        setAllowSave(true);
      }
    } catch (error) {
      console.error("Erro ao verificar cápsulas:", error);
      Alert.alert("Erro", "Ocorreu um erro ao validar as cápsulas.");
    } finally {
      setLoading(false);
      setProcessingValidation(false);
      setProgress(0);
    }
  };

  // Função atualizada para submeter o formulário com indicadores de progresso
  const handleSubmit = async () => {
    if (!formData.deviceId || !formData.serialNumber) {
      Alert.alert("Aviso", "Preencha todos os campos obrigatórios.");
      return;
    }

    const selectedItems = collections.filter((value) => value.selected);
    if (selectedItems.length === 0) {
      Alert.alert("Aviso", "Selecione pelo menos uma fragrância.");
      return;
    }

    setLoading(true);
    setProcessingSave(true);
    try {
      const totalItems = selectedItems.length;
      let processedCount = 0;

      for (const value of collections) {
        if (value.selected) {
          const body: CapsuleType = {
            customerCode: formData.customerCode || "",
            deviceId: formData.deviceId || 0,
            dueDate: formData.dueDate || today,
            fragranceId: value.fragranceId,
            remainingShots: valueRemainingShots,
            serialNumber: formData.serialNumber || "",
            performedShots: 0,
          };

          await apiClient.post("/api/capsules", body);

          processedCount++;
          const currentProgress = Math.ceil(
            (processedCount / totalItems) * 100
          );
          setProgressSubmit(currentProgress);
        }
      }

      if (remainingTestsChecked) {
        await updateDeviceByMacAddress();
      }

      Alert.alert("Sucesso", "Cápsulas cadastradas com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar cápsulas:", error);
      Alert.alert(
        "Erro",
        "Não foi possível cadastrar as cápsulas. Tente novamente."
      );
    } finally {
      setAllowSave(true);
      setLoading(false);
      setProcessingSave(false);
      setProgressSubmit(0);
    }
  };

  const resetForm = () => {
    setFormData({
      customerCode: formData.customerCode,
      deviceId: 0,
      fragranceId: 0,
      dueDate: today,
      serialNumber: "",
      remainingShots: 0,
      performedShots: 0,
    });
    setCollections([]);
    setCampaignSelected(null);
    setMacAddress("");
    setDeviceTestsInCampaigns("");
    setRemainingTestsChecked(false);
    setValueRemainingShots(0);
    setSelectAll(false);

    // Também resetar as variáveis de controle de campanha
    setDeviceHasExistingCampaign(false);
    setOriginalCampaignName(null);
  };

  const handleGenerateQRCodes = () => {
    const combinedData = collections
      .filter((item) => item.selected)
      .map((item) => ({
        ...item,
        customerCode: formData.customerCode,
        dueDate: formData.dueDate,
        serialNumber: formData.serialNumber,
      }));

    setQRCodes(combinedData);
    setOpenQRCodes(true);
  };

  const checkCampos = () => {
    const { deviceId, serialNumber } = formData;
    const isSelected = collections.filter((item) => item.selected === true);

    if (serialNumber && deviceId && isSelected.length > 0) {
      return false;
    }
    return true;
  };

  const generateSerialNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    if (devMode) {
      result = "T";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } else {
      for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    setFormData((prev) => ({ ...prev, serialNumber: result }));
  };

  // Rendering helpers
  const renderProgressBar = () => {
    if (processingValidation && progress > 0) {
      return (
        <Portal>
          <Modal
            visible={processingValidation && progress > 0}
            style={{ backgroundColor: theme.colors.background }}
          >
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                Validando cápsulas: {progress}%
              </Text>
              <ProgressBar
                progress={progress / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Modal>
        </Portal>
      );
    } else if (processingSave && progressSubmit > 0) {
      return (
        <Portal>
          <Modal
            visible={processingSave && progressSubmit > 0}
            style={{ backgroundColor: theme.colors.background }}
          >
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                Cadastrando cápsulas: {progressSubmit}%
              </Text>
              <ProgressBar
                progress={progressSubmit / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Modal>
        </Portal>
      );
    }
    return null;
  };

  // Render the main component
  return (
    <ScrollView
      style={[styles.container, ]}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.background }]}>
        <Card.Content>
          {/* Customer Code */}
          <TextInput
            label="Código do Cliente"
            mode="outlined"
            value={formData.customerCode}
            disabled
            style={styles.input}
          />

          {/* Serial Number com botão para gerar */}
          <View style={styles.serialContainer}>
            <TextInput
              label="Número de Série *"
              mode="outlined"
              value={formData.serialNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, serialNumber: text })
              }
              style={styles.serialInput}
              maxLength={9}
              error={
                !formData.serialNumber && formData.serialNumber !== undefined
              }
            />
            <IconButton
              icon="refresh"
              mode="contained"
              onPress={generateSerialNumber}
              style={styles.serialButton}
            />
          </View>
          {!formData.serialNumber && formData.serialNumber !== undefined && (
            <HelperText type="error">Campo obrigatório</HelperText>
          )}

          {/* Opção de modo desenvolvimento */}
          <View style={styles.devModeContainer}>
            <Text style={{ color: theme.colors.text }}>
              Modo Desenvolvimento
            </Text>
            <Switch value={devMode} onValueChange={setDevMode} />
          </View>
          {devMode && (
            <HelperText type="info">
              No modo desenvolvedor, o número de série começa com "T"
            </HelperText>
          )}

          {/* Due Date */}
          <TextInput
            label="Data de Vencimento *"
            mode="outlined"
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            style={styles.input}
            right={<TextInput.Icon icon="calendar" />}
          />

          {/* Device Selection */}
          <View style={styles.searchContainer}>
            <TextInput
              label="Dispositivo *"
              mode="outlined"
              value={macAddress}
              style={styles.searchInput}
              disabled
            />
            <IconButton
              icon="magnify"
              mode="contained"
              onPress={() => setShowDeviceSearch(true)}
              style={styles.searchButton}
            />
          </View>

          {/* Campaign */}
          <View style={styles.searchContainer}>
            <TextInput
              label="Campanha *"
              mode="outlined"
              value={campaignSelected?.name || ""}
              style={styles.searchInput}
              disabled
            />
            <IconButton
              icon="magnify"
              mode="contained"
              onPress={() => setShowCampaignSearch(true)}
              style={styles.searchButton}
            />
          </View>

          {/* Remaining Shots */}
          <TextInput
            label="Disparos Disponíveis"
            mode="outlined"
            value={valueRemainingShots.toString()}
            onChangeText={(text) => {
              const numValue = parseInt(text);
              if (!isNaN(numValue) && numValue <= 999) {
                setValueRemainingShots(numValue);
              } else if (text === "") {
                setValueRemainingShots(0);
              }
            }}
            keyboardType="numeric"
            maxLength={3}
            style={styles.input}
          />
          <HelperText type="info">Máximo: 999</HelperText>

          <Divider style={styles.divider} />

          {/* Fragrances Selection */}
          {collections.length > 0 && (
            <View style={styles.fragrancesContainer}>
              <View style={styles.selectAllContainer}>
                <Checkbox.Item
                  // <Checkbox
                  label="Selecionar Tudo"
                  status={selectAll ? "checked" : "unchecked"}
                  onPress={() => handleSelectAll(!selectAll)}
                  mode="android"
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.fragrancesGrid}>
                {collections.map((item) => (
                  <Checkbox.Item
                    key={item.fragranceId}
                    label={`${item.slot} - ${item.name}`}
                    status={item.selected ? "checked" : "unchecked"}
                    style={styles.fragranceItem}
                    labelStyle={{ fontSize: 14 }}
                    mode="android"
                    onPress={() => handleCheckboxChange(item.fragranceId)}
                  />
                ))}
              </View>
            </View>
          )}
        </Card.Content>

        <Card.Actions style={styles.actionContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            flex: 1,
            }}
          >
            <Button
              mode="contained"
              onPress={checkItemsInAPI}
              disabled={checkCampos()}
              style={styles.actionButton}
            >
              Validar Cápsulas
            </Button>

            <Button
              mode="outlined"
              icon="qrcode"
              onPress={handleGenerateQRCodes}
              disabled={allowSave}
              style={styles.actionButton}
            >
              Gerar QR Codes
            </Button>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox.Item
              label={`Consumo por Testes: ${deviceTestsInCampaigns}`}
              status={remainingTestsChecked ? "checked" : "unchecked"}
              onPress={() => setRemainingTestsChecked(!remainingTestsChecked)}
              disabled={allowSave}
              mode="android"
            />
          </View>
        </Card.Actions>

        <Divider style={styles.divider} />

        <Card.Actions style={styles.buttonsContainer}>
          <Button
            mode="contained-tonal"
            onPress={resetForm}
            style={styles.formButton}
          >
            Limpar
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={allowSave}
            style={styles.formButton}
          >
            Cadastrar
          </Button>
        </Card.Actions>
      </Card>

      {/* Loading indicator para carga geral */}
      {loading && !processingValidation && !processingSave && (
        <Portal>
          <Modal
            visible={loading && !processingValidation && !processingSave}
            style={{ backgroundColor: theme.colors.background }}
          >
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                {loadCampaign ? "Carregando campanha..." : "Processando..."}
              </Text>
            </View>
          </Modal>
        </Portal>
      )}

      {/* Loading indicator ao carregar dispositivo/campanha */}
      {loadingDevice && (
        <Portal>
          <Modal
            visible={loadingDevice}
            style={{ backgroundColor: theme.colors.background }}
          >
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                Carregando dados do dispositivo e campanha...
              </Text>
            </View>
          </Modal>
        </Portal>
      )}

      {/* Barras de progresso */}
      {renderProgressBar()}

      {/* Device Search Modal */}
      <DeviceSearch
        visible={showDeviceSearch}
        onDismiss={() => setShowDeviceSearch(false)}
        onSelect={handleDeviceSelect}
      />

      {/* Campaign Search Modal */}
      <CampaignSearch
        visible={showCampaignSearch}
        onDismiss={() => setShowCampaignSearch(false)}
        onSelect={handleChangeSeachCampaign}
      />

      {/* QR Codes Grid Modal */}
      <QRCodesGrid
        data={qrCodes}
        open={openQRCodes}
        onClose={() => setOpenQRCodes(false)}
        name={campaignSelected?.name}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    margin: 0,
  },
  divider: {
    marginVertical: 5,
  },
  fragrancesContainer: {},
  selectAllContainer: {
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  fragrancesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    flexGrow: 1,
    justifyContent: "space-between",
    width: "100%",
  },
  fragranceItem: {
    alignItems: "center",
    width: 175,
    height: 60,
    padding: 8,
    margin: 2,
    justifyContent: "space-between",
  },
  actionContainer: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  actionButton: {
    margin: 4,
    alignSelf: "stretch",
    flex: 1,
},
checkboxContainer: {
      flex: 1,
  },
  buttonsContainer: {
    justifyContent: "space-between",
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 4,
  },
  progressText: {
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  serialContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  serialInput: {
    flex: 1,
    marginRight: 8,
  },
  serialButton: {
    margin: 0,
  },
  devModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});

export default CapsuleFormScreen;
