import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SuggestionChip = ({ label, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <TouchableOpacity style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "500" },
});

export default SuggestionChip;
