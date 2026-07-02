import React, { useRef, useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThreeBackground from "../../components/ThreeBackground";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const useMousePosition = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!isWeb) return;
    const handler = (e) => setPos({ x: (e.clientX / width - 0.5) * 2, y: (e.clientY / height - 0.5) * 2 });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
};

const MorphingBlob = ({ index, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const dur = 5000 + index * 1200;
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: dur, useNativeDriver: true }),
        Animated.timing(x, { toValue: 40 + Math.random() * 60, duration: dur * 0.7, useNativeDriver: true }),
        Animated.timing(y, { toValue: -20 - Math.random() * 40, duration: dur * 0.5, useNativeDriver: true }),
        Animated.timing(s, { toValue: 0.7 + Math.random() * 0.4, duration: dur, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(anim, { toValue: 0, duration: dur, useNativeDriver: true }),
        Animated.timing(x, { toValue: 0, duration: dur * 0.7, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: dur * 0.5, useNativeDriver: true }),
        Animated.timing(s, { toValue: 1, duration: dur, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  const br = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [80, 40, 80] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${360 + index * 60}deg`] });
  const size = 180 + index * 60;
  return (
    <Animated.View style={{
      position: "absolute", width: size, height: size, borderRadius: br, backgroundColor: color,
      opacity: 0.04, transform: [{ translateX: x }, { translateY: y }, { scale: s }, { rotate }],
      top: 100 + index * 100, left: index % 2 === 0 ? -40 : width - size + 40,
    }} />
  );
};

const Particle = React.memo(({ delay, xPos, yPos, size, duration }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay), Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
    ])).start();
  }, []);
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -(80 + Math.random() * 80)] });
  const tx = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 25 * (Math.random() > 0.5 ? 1 : -1), 0] });
  const op = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  return <Animated.View style={{ position: "absolute", left: xPos, top: yPos, width: size, height: size, borderRadius: size / 2, backgroundColor: "#fff", opacity: op, transform: [{ translateY: ty }, { translateX: tx }] }} />;
});

const AnimatedGradient = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 8000, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 0, duration: 8000, useNativeDriver: false }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: ["#0D0D1A", "#0A0A1F"] }) }]}>
      <LinearGradient colors={["rgba(108,99,255,0.08)", "transparent"]} style={{ position: "absolute", width: "100%", height: "50%", top: 0 }} />
      <LinearGradient colors={["transparent", "rgba(0,210,211,0.06)"]} style={{ position: "absolute", width: "100%", height: "50%", bottom: 0 }} />
    </Animated.View>
  );
};

const GlowingButton = ({ onPress, children, variant = "primary", compact = false }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 2000, useNativeDriver: false }),
    ])).start();
  }, []);
  const isPrimary = variant === "primary";
  return (
    <Animated.View style={{ transform: [{ scale: pressed ? 0.96 : 1 }] }}>
      {isPrimary && <Animated.View style={[styles.buttonGlow, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }) }]} />}
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
        <LinearGradient
          colors={isPrimary ? ["#6C63FF", "#8B85FF"] : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.buttonGradient, compact && styles.buttonCompact, !isPrimary && { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }]}
        >
          <Text style={[styles.buttonText, compact && styles.buttonTextCompact, !isPrimary && { color: "rgba(255,255,255,0.6)" }]}>{children}</Text>
          <Text style={[styles.buttonArrow, !isPrimary && { color: "rgba(255,255,255,0.4)" }]}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LandingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mousePos = useMousePosition();
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(60)).current;
  const bgFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgFade, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(heroSlide, { toValue: 0, damping: 20, stiffness: 60, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const pX = mousePos.x * 15;
  const pY = mousePos.y * 10;

  return (
    <View style={styles.container}>
      {isWeb ? <ThreeBackground /> : (
        <>
          <AnimatedGradient />
          {Array.from({ length: 3 }).map((_, i) => (
            <MorphingBlob key={i} index={i} color={["#6C63FF", "#00D2D3", "#FF6584"][i]} />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} delay={i * 120} xPos={Math.random() * width} yPos={Math.random() * height * 0.6} size={1.5 + Math.random() * 2} duration={3000 + Math.random() * 4000} />
          ))}
        </>
      )}

      <ScrollView style={StyleSheet.absoluteFill} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false} bounces={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
            <View style={styles.logoWrap}>
              <Animated.View style={[styles.logoRing, { opacity: bgFade, transform: [{ rotate: bgFade.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]} />
              <LinearGradient colors={["#6C63FF", "#00D2D3", "#FF6584"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoInner} />
              <Text style={styles.logoEmoji}>✨</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }, { translateX: pX * 0.2 }, { translateY: pY * 0.2 }] }}>
            <Text style={[styles.title, { textShadowColor: "rgba(108,99,255,0.4)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 }]}>TaskFlow</Text>
          </Animated.View>

          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
            <Text style={styles.tagline}>AI-powered productivity that thinks with you</Text>
          </Animated.View>

          <Animated.View style={[styles.heroButtons, { opacity: heroOpacity }]}>
            <GlowingButton onPress={() => navigation.navigate("Login")}>Get Started</GlowingButton>
            <View style={{ marginTop: 10 }}>
              <GlowingButton onPress={() => navigation.navigate("Login")} variant="outline" compact>Watch Demo</GlowingButton>
            </View>
          </Animated.View>
        </View>

        {/* FEATURES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why TaskFlow?</Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: "🧠", title: "AI That Knows You", desc: "Learns your workflow and schedules smartly" },
              { icon: "📊", title: "Live Analytics", desc: "Real-time insights with AI coaching" },
              { icon: "🎯", title: "Smart Deadlines", desc: "Auto-prioritizes before they're due" },
            ].map((f, i) => (
              <Animated.View key={f.title} style={[styles.featureCard, { borderColor: "rgba(255,255,255,0.06)" }]}>
                <LinearGradient colors={["rgba(108,99,255,0.1)", "rgba(0,210,211,0.04)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <LinearGradient colors={["rgba(108,99,255,0.08)", "rgba(0,210,211,0.04)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={[styles.ctaTitle]}>Ready to transform your productivity?</Text>
          <GlowingButton onPress={() => navigation.navigate("Login")}>Start Free</GlowingButton>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  scrollContent: { flexGrow: 1 },
  hero: { minHeight: height * 0.75, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, paddingTop: 30 },
  logoWrap: { width: 80, height: 80, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logoRing: { position: "absolute", width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: "rgba(108,99,255,0.35)" },
  logoInner: { position: "absolute", width: 80, height: 80, borderRadius: 40, opacity: 0.2 },
  logoEmoji: { fontSize: 34 },
  title: { fontSize: isWeb ? 52 : 40, fontWeight: "900", color: "#fff", letterSpacing: isWeb ? -2 : -1, marginBottom: 10, textAlign: "center" },
  tagline: { fontSize: isWeb ? 16 : 14, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 22, paddingHorizontal: 20, maxWidth: 340 },
  heroButtons: { marginTop: 32, alignItems: "center" },
  section: { paddingHorizontal: 20, paddingVertical: 36 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 20 },
  featuresGrid: { gap: 10 },
  featureCard: { borderRadius: 18, padding: 18, borderWidth: 1, overflow: "hidden" },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 4 },
  featureDesc: { fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 18 },
  ctaSection: { marginHorizontal: 20, marginVertical: 20, borderRadius: 20, padding: 28, alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  ctaTitle: { fontSize: 20, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 20, maxWidth: 280 },
  buttonGlow: { position: "absolute", top: -3, left: -3, right: -3, bottom: -3, borderRadius: 20, backgroundColor: "#6C63FF" },
  buttonGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, overflow: "hidden" },
  buttonCompact: { paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700", marginRight: 6 },
  buttonTextCompact: { fontSize: 14 },
  buttonArrow: { color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: "600" },
});

export default LandingScreen;
