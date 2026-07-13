import React from "react";
import { StatusBar, View, TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import AppNavigator from "./src/navigation/AppNavigator";

const AppContent = () => {
  const { theme, isDark } = useTheme();
  const { updateActivity } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={updateActivity} onTouchStart={updateActivity}>
        <View style={{ flex: 1 }}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={theme.colors.background}
          />
          <AppNavigator />
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
