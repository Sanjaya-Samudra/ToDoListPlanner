import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const PremiumSearchBar = ({ value, onChangeText, onSubmit, placeholder, icon = "🔍", inputRef: externalRef }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);
  const internalRef = useRef(null);
  const ref = externalRef || internalRef;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, { toValue: focused ? 1 : 0, damping: 15, stiffness: 120, useNativeDriver: false }).start();
  }, [focused]);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [c.glassBorder, c.primary + "60"],
  });

  const glowOpacity = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] });

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => ref.current?.focus()} style={[styles.wrapper]}>
      <Animated.View style={[styles.glow, { backgroundColor: c.primary, opacity: glowOpacity }]} />
      <Animated.View style={[styles.bar, { backgroundColor: c.glass, borderColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, { color: c.text }]}
          placeholder={placeholder || "Search..."}
          placeholderTextColor={c.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
        {value && value.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => { onChangeText?.(""); ref.current?.focus(); }}>
            <Text style={[styles.clearIcon, { color: c.textTertiary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  glow: { position: "absolute", top: 0, left: 4, right: 4, bottom: 0, borderRadius: 18 },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 2, borderRadius: 18, borderWidth: 1 },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: "500", paddingVertical: 10, height: 44 },
  clearBtn: { padding: 6, marginLeft: 4 },
  clearIcon: { fontSize: 14, fontWeight: "600" },
});

export default PremiumSearchBar;
