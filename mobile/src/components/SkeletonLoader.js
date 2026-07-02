import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SkeletonBlock = ({ width = "100%", height = 16, borderRadius = 8, style }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width: width, height, borderRadius, backgroundColor: colors.textTertiary + "25", opacity }, style]}
    />
  );
};

const SkeletonLoader = ({ count = 4 }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SkeletonBlock width="50%" height={24} />
        <SkeletonBlock width="30%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.progressRow}>
        <SkeletonBlock width={100} height={100} borderRadius={50} />
        <View style={styles.progressText}>
          <SkeletonBlock width="80%" height={16} />
          <SkeletonBlock width="60%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardLeft}>
            <SkeletonBlock width={26} height={26} borderRadius={13} />
          </View>
          <View style={styles.cardRight}>
            <SkeletonBlock width="90%" height={16} />
            <SkeletonBlock width="60%" height={12} style={{ marginTop: 8 }} />
            <SkeletonBlock width="40%" height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, paddingTop: 20 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 30, gap: 20 },
  progressText: { flex: 1 },
  card: { flexDirection: "row", padding: 16, marginBottom: 12, borderRadius: 16 },
  cardLeft: { marginRight: 14 },
  cardRight: { flex: 1 },
});

export default SkeletonLoader;
