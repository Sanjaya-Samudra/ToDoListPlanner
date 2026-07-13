import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Animated, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import AnimatedInput from "../../components/AnimatedInput";
import AnimatedButton from "../../components/AnimatedButton";
import PremiumGlassCard from "../../components/PremiumGlassCard";
import AnimatedBackground from "../../components/AnimatedBackground";
import GradientText from "../../components/GradientText";
import { REMINDER_FREQUENCIES } from "../../constants/config";
import { useToast } from "../../context/ToastContext";
import { mediumImpact } from "../../utils/haptics";
import { useTasks } from "../../hooks/useTasks";

const AnimatedStat = ({ value, label, color, textColor }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: Number(value) || 0, duration: 800, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color }}>
        {display}
        {label === "Rate" ? "%" : ""}
      </Text>
      <Text style={{ fontSize: 11, fontWeight: "500", color: textColor }}>{label}</Text>
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const { getProgress } = useTasks();
  const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0, streak: 0 });

  const [name, setName] = useState(user?.name || "");
  const [reminderFreq, setReminderFreq] = useState(user?.reminderFrequency || 5);
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseRing = useRef(new Animated.Value(0)).current;
  const rotateRing = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    const unsubscribe = navigation.addListener("focus", () => {
      loadStats();
    });

    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseRing, { toValue: 1, duration: 2500, useNativeDriver: true }),
      Animated.timing(pulseRing, { toValue: 0, duration: 2500, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(rotateRing, { toValue: 1, duration: 8000, useNativeDriver: true }),
    ])).start();

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.spring(modalAnim, { toValue: showLogoutModal ? 1 : 0, damping: 15, stiffness: 180, useNativeDriver: true }).start();
  }, [showLogoutModal]);

  const loadStats = async () => {
    try {
      const data = await getProgress();
      if (data) {
        setStats({
          total: data.total || 0,
          completed: data.completed || 0,
          percentage: data.percentage || 0,
          streak: data.streak || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load profile stats:", err);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), reminderFrequency: reminderFreq });
      showToast("Profile updated!", "success");
      mediumImpact();
    } catch { showToast("Failed to update", "error"); } finally { setSaving(false); }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    mediumImpact();
    setShowLogoutModal(false);
    logout();
  };

  const ringS = pulseRing.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringO = pulseRing.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
  const rotate = rotateRing.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const menuItems = [
    { icon: "🔔", label: "Notifications", action: "notifications" },
    { icon: "🌙", label: "Dark Mode", toggle: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.7} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.profileHeader}>
            <LinearGradient colors={[c.primary + "20", "transparent"]} style={styles.headerGlow} />
            <View style={styles.avatarWrap}>
              <Animated.View style={[styles.avatarRingPulse, { borderColor: c.primary + "60", transform: [{ scale: ringS }], opacity: ringO }]} />
              <Animated.View style={[styles.avatarRingRotate, { borderColor: c.accent + "40", borderStyle: "dashed", transform: [{ rotate }] }]} />
              <LinearGradient colors={[c.primary, c.accent]} style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
              </LinearGradient>
              <View style={[styles.badgeOnline, { backgroundColor: c.success }]}>
                <View style={styles.badgeInner} />
              </View>
            </View>
            <GradientText style={styles.name}>{user?.name || "User"}</GradientText>
            <Text style={[styles.email, { color: c.textTertiary }]}>{user?.email}</Text>
            <View style={[styles.statsRow, { backgroundColor: c.glass, borderColor: c.glassBorder }]}>
              <AnimatedStat value={stats.total} label="Tasks" color={c.primary} textColor={c.textSecondary} />
              <View style={[styles.statDivider, { backgroundColor: c.borderLight }]} />
              <AnimatedStat value={stats.completed} label="Done" color={c.success} textColor={c.textSecondary} />
              <View style={[styles.statDivider, { backgroundColor: c.borderLight }]} />
              <AnimatedStat value={stats.percentage} label="Rate" color={c.warning} textColor={c.textSecondary} />
              <View style={[styles.statDivider, { backgroundColor: c.borderLight }]} />
              <AnimatedStat value={stats.streak} label="Streak" color={c.secondary} textColor={c.textSecondary} />
            </View>
          </View>

          <PremiumGlassCard accentColor={c.primary} glowColor={c.primary} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>⚙️ Settings</Text>
            <AnimatedInput label="Full Name" value={name} onChangeText={setName} icon="👤" />
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Reminder Frequency</Text>
            <View style={styles.freqRow}>
              {REMINDER_FREQUENCIES.map((f) => (
                <TouchableOpacity key={f.value} style={[styles.freqBtn, { backgroundColor: reminderFreq === f.value ? c.primary : c.inputBg, borderColor: reminderFreq === f.value ? c.primary : c.border }]} onPress={() => { setReminderFreq(f.value); mediumImpact(); }}>
                  <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                  <Text style={[styles.freqLabel, { color: reminderFreq === f.value ? "#fff" : c.text }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AnimatedButton title={saving ? "Saving..." : "Save Changes"} onPress={handleUpdate} loading={saving} fullWidth />
          </PremiumGlassCard>

          <PremiumGlassCard accentColor={c.accent} glowColor={c.accent} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>🎨 Preferences</Text>
            {menuItems.map((item, i) => {
              const content = (
                <View key={i} style={[styles.menuItem, { borderBottomColor: c.borderLight }]}>
                  <Text style={{ fontSize: 18, marginRight: 14, width: 28 }}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: c.text }]}>{item.label}</Text>
                  {item.toggle ? (
                    <Switch value={isDark} onValueChange={() => { toggleTheme(); mediumImpact(); }} trackColor={{ false: c.border, true: c.primary + "50" }} thumbColor={isDark ? c.primary : "#f4f3f4"} />
                  ) : (
                    <Text style={[styles.menuValue, { color: c.textTertiary }]}>{item.value || "›"}</Text>
                  )}
                </View>
              );
              if (item.action === "notifications") {
                return (
                  <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => { mediumImpact(); navigation.navigate("Notifications"); }}>
                    {content}
                  </TouchableOpacity>
                );
              }
              return content;
            })}
          </PremiumGlassCard>

          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <AnimatedButton title="Logout" onPress={handleLogout} variant="danger" fullWidth size="lg" />
          </View>
        </Animated.View>
      </ScrollView>

      {showLogoutModal && (
        <View style={[styles.modalOverlay, { backgroundColor: c.overlay }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowLogoutModal(false)} />
          <Animated.View style={[styles.modalCard, { backgroundColor: c.surface, borderColor: c.border, transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }], opacity: modalAnim }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: c.error + "15" }]}>
              <Text style={styles.modalIcon}>🚪</Text>
            </View>
            <Text style={[styles.modalTitle, { color: c.text }]}>Leave TaskFlow?</Text>
            <Text style={[styles.modalDesc, { color: c.textSecondary }]}>Your tasks and preferences are saved. You can sign back in anytime.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.inputBg, borderColor: c.border }]} onPress={() => setShowLogoutModal(false)}>
                <Text style={[styles.modalBtnText, { color: c.text }]}>Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.error, borderColor: c.error }]} onPress={confirmLogout}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: "center", paddingVertical: 28, paddingTop: 24, position: "relative" },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 160, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarRingPulse: { position: "absolute", width: 96, height: 96, borderRadius: 48, borderWidth: 2, top: -8, left: -8 },
  avatarRingRotate: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 2, top: -10, left: -10 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  badgeOnline: { position: "absolute", bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  badgeInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 2, fontWeight: "500" },
  statsRow: { flexDirection: "row", marginTop: 20, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 18, borderWidth: 1, gap: 0, alignItems: "center" },
  statDivider: { width: 1, height: 28, marginHorizontal: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 10, marginTop: 4 },
  freqRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  freqBtn: { flex: 1, alignItems: "center", padding: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  freqLabel: { fontSize: 10, fontWeight: "600" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  menuValue: { fontSize: 13, fontWeight: "500" },
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalCard: { width: "82%", borderRadius: 24, borderWidth: 1, padding: 28, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  modalIcon: { fontSize: 28 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", borderWidth: 1 },
  modalBtnText: { fontSize: 15, fontWeight: "700" },
});

export default ProfileScreen;
