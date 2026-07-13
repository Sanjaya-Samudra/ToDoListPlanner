import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mediumImpact } from "../utils/haptics";

const UpdateCard = ({ summary, onApply, isApplied }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const scale = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.warning + "40" }]}>
        <View style={[styles.accent, { backgroundColor: c.warning }]} />
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.icon}>✏️</Text>
            <Text style={[styles.summary, { color: c.text, flex: 1 }]}>{summary}</Text>
          </View>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: isApplied ? c.success : c.warning }]}
            onPress={() => { mediumImpact(); onApply?.(); }}
            disabled={isApplied}
            activeOpacity={0.8}
          >
            <Text style={styles.applyBtnText}>{isApplied ? "✓ Applied" : "Apply Update"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 8, marginBottom: 4 },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 12, gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  icon: { fontSize: 14 },
  summary: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  applyBtn: { marginTop: 6, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

export default UpdateCard;
