import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const ShimmerBlock = ({ width: w = "100%", height = 16, borderRadius = 8, style }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-w, w],
  });

  return (
    <View style={[{ width: w, height, borderRadius, backgroundColor: colors.textTertiary + "18", overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
          backgroundColor: colors.textTertiary + "12",
        }}
      />
    </View>
  );
};

const LoadingSplash = ({ variant = "stats" }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const pulse = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(bounce, { toValue: 1, damping: 4, stiffness: 80, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 0, damping: 4, stiffness: 80, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (variant === "stats") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerArea}>
          <ShimmerBlock width={140} height={28} borderRadius={6} />
          <ShimmerBlock width={200} height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
        <View style={styles.ringRow}>
          <View style={{ alignItems: "center" }}>
            <ShimmerBlock width={130} height={130} borderRadius={65} />
            <ShimmerBlock width={60} height={12} borderRadius={4} style={{ marginTop: 12 }} />
          </View>
          <View style={{ flex: 1, gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <ShimmerBlock key={i} width={`${60 + i * 10}%`} height={10} borderRadius={4} />
            ))}
          </View>
        </View>
        <View style={styles.statsGrid}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <ShimmerBlock width={30} height={30} borderRadius={10} />
              <ShimmerBlock width={40} height={22} borderRadius={4} style={{ marginTop: 8 }} />
              <ShimmerBlock width={50} height={10} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.barCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <ShimmerBlock width={`${70 - i * 15}%`} height={14} borderRadius={4} />
            <View style={[styles.barTrack, { backgroundColor: colors.textTertiary + "10" }]}>
              <View style={[styles.barFill, { width: `${50 + i * 15}%`, backgroundColor: colors.primary + "30" }]} />
            </View>
          </View>
        ))}
        <Animated.View style={[styles.dotsRow, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    );
  }

  if (variant === "dashboard") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.dashHeader}>
          <ShimmerBlock width={100} height={12} borderRadius={6} />
          <ShimmerBlock width="60%" height={26} borderRadius={6} style={{ marginTop: 6 }} />
          <ShimmerBlock width="40%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.ringRow}>
          <ShimmerBlock width={120} height={120} borderRadius={60} />
          <View style={{ flex: 1, gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <ShimmerBlock key={i} width={`${50 + i * 15}%`} height={8} borderRadius={4} />
            ))}
          </View>
        </View>
        <View style={styles.statsGrid}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <ShimmerBlock width={28} height={28} borderRadius={8} />
              <ShimmerBlock width={36} height={20} borderRadius={4} style={{ marginTop: 6 }} />
              <ShimmerBlock width={44} height={10} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        {[1, 2].map((i) => (
          <View key={i} style={[styles.recentCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ShimmerBlock width={8} height={8} borderRadius={4} />
              <ShimmerBlock width="75%" height={14} borderRadius={4} />
              <ShimmerBlock width={40} height={10} borderRadius={4} />
            </View>
          </View>
        ))}
        <Animated.View style={[styles.dotsRow, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerArea: { marginBottom: 24, paddingTop: 10 },
  ringRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 20 },
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statBox: { flex: 1, alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1 },
  barCard: { padding: 14, marginBottom: 10, borderRadius: 16, borderWidth: 1, gap: 8 },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  dashHeader: { marginBottom: 24, paddingTop: 10 },
  recentCard: { padding: 14, marginBottom: 8, borderRadius: 14, borderWidth: 1 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

export default LoadingSplash;
