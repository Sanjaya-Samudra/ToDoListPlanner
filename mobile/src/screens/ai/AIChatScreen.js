import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import ChatBubble from "../../components/ChatBubble";
import TaskSuggestionCard from "../../components/TaskSuggestionCard";
import GlassCard from "../../components/GlassCard";
import SuggestionChip from "../../components/SuggestionChip";
import AnimatedButton from "../../components/AnimatedButton";
import BottomSheet from "../../components/BottomSheet";
import CategoryPicker from "../../components/CategoryPicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useTasks } from "../../hooks/useTasks";
import { PRIORITIES } from "../../constants/config";
import { mediumImpact } from "../../utils/haptics";

const toLocalISOString = (date) => {
  if (!date) return "";
  const tzoffset = date.getTimezoneOffset() * 60000;
  return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
};

const QUICK_ACTIONS = [
  { icon: "📝", label: "Generate Tasks", action: "generate" },
  { icon: "💡", label: "Productivity Tips", action: "tips" },
  { icon: "📅", label: "Plan My Day", action: "plan" },
  { icon: "🎯", label: "Prioritize", action: "prioritize" },
];

const parseTasks = (text) => {
  const tasks = [];
  const regex = /\[TASK:\s*(.*?)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split("|").map((s) => s.trim());
    if (parts[0]) {
      tasks.push({
        title: parts[0],
        description: parts[1] || "",
        category: parts[2] || "other",
        priority: parts[3] || "medium",
      });
    }
  }
  return tasks;
};

const stripTaskMarkers = (text) => text.replace(/\[TASK:[^\]]*\]/g, "").replace(/\n{2,}/g, "\n").trim();

