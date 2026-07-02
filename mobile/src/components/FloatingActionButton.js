import React, { useRef, useState } from "react";
import { TouchableOpacity, Text, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mediumImpact } from "../utils/haptics";

const FloatingActionButton = ({ onPress, icon = "+", color }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    mediumImpact();
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 0.85, damping: 10, stiffness: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
    onPress?.();
  };

  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[styles.fab, { backgroundColor: color || colors.primary, shadowColor: color || colors.primary }]}
      >
        <Animated.Text style={[styles.icon, { transform: [{ rotate: rotation }] }]}>{icon}</Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 28, right: 24, zIndex: 100 },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { color: "#fff", fontSize: 30, fontWeight: "300", marginTop: -2 },
});

export default FloatingActionButton;
