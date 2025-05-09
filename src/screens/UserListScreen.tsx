import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  Searchbar,
  Card,
  IconButton,
  Divider,
  Button,
  Chip,
  Appbar,
} from "react-native-paper";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../api/client";
import { UserLoggedType } from "../types/UserType";
import { useTheme } from "../theme/ThemeContext";
import { NavigationAppProps } from "../navigation/app.route";

// Define the shape of the user data from the API
interface UserListItem {
  id: number;
  nome: string;
  email: string;
  profile: {
    id: number;
    nome: string;
  };
  grouper: boolean;
  mobilePhone?: string;
  createdAt: string;
  confirmedAt?: string;
}

// Pagination and filter parameters
interface UserListParams {
  Page: number;
  PerPage: number;
  Search?: string;
  OrderBy?: string;
  OrderByDirection?: "asc" | "desc";
  FilterString?: string;
  FilterType?: string;
  FilterInt?: number;
  Type?: string;
  UserId?: string;
  IsActive?: boolean;
}

// Response shape
interface UserListResponse {
  data: UserListItem[];
  total: number;
  totalPages: number;
}

const UserListScreen = () => {
  const navigation = useNavigation<NavigationAppProps>();
  const isFocused = useIsFocused();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthContext();
  const { theme, isDarkTheme } = useTheme();

  // State variables
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [params, setParams] = useState<UserListParams>({
    Page: 1,
    PerPage: 10,
    OrderBy: "id",
    OrderByDirection: "desc",
    IsActive: true,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Check if the current user is an admin
  const isAdmin = user?.profile?.nome === "ADMIN";

  console.log("Auth State:", { user, isAuthenticated, authLoading });
  console.log("Is Admin:", isAdmin);

  // Fetch users from the API
  const fetchUsers = async (refreshing = false) => {
    if (!isAdmin) {
      return;
    }

    try {
      if (!refreshing) {
        setLoading(true);
      }

      // Build the query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      // Add search query if present
      if (searchQuery) {
        queryParams.set("FilterString", searchQuery);
      }

      console.log("Fetching users with params:", queryParams.toString());

      const response = await apiClient.get<UserListResponse>(
        `/api/usuario?${queryParams.toString()}`
      );

      setUsers(response.data.data);
      setTotalUsers(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setParams({
      ...params,
      Page: 1,
    });
  };

  // Handle pagination
  const handleLoadMore = () => {
    if (params.Page < totalPages && !loading) {
      setParams({
        ...params,
        Page: params.Page + 1,
      });
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    setParams({
      ...params,
      Page: 1,
    });
    fetchUsers(true);
  };

  // Submit search
  const onSubmitSearch = () => {
    setParams({
      ...params,
      Page: 1,
    });
    fetchUsers();
  };

  // Navigate to user details
  const handleUserPress = (userId: number) => {
    // Exibir opções para o usuário
    Alert.alert("Opções do Usuário", "O que deseja fazer?", [
      // {
      //   text: "Ver Detalhes",
      //   onPress: () =>
      //     navigation.navigate("AccountDetails" as never, { userId } as never),
      // },
      {
        text: "Editar",
        onPress: () => navigation.navigate("Register", { userId }),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  // Format date to display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Call fetchUsers when component mounts or when dependencies change
  useEffect(() => {
    if (isFocused && isAdmin && isAuthenticated) {
      fetchUsers();
    }
  }, [isFocused, params.Page, isAdmin, isAuthenticated]);

  // Show loading while authentication state is being resolved
  if (authLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Carregando informações do usuário...
        </Text>
      </View>
    );
  }

  // If user is not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text
          style={[
            styles.accessDenied,
            { color: theme.colors.error || "#f44336" },
          ]}
        >
          Você precisa estar autenticado para acessar esta página.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Login" as never)}
          style={styles.loginButton}
          buttonColor={theme.colors.primary}
        >
          Ir para o Login
        </Button>
      </View>
    );
  }

  // If user is not admin, show access denied
  if (!isAdmin) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text
          style={[
            styles.accessDenied,
            { color: theme.colors.error || "#f44336" },
          ]}
        >
          Acesso negado. Você precisa ter permissões de administrador para
          acessar esta página.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <Appbar style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Content
          title="Lista de Usuários"
          titleStyle={{ color: theme.colors.text }}
        />
        <Appbar.Action
          icon="plus"
          onPress={() => navigation.navigate("Register")}
          color={theme.colors.primary}
        />
      </Appbar>
      <View style={[styles.content]}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar por nome ou email"
            onChangeText={onChangeSearch}
            value={searchQuery}
            onSubmitEditing={onSubmitSearch}
            style={[styles.searchBar, { backgroundColor: theme.colors.card }]}
            iconColor={theme.colors.primary}
            inputStyle={{ color: theme.colors.text }}
            placeholderTextColor={isDarkTheme ? "#aaaaaa" : "#888888"}
          />
          <Button
            mode="contained"
            onPress={onSubmitSearch}
            style={styles.searchButton}
            buttonColor={theme.colors.primary}
          >
            Buscar
          </Button>
        </View>

        {/* Filter chips */}
        <View style={styles.filterContainer}>
          <Chip
            selected={params.OrderByDirection === "desc"}
            onPress={() =>
              setParams({ ...params, OrderByDirection: "desc", Page: 1 })
            }
            style={[
              styles.chip,
              {
                backgroundColor:
                  params.OrderByDirection === "desc"
                    ? theme.colors.primary
                    : theme.colors.card,
              },
            ]}
            textStyle={{
              color:
                params.OrderByDirection === "desc"
                  ? "#ffffff"
                  : theme.colors.text,
            }}
          >
            Mais recentes
          </Chip>
          <Chip
            selected={params.OrderByDirection === "asc"}
            onPress={() =>
              setParams({ ...params, OrderByDirection: "asc", Page: 1 })
            }
            style={[
              styles.chip,
              {
                backgroundColor:
                  params.OrderByDirection === "asc"
                    ? theme.colors.primary
                    : theme.colors.card,
              },
            ]}
            textStyle={{
              color:
                params.OrderByDirection === "asc"
                  ? "#ffffff"
                  : theme.colors.text,
            }}
          >
            Mais antigos
          </Chip>
          {/* pesquisa pelo isActive */}
          <Chip
            selected={params.IsActive === true}
            onPress={() => setParams({ ...params, IsActive: true, Page: 1 })}
            style={[
              styles.chip,
              {
                backgroundColor:
                  params.IsActive === true
                    ? theme.colors.primary
                    : theme.colors.card,
              },
            ]}
            textStyle={{
              color: params.IsActive === true ? "#ffffff" : theme.colors.text,
            }}
          >
            Ativos
          </Chip>
          <Chip
            selected={params.IsActive === false}
            onPress={() => setParams({ ...params, IsActive: false, Page: 1 })}
            style={[
              styles.chip,
              {
                backgroundColor:
                  params.IsActive === false
                    ? theme.colors.primary
                    : theme.colors.card,
              },
            ]}
            textStyle={{
              color: params.IsActive === false ? "#ffffff" : theme.colors.text,
            }}
          >
            Inativos
          </Chip>
        </View>

        {/* User list */}
        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleUserPress(item.id)}
              >
                <Card.Content>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text
                        style={[styles.userName, { color: theme.colors.text }]}
                      >
                        {item.nome}
                      </Text>
                      <Text
                        style={[
                          styles.userEmail,
                          { color: isDarkTheme ? "#aaaaaa" : "#666666" },
                        ]}
                      >
                        {item.email}
                      </Text>
                    </View>
                    <IconButton
                      icon="chevron-right"
                      size={24}
                      onPress={() => handleUserPress(item.id)}
                      iconColor={theme.colors.primary}
                    />
                  </View>
                  <Divider
                    style={[
                      styles.divider,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                  <View style={styles.userDetails}>
                    <Text style={{ color: theme.colors.text }}>
                      Perfil:{" "}
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {item.profile?.nome || "N/A"}
                      </Text>
                    </Text>
                    <Text style={{ color: theme.colors.text }}>
                      Telefone:{" "}
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.mobilePhone || "N/A"}
                      </Text>
                    </Text>
                    <Text style={{ color: theme.colors.text }}>
                      Criado em:{" "}
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.text },
                        ]}
                      >
                        {formatDate(item.createdAt)}
                      </Text>
                    </Text>
                    <Text style={{ color: theme.colors.text }}>
                      Confirmado:{" "}
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.confirmedAt ? "Sim" : "Não"}
                      </Text>
                    </Text>
                    {item.grouper && (
                      <Chip
                        style={[
                          styles.grouperChip,
                          {
                            backgroundColor: isDarkTheme
                              ? "#1a3f5e"
                              : "#e0f7fa",
                          },
                        ]}
                        textStyle={{ color: theme.colors.text }}
                      >
                        Agrupador
                      </Chip>
                    )}
                  </View>
                </Card.Content>
              </Card>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={
              params.Page < totalPages ? (
                <TouchableOpacity
                  style={[
                    styles.loadMoreButton,
                    { backgroundColor: isDarkTheme ? "#2c2c2c" : "#e0e0e0" },
                  ]}
                  onPress={handleLoadMore}
                  disabled={loading}
                >
                  <Text
                    style={[styles.loadMoreText, { color: theme.colors.text }]}
                  >
                    Carregar mais
                  </Text>
                </TouchableOpacity>
              ) : totalUsers > 0 ? (
                <Text
                  style={[
                    styles.endOfListText,
                    { color: isDarkTheme ? "#aaaaaa" : "#666666" },
                  ]}
                >
                  Fim da lista • {totalUsers} usuários
                </Text>
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[
                      styles.emptyText,
                      { color: isDarkTheme ? "#aaaaaa" : "#666666" },
                    ]}
                  >
                    Nenhum usuário encontrado
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 8,
    elevation: 2,
    borderWidth: 0.5,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 8,
  },
  userDetails: {
    gap: 4,
  },
  detailValue: {
    fontWeight: "bold",
  },
  grouperChip: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  separator: {
    height: 8,
  },
  loadMoreButton: {
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 16,
  },
  loadMoreText: {
    fontWeight: "bold",
  },
  endOfListText: {
    textAlign: "center",
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
  accessDenied: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 20,
    width: "60%",
    alignSelf: "center",
  },
});

export default UserListScreen;
