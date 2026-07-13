import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

const StatCard = ({ icon, label, value, color, delay = 0, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const scale = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 150, delay, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const anim = new Animated.Value(0);
    Animated.timing(anim, { toValue: value, duration: 600 + delay, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value: v }) => setDisplayValue(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);

  const content = (
    <Animated.View style={[styles.container, { backgroundColor: colors.surface, shadowColor: "#000", transform: [{ scale }] }]}>
      <View style={[styles.iconWrap, { backgroundColor: (color || colors.primary) + "15" }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center", padding: 16, borderRadius: 18,
    marginHorizontal: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  icon: { fontSize: 22 },
  value: { fontSize: 24, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "500", marginTop: 4 },
});

export default StatCard;