const AnimatedMessage = ({ item, index, onPressAdd, addedTaskIds }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, damping: 20, stiffness: 150, delay: index === 0 ? 0 : 50, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ]}}>
      <ChatBubble message={item.displayText || item.text} isUser={item.isUser} timestamp={item.timestamp} />
      {!item.isUser && item.suggestedTasks?.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: -4 }}>
          {item.suggestedTasks.map((task, ti) => (
            <TaskSuggestionCard
              key={task.id || ti}
              {...task}
              onPressAdd={() => onPressAdd(task)}
              isAdded={addedTaskIds.includes(task.id || `${task.title}-${task.description}`)}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const AIChatScreen = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { showToast } = useToast();
  const { createTask } = useTasks();
  const [messages, setMessages] = useState([
    { id: "0", text: "Hi! I'm your AI assistant. I can help organize your tasks, suggest to-dos, and more. Try asking me to generate tasks for you!", isUser: false, timestamp: new Date(), suggestedTasks: [], displayText: "Hi! I'm your AI assistant. I can help organize your tasks, suggest to-dos, and more. Try asking me to generate tasks for you!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const typingDots = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const recognitionRef = useRef(null);

  // Suggested Task Editing Flow
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [addedTaskIds, setAddedTaskIds] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("other");
  const [formPriority, setFormPriority] = useState("medium");
  const [formDueDate, setFormDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(typingDots, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      Animated.timing(typingDots, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isRecording]);

  const handlePressAdd = (task) => {
    setSelectedTask(task);
    setFormTitle(task.title || "");
    setFormDescription(task.description || "");
    setFormCategory(task.category || "other");
    setFormPriority(task.priority || "medium");
    setFormDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setIsSheetVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormDueDate(selectedDate);
    }
  };

  const handleConfirmAdd = async () => {
    if (!formTitle.trim()) {
      showToast("Title is required", "error");
      return;
    }
    setSavingTask(true);
    try {
      await createTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate ? formDueDate.toISOString() : null,
      });

      if (selectedTask) {
        const taskId = selectedTask.id || `${selectedTask.title}-${selectedTask.description}`;
        setAddedTaskIds((prev) => [...prev, taskId]);
      }

      showToast("Task added!", "success");
      setIsSheetVisible(false);
    } catch {
      showToast("Failed to add task", "error");
    } finally {
      setSavingTask(false);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    mediumImpact();
    const userMsg = { id: Date.now().toString(), text: msg.trim(), isUser: true, timestamp: new Date(), suggestedTasks: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { message: msg.trim() });
      const reply = res.data?.reply || res.data?.message || "I'm not sure how to respond to that.";
      const apiTasks = res.data?.tasks || [];
      const inlineTasks = parseTasks(reply);
      const allTasks = apiTasks.length > 0 ? apiTasks : inlineTasks;
      const cleanText = inlineTasks.length > 0 ? stripTaskMarkers(reply) : reply;
      const tasksWithIds = allTasks.map((t, idx) => ({
        ...t,
        id: t.id || `${Date.now()}-${idx}`
      }));
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: reply,
        displayText: cleanText,
        isUser: false,
        timestamp: new Date(),
        suggestedTasks: tasksWithIds,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting. Please try again.", isUser: false, timestamp: new Date(), suggestedTasks: [], displayText: "I'm having trouble connecting. Please try again." }]);
      showToast("Network error", "error");
    } finally { setLoading(false); }
  };

  const handleQuickAction = (action) => {
    const prompts = {
      generate: "I need help organizing my tasks. Here's what I have on my plate...",
      tips: "Give me 3 productivity tips to stay focused and manage my time better.",
      plan: "Help me plan my day effectively. What should I prioritize?",
      prioritize: "How should I prioritize my tasks? What's the best approach?",
    };
    setInput(prompts[action] || prompts.generate);
    inputRef.current?.focus();
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input not available in this browser", "info");
      return;
    }
    setIsRecording(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
      setInput((prev) => prev + transcript);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      showToast("Voice input failed", "error");
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (input.trim()) sendMessage();
    };
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleMicPress = () => {
    mediumImpact();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const renderTypingIndicator = () => (
    <Animated.View style={[styles.typingContainer, { opacity: typingDots }]}>
      <View style={[styles.typingBubble, { backgroundColor: c.glass, borderColor: c.glassBorder }]}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[styles.typingDot, { backgroundColor: c.primary, opacity: typingDots.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }]} />
        ))}
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <LinearGradient colors={[c.primary + "10", "transparent"]} style={{ position: "absolute", width: "100%", height: 120, top: 0 }} />
      {messages.length === 1 && (
        <View style={styles.welcomeSection}>
          <GlassCard style={{ padding: 20 }}>
            <Text style={[styles.welcomeTitle, { color: c.text }]}>What can I help you with?</Text>
            <View style={styles.quickActions}>
              {QUICK_ACTIONS.map((qa) => (
                <TouchableOpacity key={qa.action} style={[styles.quickBtn, { backgroundColor: c.inputBg, borderColor: c.border }]} onPress={() => handleQuickAction(qa.action)}>
                  <Text style={styles.quickIcon}>{qa.icon}</Text>
                  <Text style={[styles.quickLabel, { color: c.text }]}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
          <View style={styles.suggestions}>
            <Text style={[styles.suggestionLabel, { color: c.textSecondary }]}>Try typing:</Text>
            <View style={styles.chipsRow}>
              {["I have an AI assignment due tomorrow", "Help me study for my exam", "I'm feeling overwhelmed with work"].map((s, i) => (
                <SuggestionChip key={i} label={s} onPress={() => sendMessage(s)} />
              ))}
            </View>
          </View>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <AnimatedMessage item={item} index={index} onPressAdd={handlePressAdd} addedTaskIds={addedTaskIds} />}
        ListFooterComponent={loading ? renderTypingIndicator : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
      <Animated.View style={[styles.inputBar, { backgroundColor: c.glass, borderTopColor: inputFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [c.glassBorder, c.primary + "40"] }) }]}>
        <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <Animated.View style={[styles.inputGlow, { backgroundColor: c.primary, opacity: inputFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }) }]} />
          <View style={[styles.input, { color: c.text, backgroundColor: c.inputBg, borderColor: inputFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [c.border, c.primary + "50"] }) }]}>
            <TextInput ref={inputRef} style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: "500", padding: 0, margin: 0, outline: "none", outlineStyle: "none", maxHeight: 80 }} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor={c.textTertiary} multiline maxLength={2000} onFocus={() => { setInputFocused(true); Animated.spring(inputFocusAnim, { toValue: 1, damping: 15, stiffness: 120, useNativeDriver: false }).start(); }} onBlur={() => { setInputFocused(false); Animated.spring(inputFocusAnim, { toValue: 0, damping: 15, stiffness: 120, useNativeDriver: false }).start(); }} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.micBtn, { backgroundColor: isRecording ? c.error : c.textTertiary + "20" }]}
          onPress={handleMicPress}
        >
          {isRecording && (
            <Animated.View style={[styles.micPulse, { backgroundColor: c.error, opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }), transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }] }]} />
          )}
          <Text style={[styles.micIcon, { color: isRecording ? "#fff" : c.textTertiary }]}>🎤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: input.trim() && !loading ? c.primary : c.textTertiary + "30" }]} onPress={() => sendMessage()} disabled={!input.trim() || loading}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </Animated.View>

      <BottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        title="Confirm Suggested Task"
        snapPoint={Platform.OS === 'web' ? 620 : 540}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Title</Text>
          <TextInput
            style={[styles.formInput, { color: c.text, backgroundColor: c.inputBg, borderColor: c.border }]}
            value={formTitle}
            onChangeText={setFormTitle}
            placeholder="Task Title"
            placeholderTextColor={c.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.formInput, styles.formInputMultiline, { color: c.text, backgroundColor: c.inputBg, borderColor: c.border }]}
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Description (optional)"
            placeholderTextColor={c.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Category</Text>
          <CategoryPicker
            selected={formCategory}
            onSelect={(cat) => setFormCategory(cat || "other")}
            showAll={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((pri) => {
              const active = formPriority === pri.value;
              return (
                <TouchableOpacity
                  key={pri.value}
                  style={[
                    styles.priorityBtn,
                    {
                      backgroundColor: active ? pri.color : c.inputBg,
                      borderColor: active ? pri.color : c.border,
                    },
                  ]}
                  onPress={() => setFormPriority(pri.value)}
                >
                  <Text style={styles.priorityIcon}>{pri.icon}</Text>
                  <Text style={[styles.priorityLabel, { color: active ? "#fff" : c.text }]}>
                    {pri.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.textSecondary }]}>Due Date & Time</Text>
          {Platform.OS === "web" ? (
            <input
              type="datetime-local"
              value={toLocalISOString(formDueDate)}
              onChange={(e) => setFormDueDate(e.target.value ? new Date(e.target.value) : new Date())}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.inputBg,
                color: c.text,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
              }}
            />
          ) : (
            <View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[styles.dateBtn, { flex: 1, backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: c.text, fontSize: 14, fontWeight: "500" }}>
                    📅 {formDueDate ? formDueDate.toLocaleDateString() : "Select Date"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateBtn, { flex: 1, backgroundColor: c.inputBg, borderColor: c.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ color: c.text, fontSize: 14, fontWeight: "500" }}>
                    ⏰ {formDueDate ? formDueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Select Time"}
                  </Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={formDueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(formDueDate || new Date());
                      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                      setFormDueDate(newDate);
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={formDueDate || new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      const newDate = new Date(formDueDate || new Date());
                      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                      setFormDueDate(newDate);
                    }
                  }}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: c.border }]}
            onPress={() => setIsSheetVisible(false)}
            disabled={savingTask}
          >
            <Text style={[styles.cancelBtnText, { color: c.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: c.primary }]}
            onPress={handleConfirmAdd}
            disabled={savingTask}
          >
            <Text style={styles.confirmBtnText}>{savingTask ? "Adding..." : "Confirm & Add"}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeSection: { padding: 16, paddingBottom: 0 },
  welcomeTitle: { fontSize: 17, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  quickActions: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1 },
  quickIcon: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  suggestions: { marginTop: 16 },
  suggestionLabel: { fontSize: 13, marginBottom: 8, fontWeight: "500" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  messageList: { paddingVertical: 16, flexGrow: 1 },
  typingContainer: { paddingHorizontal: 16, marginVertical: 4 },
  typingBubble: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start", gap: 5 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, borderTopWidth: 1 },
  inputGlow: { position: "absolute", top: 0, left: 4, right: 4, bottom: 0, borderRadius: 16, filter: "blur(10px)" },
  input: { flex: 1, flexDirection: "row", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, alignItems: "center" },
  micBtn: { marginLeft: 8, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", position: "relative" },
  micPulse: { position: "absolute", width: 44, height: 44, borderRadius: 22 },
  micIcon: { fontSize: 18 },
  sendBtn: { marginLeft: 8, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sendIcon: { color: "#fff", fontSize: 18 },
  formGroup: { marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  formInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontWeight: "500" },
  formInputMultiline: { height: 60, textAlignVertical: "top" },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  priorityIcon: { fontSize: 14 },
  priorityLabel: { fontSize: 13, fontWeight: "600" },
  dateBtn: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  actionButtons: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

export default AIChatScreen;
