import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SectionHeader = ({ title, action, onAction, icon }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionText: { fontSize: 14, fontWeight: "600" },
});

export default SectionHeader;
