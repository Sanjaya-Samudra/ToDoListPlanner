import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, Keyboard, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../hooks/useTasks";
import TaskCard from "../../components/TaskCard";
import EmptyState from "../../components/EmptyState";
import PremiumSearchBar from "../../components/PremiumSearchBar";
import FloatingActionButton from "../../components/FloatingActionButton";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useToast } from "../../context/ToastContext";
import { mediumImpact } from "../../utils/haptics";

const FILTERS = [
  { key: "all", label: "All", icon: "📋" },
  { key: "pending", label: "Active", icon: "⏳" },
  { key: "completed", label: "Done", icon: "✅" },
];
const SORTS = [
  { key: "createdAt", label: "Recent" },
  { key: "dueDate", label: "Due Date" },
  { key: "priority", label: "Priority" },
  { key: "title", label: "Alphabetical" },
];

const TaskListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { tasks, fetchTasks, toggleTask, deleteTask, createTask } = useTasks();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [quickAdd, setQuickAdd] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [sortRendered, setSortRendered] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const sortAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => { fetchTasks(); });
    return unsub;
  }, [navigation, fetchTasks]);

  useEffect(() => {
    if (showSort) setSortRendered(true);
    Animated.spring(sortAnim, { toValue: showSort ? 1 : 0, damping: 14, stiffness: 120, useNativeDriver: true }).start(() => {
      if (!showSort) setSortRendered(false);
    });
  }, [showSort]);

  const filtered = tasks
    .filter((t) => filter === "all" || t.status === filter)
    .sort((a, b) => {
      if (sort === "dueDate") return (a.dueDate || "") < (b.dueDate || "") ? -1 : 1;
      if (sort === "priority") return (["high", "medium", "low"].indexOf(a.priority) || 0) - (["high", "medium", "low"].indexOf(b.priority) || 0);
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleQuickAdd = async () => {
    if (!quickAdd.trim()) return;
    Keyboard.dismiss();
    mediumImpact();
    try {
      await createTask?.({ title: quickAdd.trim() });
      setQuickAdd("");
      showToast("Task added!", "success");
    } catch { showToast("Failed to add", "error"); }
  };

  const handleToggle = useCallback(async (id) => {
    try {
      await toggleTask(id);
      const t = tasks.find((x) => x._id === id);
      if (t && !t.completed) showToast("Task completed! 🎉", "success", { undoAction: () => toggleTask(id) });
    } catch { showToast("Failed to update", "error"); }
  }, [tasks, toggleTask, showToast]);

  const handleDelete = useCallback(async (id) => {
    try { await deleteTask(id); showToast("Task deleted", "info", { undoAction: () => {} }); }
    catch { showToast("Failed to delete", "error"); }
  }, [deleteTask, showToast]);

  const renderItem = useCallback(({ item, index }) => (
    <TaskCard task={item} index={index} onPress={(t) => navigation.navigate("TaskDetail", { task: t })} onComplete={handleToggle} onDelete={handleDelete} />
  ), [navigation, handleToggle, handleDelete]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.5} />
      <Animated.View style={[styles.header, { transform: [{ scale: headerAnim }] }]}>
        <LinearGradient colors={[c.primary + "12", "transparent"]} style={styles.headerBg} />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: c.text }]}>📋 Tasks</Text>
            <Text style={[styles.headerSub, { color: c.textTertiary }]}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => navigation.navigate("Search")}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => navigation.navigate("CreateEditTask")}>
            <Text style={{ fontSize: 18 }}>➕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
        <PremiumSearchBar value={quickAdd} onChangeText={setQuickAdd} onSubmit={handleQuickAdd} placeholder="Quick add a task..." icon="➕" />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} style={[styles.filterBtn, { backgroundColor: filter === f.key ? c.primary : c.glass, borderColor: filter === f.key ? c.primary : c.glassBorder }]} onPress={() => { setFilter(f.key); mediumImpact(); }}>
            <Text style={{ fontSize: 14 }}>{f.icon}</Text>
            <Text style={[styles.filterLabel, { color: filter === f.key ? "#fff" : c.text }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.sortBtn, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => setShowSort(!showSort)}>
          <Text style={{ fontSize: 14 }}>📊</Text>
        </TouchableOpacity>
      </View>

      {sortRendered && (
        <Animated.View style={[styles.sortPanel, { backgroundColor: c.glass, borderColor: c.glassBorder, opacity: sortAnim, transform: [{ translateY: sortAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
          {SORTS.map((s) => (
            <TouchableOpacity key={s.key} style={[styles.sortOption, { backgroundColor: sort === s.key ? c.primary + "15" : "transparent" }]} onPress={() => { setSort(s.key); setShowSort(false); mediumImpact(); }}>
              <Text style={[styles.sortLabel, { color: sort === s.key ? c.primary : c.text, fontWeight: sort === s.key ? "700" : "500" }]}>{s.label}</Text>
              {sort === s.key && <Text style={{ color: c.primary, fontSize: 12 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={<EmptyState variant="tasks" />}
        showsVerticalScrollIndicator={false}
      />
      <FloatingActionButton icon="+" onPress={() => navigation.navigate("CreateEditTask")} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8, paddingTop: 12, position: "relative" },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 100, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSub: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  quickAddRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, borderRadius: 16, borderWidth: 1, paddingLeft: 16, paddingRight: 6, paddingVertical: 4, alignItems: "center" },
  quickInput: { flex: 1, fontSize: 14, fontWeight: "500", paddingVertical: 8, height: 40 },
  quickAddBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  filterRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, gap: 6 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  filterLabel: { fontSize: 12, fontWeight: "600" },
  sortBtn: { width: 36, height: 36, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center", marginLeft: "auto" },
  sortPanel: { position: "absolute", top: 165, right: 16, zIndex: 10, borderRadius: 14, borderWidth: 1, padding: 6, minWidth: 140, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  sortOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  sortLabel: { fontSize: 13 },
  listContent: { paddingTop: 4, paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: "center" },
});

export default TaskListScreen;
