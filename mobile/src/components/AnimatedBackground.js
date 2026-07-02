import React, { useRef, useEffect, useMemo } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const { width: W, height: H } = Dimensions.get("window");

const Particle = ({ size, startX, startY, color, delay }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(t, { toValue: 1, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
      Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [startX, startX + (Math.random() - 0.5) * 100] });
  const y = t.interpolate({ inputRange: [0, 1], outputRange: [startY, startY - 60 - Math.random() * 40] });
  const o = t.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.5, 0.5, 0] });
  return <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: o, transform: [{ translateX: x }, { translateY: y }] }} />;
};

const AnimatedBackground = ({ intensity = 1, colors: customColors }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const fade = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  const meshColors = customColors || [c.primary + "15", c.accent + "10", c.secondary + "08", c.background];

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, size: 2 + Math.random() * 3,
    startX: Math.random() * W, startY: Math.random() * H,
    color: [c.primary, c.accent, c.secondary, c.success][Math.floor(Math.random() * 4)] + "35",
    delay: Math.random() * 4000,
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

  const s1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] });
  const s2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] });
  const s3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient colors={meshColors} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op1 }]}>
          <LinearGradient colors={["transparent", c.primary + "08", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op2 }]}>
          <LinearGradient colors={["transparent", c.accent + "06", "transparent"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: op3 }]}>
          <LinearGradient colors={["transparent", c.secondary + "05", "transparent"]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View style={[styles.blob1, { backgroundColor: c.primary + "15", transform: [{ scale: s1 }] }]} />
        <Animated.View style={[styles.blob2, { backgroundColor: c.accent + "12", transform: [{ scale: s2 }] }]} />
        <Animated.View style={[styles.blob3, { backgroundColor: c.secondary + "10", transform: [{ scale: s3 }] }]} />
        <Animated.View style={[styles.blob4, { backgroundColor: c.success + "08", transform: [{ scale: s1 }] }]} />

        {particles.map((p) => <Particle key={p.id} {...p} />)}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  blob1: { position: "absolute", width: 240, height: 240, borderRadius: 120, top: -80, right: -100 },
  blob2: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: 40, left: -80 },
  blob3: { position: "absolute", width: 160, height: 160, borderRadius: 80, bottom: 200, right: 20 },
  blob4: { position: "absolute", width: 140, height: 140, borderRadius: 70, top: 200, left: 40 },
});

export default AnimatedBackground;
