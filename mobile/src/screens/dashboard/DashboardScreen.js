import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../hooks/useTasks";
import AnimatedProgressRing from "../../components/AnimatedProgressRing";
import PremiumGlassCard from "../../components/PremiumGlassCard";
import AnimatedBackground from "../../components/AnimatedBackground";
import GradientText from "../../components/GradientText";
import AnimatedNumber from "../../components/AnimatedNumber";
import LoadingSplash from "../../components/LoadingSplash";

const AnimatedStatCard = ({ icon, value, label, color, delay = 0, onPress }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const anim = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, damping: 10, stiffness: 90, delay, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.delay(delay + 2000),
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0.5, duration: 150, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);

  const iconRotate = wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-10deg", "0deg", "10deg"] });

  const content = (
    <PremiumGlassCard compact accentColor={color} glowColor={color} style={{ flex: 1 }}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Animated.View style={{ transform: [{ rotate: iconRotate }, { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
          <View style={[styles.statIconWrap, { backgroundColor: (color || c.primary) + "18" }]}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>
        </Animated.View>
        <AnimatedNumber value={value} style={[styles.statValue, { color: c.text }]} />
        <Text style={[styles.statLabel, { color: c.textTertiary }]}>{label}</Text>
      </View>
    </PremiumGlassCard>
  );

  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity> : content;
};

const TaskProgressBar = ({ completed, total, color }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const anim = useRef(new Animated.Value(0)).current;
  const pct = total > 0 ? completed / total : 0;
  useEffect(() => { Animated.spring(anim, { toValue: pct, damping: 12, stiffness: 70, useNativeDriver: false }).start(); }, [pct]);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: c.textSecondary }}>Progress</Text>
        <Text style={{ fontSize: 12, fontWeight: "700", color }}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: c.borderLight }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>
      <Text style={{ fontSize: 11, color: c.textTertiary }}>{completed} of {total} tasks done</Text>
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useAuth();
  const { getProgress, tasks, fetchTasks, getUpcomingDeadlines } = useTasks();
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, [progress]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      const p = await getProgress();
      if (p) setProgress(p);
      if (data) {
        setRecentTasks(data.slice(0, 3));
        const now = new Date();
        const deadline = new Date(now.getTime() + 7 * 86400000);
        const upcomingTasks = data
          .filter((t) => t.dueDate && t.status === "pending" && new Date(t.dueDate) <= deadline)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setUpcoming(upcomingTasks);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleCardPress = useCallback((task) => {
    navigation.navigate("TaskDetail", { task });
  }, [navigation]);

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}><LoadingSplash variant="dashboard" /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.7} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Animated.View style={{ transform: [{ translateY: headerSlide.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
            <View style={styles.headerWrap}>
              <LinearGradient colors={[c.primary + "25", "transparent"]} style={styles.headerBg} />
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={[styles.greetingBadge, { backgroundColor: c.primary + "25" }]}>
                    <Text style={[styles.greetingText, { color: c.primary }]}>{greeting}</Text>
                  </View>
                  <GradientText style={styles.headerTitle}>Welcome back, {user?.name?.split(" ")[0] || "User"}</GradientText>
                  <Text style={[styles.headerSub, { color: c.textTertiary }]}>Let's make today productive ✨</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => navigation.navigate("Profile", { screen: "Notifications" })}>
                    <Text style={{ fontSize: 18 }}>🔔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.avatarBtn, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => navigation.navigate("Profile")}>
                    <LinearGradient colors={[c.primary, c.accent]} style={styles.avatarSmall}>
                      <Text style={styles.avatarSmallText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.ringSection}>
            <AnimatedProgressRing percentage={progress.percentage} size={130} strokeWidth={10} label="Progress" sublabel={`${progress.completed}/${progress.total}`} />
            <View style={styles.ringMeta}>
              <TaskProgressBar completed={progress.completed} total={progress.total} color={c.primary} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <AnimatedStatCard icon="✅" value={progress.completed} label="Completed" color={c.success} delay={80} />
            <AnimatedStatCard icon="⏳" value={progress.total - progress.completed} label="Pending" color={c.warning} delay={160} />
            <AnimatedStatCard icon="📊" value={progress.total} label="Total Tasks" color={c.primary} delay={240} />
          </View>

          {upcoming.length > 0 && (
            <PremiumGlassCard accentColor={c.warning} glowColor={c.warning} style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>⏰ Upcoming Deadlines</Text>
              {upcoming.slice(0, 3).map((t, i) => (
                <TouchableOpacity key={t._id || i} style={[styles.upcomingItem, { borderBottomColor: c.borderLight }]} onPress={() => handleCardPress(t)}>
                  <View style={[styles.upcomingDot, { backgroundColor: c.warning }]} />
                  <Text style={[styles.upcomingText, { color: c.text }]} numberOfLines={1}>{t.title}</Text>
                  <Text style={[styles.upcomingDate, { color: c.warning }]}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Soon"}
                  </Text>
                </TouchableOpacity>
              ))}
            </PremiumGlassCard>
          )}

          <PremiumGlassCard accentColor={c.primary} glowColor={c.primary} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>📋 Recent Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate("TasksTab")}>
                <GradientText style={{ fontSize: 13, fontWeight: "600" }}>See All</GradientText>
              </TouchableOpacity>
            </View>
            {recentTasks.map((t, i) => (
              <TouchableOpacity key={t._id} style={[styles.recentItem, { borderBottomColor: c.borderLight }]} onPress={() => handleCardPress(t)}>
                <View style={[styles.recentDot, { backgroundColor: t.completed ? c.success : c.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentTitle, { color: c.text, textDecorationLine: t.completed ? "line-through" : "none" }]} numberOfLines={1}>{t.title}</Text>
                  <Text style={[styles.recentCat, { color: c.textTertiary }]}>{t.category} • {t.priority}</Text>
                </View>
                <Text style={[styles.recentStatus, { color: t.completed ? c.success : c.warning }]}>{t.completed ? "Done" : "Active"}</Text>
              </TouchableOpacity>
            ))}
            {recentTasks.length === 0 && (
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>No tasks yet. Tap + to create one!</Text>
            )}
          </PremiumGlassCard>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, position: "relative" },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 150, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLeft: { flex: 1, gap: 4 },
  greetingBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  greetingText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSub: { fontSize: 14, fontWeight: "500", marginTop: 2 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center", marginTop: 4 },
  avatarBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 4 },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarSmallText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  ringSection: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginVertical: 16, gap: 20 },
  ringMeta: { flex: 1, gap: 8 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  statsGrid: { flexDirection: "row", marginHorizontal: 16, gap: 8, marginBottom: 16 },
  statIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  recentItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { fontSize: 14, fontWeight: "600" },
  recentCat: { fontSize: 11, marginTop: 1 },
  recentStatus: { fontSize: 12, fontWeight: "600" },
  emptyText: { fontSize: 13, textAlign: "center", paddingVertical: 16 },
  upcomingItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  upcomingDot: { width: 6, height: 6, borderRadius: 3 },
  upcomingText: { flex: 1, fontSize: 13, fontWeight: "500" },
  upcomingDate: { fontSize: 11, fontWeight: "600" },
});

export default DashboardScreen;
