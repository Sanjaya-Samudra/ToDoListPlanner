import React, { useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../hooks/useNotifications";
import GlassCard from "../../components/GlassCard";
import AnimatedBackground from "../../components/AnimatedBackground";
import EmptyState from "../../components/EmptyState";
import { mediumImpact } from "../../utils/haptics";

const NotificationItem = ({ item, index, onAcknowledge }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, damping: 18, stiffness: 150, delay: index * 40, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => { mediumImpact(); onAcknowledge(item._id); }} style={[styles.notifItem, { backgroundColor: c.glass, borderColor: c.glassBorder }]}>
        <View style={[styles.notifDot, { backgroundColor: item.acknowledged ? c.textTertiary : c.primary }]} />
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: c.text }]}>{item.title}</Text>
          {item.body && <Text style={[styles.notifBody, { color: c.textSecondary }]}>{item.body}</Text>}
          <Text style={[styles.notifTime, { color: c.textTertiary }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
          </Text>
        </View>
        {!item.acknowledged && <View style={[styles.unreadBadge, { backgroundColor: c.primary }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const NotificationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { notifications, unreadCount, acknowledge, acknowledgeAll, refresh, loading } = useNotifications();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.4} />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient colors={[c.primary + "12", "transparent"]} style={styles.headerBg} />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: c.text }]}>🔔 Notifications</Text>
            {unreadCount > 0 && <Text style={[styles.headerSub, { color: c.primary }]}>{unreadCount} unread</Text>}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={[styles.clearBtn, { backgroundColor: c.primary + "15", borderColor: c.primary + "30" }]} onPress={() => { mediumImpact(); acknowledgeAll(); }}>
              <Text style={[styles.clearBtnText, { color: c.primary }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <NotificationItem item={item} index={index} onAcknowledge={acknowledge} />}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={<EmptyState variant="notifications" />}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={loading || false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 12, position: "relative" },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 80, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  clearBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  clearBtnText: { fontSize: 13, fontWeight: "700" },
  notifItem: { flexDirection: "row", marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 12 },
  notifDot: { width: 10, height: 10, borderRadius: 5 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: "600" },
  notifBody: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  unreadBadge: { width: 10, height: 10, borderRadius: 5 },
  listContent: { paddingTop: 8, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: "center" },
});

export default NotificationScreen;
