import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Animated, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../hooks/useTasks";
import AnimatedProgressRing from "../../components/AnimatedProgressRing";
import PremiumGlassCard from "../../components/PremiumGlassCard";
import GradientText from "../../components/GradientText";
import AnimatedBackground from "../../components/AnimatedBackground";
import LoadingSplash from "../../components/LoadingSplash";

const CompletionBar = ({ total, completed, color1, delay = 0 }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const doneW = useRef(new Animated.Value(0)).current;
  const remainW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(doneW, { toValue: total > 0 ? completed / total : 0, damping: 10, stiffness: 55, delay: delay + 80, useNativeDriver: false }).start();
    Animated.spring(remainW, { toValue: total > 0 ? (total - completed) / total : 0, damping: 10, stiffness: 55, delay, useNativeDriver: false }).start();
  }, [total, completed]);
  const done = doneW.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const remain = remainW.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={[styles.barTrack, { backgroundColor: c.textTertiary + "08" }]}>
      <Animated.View style={{ width: done, height: "100%" }}>
        <LinearGradient colors={[c.success, c.success + "dd"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }} />
      </Animated.View>
      {total - completed > 0 && (
        <Animated.View style={{ width: remain, height: "100%" }}>
          <LinearGradient colors={[color1 + "cc", color1 + "80"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderTopRightRadius: 7, borderBottomRightRadius: 7 }} />
        </Animated.View>
      )}
    </View>
  );
};

const AnimatedNum = ({ value, style, suffix = "", duration = 1000 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: value, duration, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);
  return <Text style={style}>{display}{suffix}</Text>;
};

const StreakIndicator = ({ days }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);
  const op = glow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const s = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });
  return (
    <View style={[styles.streakWrap, { backgroundColor: c.warning + "12", borderColor: c.warning + "25" }]}>
      <Animated.Text style={{ fontSize: 36, opacity: op, transform: [{ scale: s }] }}>🔥</Animated.Text>
      <View style={{ alignItems: "center" }}>
        <Text style={[styles.streakValue, { color: c.warning }]}>{days}</Text>
        <Text style={[styles.streakLabel, { color: c.textTertiary }]}>day streak</Text>
      </View>
    </View>
  );
};

const StatsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { getProgress, tasks, fetchTasks } = useTasks();
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    const unsubscribe = navigation?.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, [progress]);

  const loadData = async () => {
    setLoading(true);
    await fetchTasks();
    const p = await getProgress();
    setProgress(p);
    setLoading(false);
  };

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}><LoadingSplash variant="stats" /></SafeAreaView>;

  const catCounts = {};
  const catDone = {};
  const priCounts = {};
  const priDone = {};
  tasks.forEach((t) => {
    catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    priCounts[t.priority] = (priCounts[t.priority] || 0) + 1;
    if (t.status === "completed") {
      catDone[t.category] = (catDone[t.category] || 0) + 1;
      priDone[t.priority] = (priDone[t.priority] || 0) + 1;
    }
  });

  const categories = [
    { label: "Study", total: catCounts.study || 0, done: catDone.study || 0, color1: "#6C63FF", icon: "📚" },
    { label: "Work", total: catCounts.work || 0, done: catDone.work || 0, color1: "#2ED573", icon: "💼" },
    { label: "Personal", total: catCounts.personal || 0, done: catDone.personal || 0, color1: "#FF6584", icon: "🧘" },
    { label: "Health", total: catCounts.health || 0, done: catDone.health || 0, color1: "#FFA502", icon: "💪" },
    { label: "Other", total: catCounts.other || 0, done: catDone.other || 0, color1: "#636E72", icon: "📌" },
  ];
  const priorities = [
    { label: "High", total: priCounts.high || 0, done: priDone.high || 0, color1: "#FF4757", icon: "🔴" },
    { label: "Medium", total: priCounts.medium || 0, done: priDone.medium || 0, color1: "#FFA502", icon: "🟡" },
    { label: "Low", total: priCounts.low || 0, done: priDone.low || 0, color1: "#2ED573", icon: "🟢" },
  ];
  const score = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const scoreColors = score >= 80 ? [c.success, c.success + "80"] : score >= 50 ? [c.warning, c.warning + "80"] : [c.primary, c.accent];
  const scoreMessage = progress.total === 0 ? "Add tasks to begin" : score >= 80 ? "Exceptional! You're on fire!" : score >= 60 ? "Great momentum, keep going!" : score >= 40 ? "Good progress, stay consistent!" : "Let's get started!";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.4} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <LinearGradient colors={[c.primary + "18", "transparent"]} style={styles.headerGlow} />
            <GradientText style={styles.title}>📊 Statistics</GradientText>
            <Text style={[styles.subtitle, { color: c.textTertiary }]}>Your complete productivity overview</Text>
          </View>

          <View style={styles.ringSection}>
            <AnimatedProgressRing percentage={progress.percentage} size={150} strokeWidth={14} label="Overall" sublabel={`${progress.completed}/${progress.total}`} />
            <StreakIndicator days={7} />
          </View>

          <View style={styles.statsGrid}>
            <PremiumGlassCard compact accentColor={c.success} glowColor={c.success} style={{ flex: 1 }}>
              <View style={styles.statInner}>
                <LinearGradient colors={[c.success + "15", "transparent"]} style={styles.statBg} />
                <Text style={{ fontSize: 24, marginBottom: 4 }}>✅</Text>
                <AnimatedNum value={progress.completed} style={[styles.statValue, { color: c.text }]} />
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Completed</Text>
              </View>
            </PremiumGlassCard>
            <PremiumGlassCard compact accentColor={c.warning} glowColor={c.warning} style={{ flex: 1 }}>
              <View style={styles.statInner}>
                <LinearGradient colors={[c.warning + "15", "transparent"]} style={styles.statBg} />
                <Text style={{ fontSize: 24, marginBottom: 4 }}>⏳</Text>
                <AnimatedNum value={progress.total - progress.completed} style={[styles.statValue, { color: c.text }]} />
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Pending</Text>
              </View>
            </PremiumGlassCard>
            <PremiumGlassCard compact accentColor={c.primary} glowColor={c.primary} style={{ flex: 1 }}>
              <View style={styles.statInner}>
                <LinearGradient colors={[c.primary + "15", "transparent"]} style={styles.statBg} />
                <Text style={{ fontSize: 24, marginBottom: 4 }}>📊</Text>
                <AnimatedNum value={progress.total} style={[styles.statValue, { color: c.text }]} />
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Total</Text>
              </View>
            </PremiumGlassCard>
          </View>

          <PremiumGlassCard accentColor={c.primary} glowColor={c.primary} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>📂 By Category</Text>
            {categories.map((cat, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barIcon}>{cat.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={[styles.barLabel, { color: c.text }]}>{cat.label}</Text>
                    <Text style={[styles.barValueSm, { color: cat.done > 0 ? c.success : c.textTertiary }]}>{cat.done}/{cat.total}</Text>
                  </View>
                  <CompletionBar total={cat.total} completed={cat.done} color1={cat.color1} delay={i * 80} />
                </View>
              </View>
            ))}
          </PremiumGlassCard>

          <PremiumGlassCard accentColor={c.accent} glowColor={c.accent} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>🚦 By Priority</Text>
            {priorities.map((pri, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barIcon}>{pri.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={[styles.barLabel, { color: c.text }]}>{pri.label}</Text>
                    <Text style={[styles.barValueSm, { color: pri.done > 0 ? c.success : c.textTertiary }]}>{pri.done}/{pri.total}</Text>
                  </View>
                  <CompletionBar total={pri.total} completed={pri.done} color1={pri.color1} delay={i * 80} />
                </View>
              </View>
            ))}
          </PremiumGlassCard>

          <View style={styles.scoreSection}>
            <PremiumGlassCard accentColor={scoreColors[0]} glowColor={scoreColors[0]} style={{ marginHorizontal: 16 }}>
              <Text style={[styles.cardTitle, { color: c.text }]}>🏆 Productivity Score</Text>
              <View style={styles.scoreInner}>
                <AnimatedNum value={score} style={[styles.scoreValue, { color: c.primary }]} suffix="%" duration={1500} />
                <View style={[styles.scoreBar, { backgroundColor: c.textTertiary + "12" }]}>
                  <Animated.View style={{ width: slideAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", score + "%"] }) }}>
                    <LinearGradient colors={scoreColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scoreBarFill} />
                  </Animated.View>
                </View>
                <Text style={[styles.scoreMsg, { color: c.textSecondary }]}>{scoreMessage}</Text>
              </View>
            </PremiumGlassCard>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, position: "relative", marginBottom: 4 },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 120, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 30, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4, fontWeight: "500" },
  ringSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, marginVertical: 16, paddingHorizontal: 16 },
  streakWrap: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 18, borderWidth: 1 },
  streakValue: { fontSize: 30, fontWeight: "800" },
  streakLabel: { fontSize: 12, fontWeight: "500" },
  statsGrid: { flexDirection: "row", marginHorizontal: 16, gap: 8, marginBottom: 16 },
  statInner: { alignItems: "center", padding: 4, gap: 2, position: "relative" },
  statBg: { position: "absolute", top: 0, left: 0, right: 0, height: 60, borderRadius: 12 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  barIcon: { fontSize: 16, width: 24 },
  barLabel: { fontSize: 13, fontWeight: "600" },
  barValueSm: { fontSize: 12, fontWeight: "700" },
  barTrack: { flex: 1, flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden" },
  scoreSection: { marginBottom: 32, marginTop: 8 },
  scoreInner: { alignItems: "center", paddingVertical: 8 },
  scoreValue: { fontSize: 56, fontWeight: "800" },
  scoreBar: { height: 12, borderRadius: 6, overflow: "hidden", marginTop: 12, width: "100%" },
  scoreBarFill: { height: "100%", borderRadius: 6 },
  scoreMsg: { fontSize: 14, fontWeight: "500", marginTop: 8, textAlign: "center" },
});

export default StatsScreen;
