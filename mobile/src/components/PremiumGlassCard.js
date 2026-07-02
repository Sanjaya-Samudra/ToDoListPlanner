import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const PremiumGlassCard = ({ children, style, glowColor, accentColor, compact = false }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const accent = accentColor || c.primary;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ])).start();
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.glow, { backgroundColor: glowColor || accent, opacity: glowOpacity }]} />
      <View style={[styles.card, { backgroundColor: c.glass, borderColor: c.glassBorder, shadowColor: theme.shadow.md.shadowColor, shadowOpacity: theme.shadow.md.shadowOpacity + 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 16, elevation: theme.shadow.md.elevation + 1 }]}>
        <LinearGradient colors={[accent + "08", "transparent"]} style={styles.innerGlow} />
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={[styles.inner, compact && styles.compactInner]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  glow: { position: "absolute", top: 0, left: 10, right: 10, bottom: 0, borderRadius: 24, filter: "blur(20px)" },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden", backdropFilter: "blur(12px)" },
  innerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: "100%", pointerEvents: "none" },
  accentBar: { height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  inner: { padding: 20 },
  compactInner: { padding: 14 },
});

export default PremiumGlassCard;
