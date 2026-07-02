import React, { useRef, useEffect, useMemo } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const { width: W, height: H } = Dimensions.get("window");

const Blob = ({ color, size, startX, startY, animX, animY, animScale }) => {
  const scale = animScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] });
  const x = animX.interpolate({ inputRange: [0, 1], outputRange: [startX - 30, startX + 30] });
  const y = animY.interpolate({ inputRange: [0, 1], outputRange: [startY - 20, startY + 20] });
  return (
    <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.35, transform: [{ translateX: x }, { translateY: y }, { scale }] }} />
  );
};

const Particle = ({ animY, animX, size, startX, startY, color, delay }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(t, { toValue: 1, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
      Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [startX, startX + (Math.random() - 0.5) * 120] });
  const y = t.interpolate({ inputRange: [0, 1], outputRange: [startY, startY - 80 - Math.random() * 60] });
  const o = t.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.6, 0.6, 0] });
  return <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: o, transform: [{ translateX: x }, { translateY: y }] }} />;
};

const MeshGradient = ({ colors, intensity = 1 }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const fade = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  const meshColors = colors || [c.primary + "18", c.accent + "12", c.secondary + "10", c.background];

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, size: 2 + Math.random() * 4,
    startX: Math.random() * W, startY: Math.random() * H,
    color: [c.primary, c.accent, c.secondary, c.success][Math.floor(Math.random() * 4)] + "40",
    delay: Math.random() * 5000,
  })), []);

  useEffect(() => {
    Animated.timing(fade, { toValue: intensity, duration: 600, useNativeDriver: true }).start();
    const loop1 = Animated.loop(Animated.sequence([Animated.timing(anim1, { toValue: 1, duration: 8000, useNativeDriver: true }), Animated.timing(anim1, { toValue: 0, duration: 8000, useNativeDriver: true })]));
    const loop2 = Animated.loop(Animated.sequence([Animated.timing(anim2, { toValue: 1, duration: 10000, useNativeDriver: true }), Animated.timing(anim2, { toValue: 0, duration: 10000, useNativeDriver: true })]));
    const loop3 = Animated.loop(Animated.sequence([Animated.timing(anim3, { toValue: 1, duration: 12000, useNativeDriver: true }), Animated.timing(anim3, { toValue: 0, duration: 12000, useNativeDriver: true })]));
    loop1.start(); loop2.start(); loop3.start();
    return () => { loop1.stop(); loop2.stop(); loop3.stop(); };
  }, []);

  const op1 = anim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  const op2 = anim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  const op3 = anim3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient colors={meshColors} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op1 }]}>
          <LinearGradient colors={["transparent", c.primary + "10", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op2 }]}>
          <LinearGradient colors={["transparent", c.accent + "08", "transparent"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op3 }]}>
          <LinearGradient colors={["transparent", c.secondary + "06", "transparent"]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Blob color={c.primary + "20"} size={200} startX={W * 0.8} startY={H * 0.1} animX={anim1} animY={anim2} animScale={anim1} />
        <Blob color={c.accent + "18"} size={160} startX={W * 0.1} startY={H * 0.7} animX={anim2} animY={anim3} animScale={anim2} />
        <Blob color={c.secondary + "15"} size={140} startX={W * 0.5} startY={H * 0.5} animX={anim3} animY={anim1} animScale={anim3} />
        <Blob color={c.success + "10"} size={120} startX={W * 0.3} startY={H * 0.15} animX={anim1} animY={anim3} animScale={anim2} />

        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </Animated.View>
    </View>
  );
};

export default MeshGradient;
