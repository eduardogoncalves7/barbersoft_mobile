// src/navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useApp } from "../context/AppContext";
import { RootStackParamList } from "../types";
import { LoginScreen }   from "../screens/auth/LoginScreen";
import { AdminNavigator } from "./AdminNavigator";
import { ClientNavigator } from "./ClientNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { usuarioLogado } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!usuarioLogado ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : usuarioLogado.role === "admin" ? (
          <Stack.Screen name="AdminTabs" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="ClientTabs" component={ClientNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
