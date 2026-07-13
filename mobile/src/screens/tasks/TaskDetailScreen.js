import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, StyleSheet, Alert, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../hooks/useTasks";
import GlassCard from "../../components/GlassCard";
import AnimatedBackground from "../../components/AnimatedBackground";
import ConfettiOverlay from "../../components/ConfettiOverlay";
import LoadingSplash from "../../components/LoadingSplash";
import { useToast } from "../../context/ToastContext";
import { mediumImpact, successNotification } from "../../utils/haptics";
import { getPriorityColor, getCategoryColor } from "../../constants/priorities";

const SubtaskItem = ({ subtask, index, onToggle }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(anim, { toValue: 1, damping: 18, stiffness: 150, delay: index * 60, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <TouchableOpacity style={[styles.subtaskItem, { borderBottomColor: c.borderLight }]} onPress={() => onToggle(subtask._id)}>
        <View style={[styles.subCheck, { borderColor: subtask.completed ? c.success : c.textTertiary + "30", backgroundColor: subtask.completed ? c.success : "transparent" }]}>
          {subtask.completed && <Text style={styles.subCheckmark}>✓</Text>}
        </View>
        <Text style={[styles.subtaskText, { color: c.text, textDecorationLine: subtask.completed ? "line-through" : "none" }]}>{subtask.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TaskDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { toggleTask, updateTask, deleteTask } = useTasks();
  const { showToast } = useToast();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = route.params?.task;
    if (t) {
      setTask(t);
      setSubtasks(t.subtasks || []);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [route.params?.task]);

  const handleToggleTask = async () => {
    if (!task) return;
    try {
      await toggleTask(task._id);
      if (!task.completed) {
        setShowConfetti(true);
        successNotification();
        setTimeout(() => setShowConfetti(false), 2500);
        showToast("Task completed! 🎉", "success");
      }
      mediumImpact();
    } catch { showToast("Failed to update", "error"); }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;
    const newSub = { _id: Date.now().toString(), title: newSubtask.trim(), completed: false };
    setSubtasks((prev) => [...prev, newSub]);
    setNewSubtask("");
    mediumImpact();
  };

  const handleToggleSubtask = (id) => {
    setSubtasks((prev) => prev.map((s) => s._id === id ? { ...s, completed: !s.completed } : s));
    mediumImpact();
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteTask(task._id); showToast("Task deleted", "info"); navigation.goBack(); }
        catch { showToast("Failed to delete", "error"); }
      }},
    ]);
  };

  if (!task) return <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}><LoadingSplash variant="generic" /></SafeAreaView>;

  const priorityColor = getPriorityColor(task.priority);
  const categoryColor = getCategoryColor(task.category);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.6} />
      {showConfetti && <ConfettiOverlay />}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={[priorityColor + "20", "transparent"]} style={styles.hero}>
            <View style={styles.heroContent}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "25" }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>{task.priority.toUpperCase()}</Text>
              </View>
              <Text style={[styles.heroTitle, { color: c.text }]}>{task.title}</Text>
              {task.description ? <Text style={[styles.heroDesc, { color: c.textTertiary }]}>{task.description}</Text> : null}
            </View>
          </LinearGradient>

          <GlassCard accentColor={priorityColor} style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoIcon, { color: categoryColor }]}>📂</Text>
                <Text style={[styles.infoLabel, { color: c.textTertiary }]}>Category</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{task.category}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoIcon, { color: priorityColor }]}>🚦</Text>
                <Text style={[styles.infoLabel, { color: c.textTertiary }]}>Priority</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{task.priority}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoIcon, { color: c.primary }]}>📅</Text>
                <Text style={[styles.infoLabel, { color: c.textTertiary }]}>Due</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoIcon, { color: task.completed ? c.success : c.warning }]}>📊</Text>
                <Text style={[styles.infoLabel, { color: c.textTertiary }]}>Status</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{task.completed ? "Completed" : "Active"}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard accentColor={c.primary} style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>✅ Subtasks</Text>
            {subtasks.length === 0 && <Text style={[styles.emptySubtasks, { color: c.textTertiary }]}>No subtasks yet</Text>}
            {subtasks.map((s, i) => (
              <SubtaskItem key={s._id} subtask={s} index={i} onToggle={handleToggleSubtask} />
            ))}
            <View style={styles.addSubtaskRow}>
              <TextInput style={[styles.subtaskInput, { color: c.text, backgroundColor: c.inputBg }]} placeholder="Add subtask..." placeholderTextColor={c.textTertiary} value={newSubtask} onChangeText={setNewSubtask} onSubmitEditing={handleAddSubtask} />
              <TouchableOpacity style={[styles.addSubBtn, { backgroundColor: newSubtask.trim() ? c.primary : c.textTertiary + "20" }]} onPress={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>+</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {task.isAIGenerated && (
            <GlassCard accentColor={c.secondary} style={{ marginHorizontal: 16, marginBottom: 12 }}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>🤖 TaskPilot</Text>
              <Text style={[styles.aiNote, { color: c.textTertiary }]}>Suggested by TaskPilot. {task.aiContext || ""}</Text>
            </GlassCard>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: task.completed ? c.warning : c.success + "15", borderColor: task.completed ? c.warning : c.success + "30" }]} onPress={handleToggleTask}>
              <Text style={{ fontSize: 18 }}>{task.completed ? "↩️" : "✅"}</Text>
              <Text style={[styles.actionLabel, { color: task.completed ? c.warning : c.success }]}>{task.completed ? "Reopen" : "Complete"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.primary + "10", borderColor: c.primary + "20" }]} onPress={() => navigation.navigate("CreateEditTask", { task })}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
              <Text style={[styles.actionLabel, { color: c.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.error + "10", borderColor: c.error + "20" }]} onPress={handleDelete}>
              <Text style={{ fontSize: 18 }}>🗑️</Text>
              <Text style={[styles.actionLabel, { color: c.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {},
  hero: { padding: 20, paddingTop: 16, paddingBottom: 28, marginBottom: 8, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroContent: { gap: 8 },
  priorityBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  priorityText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: "800", lineHeight: 32 },
  heroDesc: { fontSize: 14, fontWeight: "500", lineHeight: 20, marginTop: 2 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoItem: { width: "46%", gap: 2 },
  infoIcon: { fontSize: 18 },
  infoLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  infoValue: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  emptySubtasks: { fontSize: 13, textAlign: "center", paddingVertical: 12 },
  subtaskItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  subCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  subCheckmark: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  subtaskText: { flex: 1, fontSize: 14, fontWeight: "500" },
  addSubtaskRow: { flexDirection: "row", marginTop: 10, gap: 8, alignItems: "center" },
  subtaskInput: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  addSubBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  aiNote: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  actionRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 8, marginBottom: 16, gap: 10 },
  actionBtn: { flex: 1, alignItems: "center", padding: 12, borderRadius: 16, borderWidth: 1, gap: 4 },
  actionLabel: { fontSize: 11, fontWeight: "700" },
});

export default TaskDetailScreen;
