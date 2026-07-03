import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

const AppNavigator = () => {
  const { token, loading } = useAuth();
  const { theme, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("@onboarding_completed");
        if (completed !== "true") {
          setShowOnboarding(true);
        }
      } catch {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem("@onboarding_completed", "true");
    } catch {}
    setShowOnboarding(false);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (showOnboarding) return <OnboardingScreen onFinish={handleOnboardingFinish} />;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AppNavigator;
