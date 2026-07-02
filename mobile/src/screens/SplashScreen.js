import React, { useRef, useEffect } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, damping: 8, stiffness: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, damping: 10, stiffness: 60, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textSlide, { toValue: 0, damping: 15, stiffness: 100, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(logoOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0D0D1A", "#1A0A2E", "#0D0D1A"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        <View style={styles.logoInner}>
          <Text style={styles.logoEmoji}>✨</Text>
        </View>
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: textOpacity, transform: [{ translateY: textSlide }] }]}>TaskFlow</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D1A" },
  logoWrap: { alignItems: "center", justifyContent: "center", marginBottom: 20 },
  ring: { position: "absolute", width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: "rgba(108,99,255,0.4)" },
  logoInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(108,99,255,0.15)", justifyContent: "center", alignItems: "center" },
  logoEmoji: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
});

export default SplashScreen;
