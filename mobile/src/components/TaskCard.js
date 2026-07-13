import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { getPriorityColor, getCategoryColor, getCategoryIcon, formatTaskDate } from "../constants/priorities";
import { isOverdue } from "../utils/dateHelpers";
import { mediumImpact } from "../utils/haptics";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = -width * 0.25;
const ACTION_WIDTH = 80;

const useHover = () => {
  const h = useRef(new Animated.Value(0)).current;
  if (Platform.OS !== "web") return { hoverVal: h, hoverProps: {} };
  return {
    hoverVal: h,
    hoverProps: {
      onMouseEnter: () => Animated.spring(h, { toValue: 1, damping: 12, stiffness: 150, useNativeDriver: true }).start(),
      onMouseLeave: () => Animated.spring(h, { toValue: 0, damping: 12, stiffness: 150, useNativeDriver: true }).start(),
    },
  };
};

const DeleteConfirm = ({ task, onConfirm, onCancel, colors }) => {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => { Animated.spring(anim, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[styles.confirmOverlay, { backgroundColor: colors.error + "12", opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
      <Text style={[styles.confirmTitle, { color: colors.error }]}>🗑️ Delete Task?</Text>
      <Text style={[styles.confirmSub, { color: colors.textSecondary }]} numberOfLines={1}>"{task.title}"</Text>
      <View style={styles.confirmRow}>
        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.border + "50" }]} onPress={onCancel}>
          <Text style={[styles.confirmBtnText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.error }]} onPress={() => { mediumImpact(); onConfirm(); }}>
          <Text style={[styles.confirmBtnText, { color: "#fff" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const TaskCard = ({ task, onPress, onComplete, onDelete, index = 0 }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showConfirm, setShowConfirm] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const deleteHover = useRef(new Animated.Value(0)).current;
  const delIconHover = useRef(new Animated.Value(0)).current;
  const { hoverVal, hoverProps } = useHover();
  const onDeleteRef = useRef(onDelete);
  const taskRef = useRef(task);
  onDeleteRef.current = onDelete;
  taskRef.current = task;
  const overdue = isOverdue(task.dueDate) && task.status === "pending";
  const completed = task.status === "completed";
  const priorityColor = getPriorityColor(task.priority);
  const categoryColor = getCategoryColor(task.category);
  const categoryIcon = getCategoryIcon(task.category);

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, damping: 16, stiffness: 160, delay: index * 50, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 16, stiffness: 160, delay: index * 50, useNativeDriver: true }),
    ]).start();
    if (completed) { Animated.spring(checkAnim, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }).start(); }
  }, []);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 10,
    onPanResponderGrant: () => Animated.spring(pressScale, { toValue: 0.97, damping: 15, stiffness: 300, useNativeDriver: true }).start(),
    onPanResponderMove: (_, g) => {
      if (g.dx < 0) translateX.setValue(Math.max(g.dx, -ACTION_WIDTH * 2));
      tiltX.setValue(g.dy * 0.04);
      tiltY.setValue(g.dx * -0.04);
    },
    onPanResponderRelease: (_, g) => {
      Animated.parallel([
        Animated.spring(tiltX, { toValue: 0, damping: 12, stiffness: 120, useNativeDriver: true }),
        Animated.spring(tiltY, { toValue: 0, damping: 12, stiffness: 120, useNativeDriver: true }),
        Animated.spring(pressScale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }),
      ]).start();
      if (g.dx < SWIPE_THRESHOLD) {
        mediumImpact();
        Animated.timing(translateX, { toValue: -width, duration: 200, useNativeDriver: true }).start(() => onDeleteRef.current?.(taskRef.current._id));
      } else {
        Animated.spring(translateX, { toValue: 0, damping: 18, stiffness: 180, useNativeDriver: true }).start();
      }
    },
  })).current;

  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateX }, { perspective: 800 }, { rotateX: tiltX }, { rotateY: tiltY }] }}>
      <View style={[styles.swipeActions, { backgroundColor: deleteHover.interpolate({ inputRange: [0, 1], outputRange: [colors.border + "60", colors.error + "E0"] }) }]}
        onMouseEnter={Platform.OS === "web" ? () => Animated.spring(deleteHover, { toValue: 1, damping: 12, stiffness: 150, useNativeDriver: false }).start() : undefined}
        onMouseLeave={Platform.OS === "web" ? () => Animated.spring(deleteHover, { toValue: 0, damping: 12, stiffness: 150, useNativeDriver: false }).start() : undefined}
      >
        <Text style={styles.actionText}>🗑</Text>
        <Text style={styles.actionLabel}>Delete</Text>
      </View>
      <Animated.View style={{ transform: [{ scale: pressScale }, { scale: hoverVal.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }] }}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onPress?.(task)}
          onLongPress={() => mediumImpact()}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.97, damping: 15, stiffness: 300, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start()}
          {...panResponder.panHandlers}
          {...hoverProps}
          style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder, shadowColor: theme.shadow.md.shadowColor }]}
        >
          <View style={[styles.priorityBarInner, { backgroundColor: priorityColor + "15" }]}>
            <View style={[styles.priorityBarFill, { backgroundColor: priorityColor }]} />
          </View>
          <View style={styles.cardGlow} pointerEvents="none" />
          <TouchableOpacity
            style={[styles.checkbox, { borderColor: completed ? colors.success : colors.textTertiary + "30", backgroundColor: completed ? colors.success : "transparent" }]}
            onPress={() => { mediumImpact(); onComplete?.(task._id); }}
          >
            {completed && <Animated.Text style={[styles.checkmark, { transform: [{ scale: checkScale }] }]}>✓</Animated.Text>}
          </TouchableOpacity>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: colors.text, textDecorationLine: completed ? "line-through" : "none" }]} numberOfLines={1}>
                {task.title}
              </Text>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <TouchableOpacity
                style={[styles.delIcon, { backgroundColor: delIconHover.interpolate({ inputRange: [0, 1], outputRange: ["transparent", colors.error + "18"] }) }]}
                onPress={() => setShowConfirm(true)}
                onMouseEnter={Platform.OS === "web" ? () => Animated.spring(delIconHover, { toValue: 1, damping: 12, stiffness: 150, useNativeDriver: false }).start() : undefined}
                onMouseLeave={Platform.OS === "web" ? () => Animated.spring(delIconHover, { toValue: 0, damping: 12, stiffness: 150, useNativeDriver: false }).start() : undefined}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.delIconText, { color: delIconHover.interpolate({ inputRange: [0, 1], outputRange: [colors.textTertiary, colors.error] }) }]}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {showConfirm && (
              <DeleteConfirm task={task} colors={colors} onConfirm={() => { setShowConfirm(false); onDelete?.(task._id); }} onCancel={() => setShowConfirm(false)} />
            )}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: categoryColor + "15" }]}>
                <Text style={[styles.badgeLabel, { color: categoryColor }]}>{categoryIcon} {task.category}</Text>
              </View>
              {task.dueDate && (
                <View style={[styles.badge, { backgroundColor: overdue ? colors.error + "10" : colors.primary + "08" }]}>
                  <Text style={[styles.badgeLabel, { color: overdue ? colors.error : colors.textTertiary }]}>📅 {formatTaskDate(task.dueDate)}</Text>
                </View>
              )}
              {task.isAIGenerated && (
                <View style={[styles.badge, { backgroundColor: colors.primary + "10" }]}>
                  <Text style={[styles.badgeLabel, { color: colors.primary }]}>✨ TaskPilot</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeActions: { position: "absolute", right: 0, top: 6, bottom: 6, width: ACTION_WIDTH * 2, justifyContent: "center", alignItems: "flex-end" },
  deleteAction: { width: ACTION_WIDTH * 1.5, height: "100%", borderTopLeftRadius: 14, borderBottomLeftRadius: 14, justifyContent: "center", alignItems: "center" },
  actionText: { fontSize: 22 },
  actionLabel: { color: "#fff", fontSize: 10, fontWeight: "600", marginTop: 2 },
  card: {
    flexDirection: "row",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardGlow: { position: "absolute", top: -40, right: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.03)" },
  priorityBarInner: { position: "absolute", top: 8, bottom: 8, left: 2, width: 4, borderRadius: 2 },
  priorityBarFill: { flex: 1, borderRadius: 2, opacity: 0.8 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 1 },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  content: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 4 },
  title: { fontSize: 15, fontWeight: "600", flex: 1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  delIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  delIconText: { fontSize: 13 },
  confirmOverlay: { borderRadius: 12, padding: 12, marginBottom: 8, alignItems: "center" },
  confirmTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  confirmSub: { fontSize: 12, fontWeight: "500", marginBottom: 10, opacity: 0.7 },
  confirmRow: { flexDirection: "row", gap: 8 },
  confirmBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  confirmBtnText: { fontSize: 13, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeLabel: { fontSize: 10, fontWeight: "600" },
});

export default TaskCard;
