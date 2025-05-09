import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Text, Searchbar, Button, IconButton } from "react-native-paper";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

interface Campaign {
  campaignId: number;
  name: string;
  isDefault: boolean;
  downloads: number;
  fragranceShots: number;
  deviceTests: number | null;
  collection: any[]
}

interface CampaignSearchProps {
  onSelect: (campaign: Campaign) => void;
  visible: boolean;
  onDismiss: () => void;
}

const CampaignSearch: React.FC<CampaignSearchProps> = ({
  onSelect,
  visible,
  onDismiss,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, isDarkTheme } = useTheme();

  // Função para buscar campanhas com base na string de pesquisa
  const searchCampaigns = async (query: string) => {
    // Só pesquisa se tiver pelo menos 3 caracteres
    if (query.length < 3) {
      setCampaigns([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // O token de autenticação é automaticamente adicionado pelo interceptor em apiClient
      const response = await apiClient.get(
        `/api/campaigns/without-quiz?str=${query}`
      );
      setCampaigns(response.data);
    } catch (err) {
      setError("Erro ao buscar campanhas. Tente novamente.");
      console.error("Erro ao buscar campanhas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Busca campanhas quando a query muda, mas só se tiver pelo menos 3 caracteres
  useEffect(() => {
    if (visible) {
      searchCampaigns(searchQuery);
    }
  }, [searchQuery, visible]);

  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
      setCampaigns([]);
    }
  }, [visible]);

  const handleSelect = (campaign: Campaign) => {
    onSelect(campaign);
    // Limpa a pesquisa ao selecionar uma campanha
    setSearchQuery("");
    onDismiss();
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <TouchableOpacity
      style={[styles.campaignItem, { borderBottomColor: theme.colors.outline }]}
      onPress={() => handleSelect(item)}
    >
      <View>
        <Text style={[styles.campaignName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.campaignInfo,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          ID: {item.campaignId} • Disparos: {item.fragranceShots} • Fragrâncias: {item.collection.length}
        </Text>
      </View>
      <IconButton
        icon="arrow-right"
        size={20}
        iconColor={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <SafeAreaView>
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
              Selecionar Campanha
            </Text>
          </View>

          <Searchbar
            placeholder="Buscar campanha por nome..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            inputStyle={{ color: theme.colors.onSurface }}
          />

          {searchQuery.length > 0 && searchQuery.length < 3 ? (
            <View style={styles.messageContainer}>
              <Text style={{ color: theme.colors.onSurface }}>
                Digite pelo menos 3 caracteres para pesquisar...
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.messageContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 10 }}>
                Carregando campanhas...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <Button
                mode="outlined"
                onPress={() => searchCampaigns(searchQuery)}
                textColor={theme.colors.primary}
              >
                Tentar novamente
              </Button>
            </View>
          ) : campaigns.length === 0 && searchQuery.length >= 3 ? (
            <View style={styles.messageContainer}>
              <Text style={{ color: theme.colors.onSurface }}>
                Nenhuma campanha encontrada.
              </Text>
            </View>
          ) : searchQuery.length === 0 ? (
            <View style={styles.messageContainer}>
              <Text style={{ color: theme.colors.onSurface }}>
                Digite o nome da campanha para pesquisar...
              </Text>
            </View>
          ) : (
            <FlatList
              data={campaigns}
              renderItem={renderCampaignItem}
              keyExtractor={(item) => item.campaignId.toString()}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
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
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  campaignItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  campaignInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginBottom: 15,
  },
});

export default CampaignSearch;
