import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { useTheme, ThemeType } from "../theme/ThemeContext";
import { Switch, RadioButton } from "react-native-paper";

const ThemeSelector: React.FC = () => {
  const { themeType, setThemeType, isDarkTheme } = useTheme();

  const themeOptions: { label: string; value: ThemeType }[] = [
    { label: "Claro", value: "light" },
    { label: "Escuro", value: "dark" },
    { label: "Sistema", value: "system" },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkTheme ? "#1e1e1e" : "#ffffff" },
      ]}
    >
      <Text
        style={[styles.title, { color: isDarkTheme ? "#f8f9fa" : "#212121" }]}
      >
        Configurações de Tema
      </Text>

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionRow}
            onPress={() => setThemeType(option.value)}
          >
            <RadioButton
              value={option.value}
              status={themeType === option.value ? "checked" : "unchecked"}
              onPress={() => setThemeType(option.value)}
              color={isDarkTheme ? "#0d6efd" : "#007bff"}
            />
            <Text
              style={[
                styles.optionText,
                { color: isDarkTheme ? "#f8f9fa" : "#212121" },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchContainer}>
        <Text
          style={[
            styles.switchText,
            { color: isDarkTheme ? "#f8f9fa" : "#212121" },
          ]}
        >
          Modo Escuro
        </Text>
        <Switch
          value={isDarkTheme}
          onValueChange={(value) => setThemeType(value ? "dark" : "light")}
          color={isDarkTheme ? "#0d6efd" : "#007bff"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    margin: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowRadius: 4,
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  switchText: {
    fontSize: 16,
  },
});

export default ThemeSelector;
