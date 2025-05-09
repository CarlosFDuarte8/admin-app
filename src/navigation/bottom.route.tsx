import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreens";
import UserListScreen from "../screens/UserListScreen";
import { useTheme } from "../theme/ThemeContext";
import { useAuthContext } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuthContext(); // Usando AuthContext

  // Check if user is admin
  const isAdmin = user?.profile?.nome === "ADMIN";

  console.log("Bottom Tab Navigator - Auth State:", { user, isAuthenticated });
  console.log("Bottom Tab Navigator - Is Admin:", isAdmin);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: theme.colors.background,
          //   borderTopColor: theme.colors.background,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Only show Users tab for admin users */}
      {isAdmin && (
        <Tab.Screen
          name="Usuários"
          component={UserListScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? "account-group" : "account-group-outline"}
                size={size}
                color={color}
              />
            ),
            headerShown: false,
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
