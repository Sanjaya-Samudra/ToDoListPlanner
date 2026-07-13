import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { CATEGORIES } from "../constants/config";

const CategoryPicker = ({ selected, onSelect, showAll = true }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const items = showAll ? [{ label: "All", value: null, icon: "📋", color: colors.textSecondary }, ...CATEGORIES] : CATEGORIES;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {items.map((cat) => {
        const active = selected === cat.value;
        return (
          <TouchableOpacity
            key={cat.value || "all"}
            style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border, borderWidth: 1 }]}
            onPress={() => onSelect(cat.value)}
          >
            <Text style={styles.chipIcon}>{cat.icon}</Text>
            <Text style={[styles.chipLabel, { color: active ? "#fff" : colors.text, fontWeight: active ? "600" : "500" }]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 13 },
});

export default CategoryPicker;
