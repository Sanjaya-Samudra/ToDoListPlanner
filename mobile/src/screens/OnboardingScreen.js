import React, { useRef, useState, useEffect } from "react";
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    icon: "🧠",
    title: "AI That Knows You",
    desc: "TaskFlow learns your workflow and auto-prioritizes — so you never miss what matters",
    gradient: ["#1A0A2E", "#0D0D1A"],
    accent: "#6C63FF",
  },
  {
    icon: "📊",
    title: "Live Insights",
    desc: "Real-time analytics with AI coaching that adapts to your habits and helps you improve daily",
    gradient: ["#0A1A2E", "#0D0D1A"],
    accent: "#00D2D3",
  },
  {
    icon: "🎯",
    title: "Smart Deadlines",
    desc: "Intelligent scheduling that predicts your pace and sets deadlines you can actually meet",
    gradient: ["#2E0A1A", "#0D0D1A"],
    accent: "#FF6584",
  },
];

const Slide = ({ slide, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: "clamp" });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
  const iconRotate = scrollX.interpolate({ inputRange, outputRange: ["-20deg", "0deg", "20deg"], extrapolate: "clamp" });

  return (
    <Animated.View style={[styles.slide, { opacity, transform: [{ scale }] }]}>
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={[slide.accent + "15", "transparent"]} style={[StyleSheet.absoluteFill, { height: "60%" }]} />

      <Animated.View style={[styles.iconWrap, { backgroundColor: slide.accent + "18", transform: [{ rotate: iconRotate }] }]}>
        <LinearGradient colors={[slide.accent + "30", slide.accent + "10"]} style={StyleSheet.absoluteFill} />
        <Text style={styles.icon}>{slide.icon}</Text>
      </Animated.View>

      <Text style={[styles.title, { color: "#fff" }]}>{slide.title}</Text>
      <Text style={styles.desc}>{slide.desc}</Text>

      <View style={[styles.accentBar, { backgroundColor: slide.accent }]} />
    </Animated.View>
  );
};

const OnboardingScreen = ({ onFinish }) => {
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const goToSlide = (idx) => {
    const next = Math.max(0, Math.min(idx, slides.length - 1));
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setCurrentIndex(next);
  };

  const handleMomentumEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scroll}
      >
        {slides.map((slide, i) => (
          <Slide key={i} slide={slide} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <TouchableIndicator key={i} index={i} currentIndex={currentIndex} scrollX={scrollX} onPress={() => goToSlide(i)} />
          ))}
        </View>

        <View style={styles.buttonsRow}>
          {!isLast ? (
            <>
              <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goToSlide(currentIndex + 1)} style={[styles.nextBtn, { backgroundColor: slides[currentIndex].accent }]}>
                <Text style={styles.nextText}>→</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onFinish} style={[styles.startBtn, { backgroundColor: "#6C63FF" }]}>
              <LinearGradient colors={["#6C63FF", "#8B85FF"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.startText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const TouchableIndicator = ({ index, currentIndex, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.dotTouch}>
    <View style={[styles.dot, { backgroundColor: currentIndex === index ? "#6C63FF" : "rgba(255,255,255,0.15)", width: currentIndex === index ? 28 : 8 }]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  scroll: { flex: 1 },
  slide: { width, flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  iconWrap: { width: 130, height: 130, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 40, overflow: "hidden" },
  icon: { fontSize: 60 },
  title: { fontSize: 30, fontWeight: "800", textAlign: "center", marginBottom: 16, letterSpacing: -0.5 },
  desc: { fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 26, paddingHorizontal: 10, maxWidth: 320 },
  accentBar: { position: "absolute", bottom: 0, width: 60, height: 4, borderRadius: 2, opacity: 0.4 },
  footer: { position: "absolute", bottom: Platform.OS === "ios" ? 70 : 50, left: 0, right: 0, paddingHorizontal: 24 },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 32, gap: 4 },
  dotTouch: { padding: 4 },
  dot: { height: 8, borderRadius: 4 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  skipText: { color: "rgba(255,255,255,0.35)", fontSize: 15, fontWeight: "500" },
  nextBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  nextText: { color: "#fff", fontSize: 26, fontWeight: "600", lineHeight: 28 },
  startBtn: { flex: 1, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  startText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

export default OnboardingScreen;
