import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { useTasks } from "../hooks/useTasks";
import { useToast } from "../context/ToastContext";
import { mediumImpact, successNotification } from "../utils/haptics";
import { getPriorityColor } from "../constants/priorities";

const TaskSuggestionCard = ({ title, description, category, priority, onAdded }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { createTask } = useTasks();
  const { showToast } = useToast();
  const scale = useRef(new Animated.Value(0.95)).current;
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }).start();
  }, []);

  const handleAdd = async () => {
    if (adding || added) return;
    setAdding(true);
    mediumImpact();
    try {
      await createTask({ title, description: description || "", category: category || "other", priority: priority || "medium" });
      setAdded(true);
      successNotification();
      showToast("Task added!", "success");
      onAdded?.();
    } catch {
      showToast("Failed to add task", "error");
    } finally {
      setAdding(false);
    }
  };

  const priColor = getPriorityColor(priority);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: priColor + "40" }]}>
        <View style={[styles.accent, { backgroundColor: priColor }]} />
        <View style={styles.body}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{title}</Text>
          {description ? <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>{description}</Text> : null}
          <View style={styles.meta}>
            {category ? <View style={[styles.tag, { backgroundColor: c.primary + "12" }]}><Text style={[styles.tagText, { color: c.primary }]}>{category}</Text></View> : null}
            {priority ? <View style={[styles.tag, { backgroundColor: c.warning + "12" }]}><Text style={[styles.tagText, { color: c.warning }]}>{priority}</Text></View> : null}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: added ? c.success : c.primary }]}
            onPress={handleAdd}
            disabled={adding || added}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>{added ? "✓ Added" : adding ? "Adding..." : "+ Add to Tasks"}</Text>
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
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 12, lineHeight: 16 },
  meta: { flexDirection: "row", gap: 6, marginTop: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "600" },
  addBtn: { marginTop: 6, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

export default TaskSuggestionCard;
