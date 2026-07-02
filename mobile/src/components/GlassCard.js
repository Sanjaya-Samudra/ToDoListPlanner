import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const GlassCard = ({ children, style, accentColor, accentPosition = "top", compact = false }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const accent = accentColor || c.primary;

  return (
    <View style={[styles.wrapper, style]}>
      {accentPosition === "top" && (
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
      )}
      <View style={[styles.card, { backgroundColor: c.glass, borderColor: c.glassBorder, shadowColor: theme.shadow.md.shadowColor, shadowOpacity: theme.shadow.md.shadowOpacity, shadowOffset: theme.shadow.md.shadowOffset, shadowRadius: theme.shadow.md.shadowRadius, elevation: theme.shadow.md.elevation }]}>
        {accentPosition === "left" && (
          <View style={[styles.accentLeft, { backgroundColor: accent }]} />
        )}
        <View style={[styles.inner, compact && styles.compactInner]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  accentBar: { height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  accentLeft: { position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2, zIndex: 1 },
  card: { borderRadius: 20, borderWidth: 1, backdropFilter: "blur(12px)", overflow: "hidden" },
  inner: { padding: 20 },
  compactInner: { padding: 14 },
});

export default GlassCard;
