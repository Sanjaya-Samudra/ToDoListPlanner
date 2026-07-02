import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../hooks/useTasks";
import AnimatedInput from "../../components/AnimatedInput";
import AnimatedButton from "../../components/AnimatedButton";
import GlassCard from "../../components/GlassCard";
import { CATEGORIES, PRIORITIES } from "../../constants/config";
import { useToast } from "../../context/ToastContext";
import { mediumImpact, successNotification } from "../../utils/haptics";

const CreateEditTaskScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const existingTask = route.params?.task;
  const isEdit = !!existingTask;
  const { createTask, updateTask } = useTasks();
  const { showToast } = useToast();

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [category, setCategory] = useState(existingTask?.category || "other");
  const [priority, setPriority] = useState(existingTask?.priority || "medium");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Task title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { title: title.trim(), description: description.trim(), category, priority };
      if (isEdit) { await updateTask(existingTask._id, data); showToast("Task updated!", "success"); }
      else { await createTask(data); showToast("Task created!", "success"); successNotification(); }
      mediumImpact();
      navigation.goBack();
    } catch { showToast("Failed to save", "error"); } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <LinearGradient colors={[c.accent + "10", "transparent"]} style={{ position: "absolute", width: "100%", height: 140, top: 0 }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, padding: 16, paddingTop: 8 }}>
          <GlassCard style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{isEdit ? "Edit Task" : "New Task"}</Text>
            <AnimatedInput label="Task Title" value={title} onChangeText={setTitle} icon="📝" error={errors.title} />
            <AnimatedInput label="Description (optional)" value={description} onChangeText={setDescription} icon="📄" multiline />
          </GlassCard>

          <GlassCard style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.value} style={[styles.optionBtn, { backgroundColor: category === cat.value ? c.primary : c.inputBg, borderColor: category === cat.value ? c.primary : c.border }]} onPress={() => { setCategory(cat.value); mediumImpact(); }}>
                  <Text style={styles.optionIcon}>{cat.icon}</Text>
                  <Text style={[styles.optionLabel, { color: category === cat.value ? "#fff" : c.text }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={{ marginBottom: 24 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Priority</Text>
            <View style={styles.optionsGrid}>
              {PRIORITIES.map((pri) => (
                <TouchableOpacity key={pri.value} style={[styles.optionBtn, { backgroundColor: priority === pri.value ? c.primary : c.inputBg, borderColor: priority === pri.value ? c.primary : c.border }]} onPress={() => { setPriority(pri.value); mediumImpact(); }}>
                  <Text style={styles.optionIcon}>{pri.icon}</Text>
                  <Text style={[styles.optionLabel, { color: priority === pri.value ? "#fff" : c.text }]}>{pri.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <AnimatedButton title={saving ? "Saving..." : isEdit ? "Update Task" : "Create Task"} onPress={handleSave} loading={saving} fullWidth size="lg" />
          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  optionIcon: { fontSize: 16 },
  optionLabel: { fontSize: 13, fontWeight: "600" },
});

export default CreateEditTaskScreen;
