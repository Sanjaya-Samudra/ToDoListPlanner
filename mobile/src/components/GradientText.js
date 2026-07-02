import React from "react";
import { Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const GradientText = ({ children, style, colors, start, end }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const gradientColors = colors || [c.primary, c.accent];

  if (Platform.OS === "web") {
    return (
      <Text style={[{ backgroundImage: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }, style]}>
        {children}
      </Text>
    );
  }

  return (
    <LinearGradient colors={gradientColors} start={start || { x: 0, y: 0 }} end={end || { x: 1, y: 0 }} style={{ alignSelf: "flex-start" }}>
      <Text style={[styles.text, style]}>{children}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  text: { color: "#fff" },
});

export default GradientText;
