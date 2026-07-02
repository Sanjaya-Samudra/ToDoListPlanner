import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AnimatedButton from "./AnimatedButton";

const illustrations = {
  tasks: { primary: "📝", orbiting: ["✅", "⏰", "📅", "⭐", "🔥", "📌", "🎯", "💪"] },
  done: { primary: "🎉", orbiting: ["✅", "✨", "🌟", "💫", "🏆", "🎊", "💯", "⭐"] },
  search: { primary: "🔍", orbiting: ["📋", "📌", "⭐", "🔎", "📂", "🏷️", "📄", "📍"] },
  stats: { primary: "📊", orbiting: ["📈", "📉", "📋", "🎯", "🏆", "📊", "💹", "📏"] },
  chat: { primary: "💬", orbiting: ["💡", "✨", "🤖", "💭", "⚡", "🧠", "💎", "🔮"] },
  notifications: { primary: "🔔", orbiting: ["💬", "✨", "📢", "💭", "⏰", "🔕", "📨", "⚡"] },
  generic: { primary: "📋", orbiting: ["✨", "⭐", "💫", "🌟", "🔥", "💎", "🎯", "⚡"] },
};

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction, variant = "generic", animated = true }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const angleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(angleAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(angleAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ill = illustrations[variant] || illustrations.generic;
  const numSteps = 20;
  const maxAngle = Math.PI / 4;
  const r = 55;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "10", borderColor: colors.borderLight }]}>
          <Text style={styles.mainIcon}>{icon || ill.primary}</Text>
          {ill.orbiting.map((o, i) => {
            const baseAngle = (i / ill.orbiting.length) * 2 * Math.PI - Math.PI / 2;
            const inputRange = [];
            const outputX = [];
            const outputY = [];
            for (let j = 0; j <= numSteps; j++) {
              const t = j / numSteps;
              const delta = -maxAngle + t * 2 * maxAngle;
              const angle = baseAngle + delta;
              inputRange.push(t);
              outputX.push(-6 + 50 + Math.cos(angle) * r);
              outputY.push(-6 + 50 + Math.sin(angle) * r);
            }
            const px = angleAnim.interpolate({ inputRange, outputRange: outputX });
            const py = angleAnim.interpolate({ inputRange, outputRange: outputY });
            return (
              <Animated.View key={i} style={[styles.orbitIcon, { transform: [{ translateX: px }, { translateY: py }] }]}>
                <Text style={styles.orbitText}>{o}</Text>
              </Animated.View>
            );
          })}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        {actionLabel && <AnimatedButton title={actionLabel} onPress={onAction} variant="primary" size="sm" style={styles.action} />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  iconWrap: { width: 110, height: 110, borderRadius: 55, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 20, borderWidth: 1, position: "relative" },
  mainIcon: { fontSize: 44 },
  orbitIcon: { position: "absolute", left: 0, top: 0 },
  orbitText: { fontSize: 10 },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  action: { marginTop: 8 },
});

export default EmptyState;
