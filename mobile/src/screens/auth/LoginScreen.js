import React, { useState, useRef, useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AnimatedInput from "../../components/AnimatedInput";
import { useToast } from "../../context/ToastContext";

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const f0 = useRef(new Animated.Value(0)).current;
  const f1 = useRef(new Animated.Value(0)).current;
  const f2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, damping: 18, stiffness: 100, useNativeDriver: true }),
    ]).start();
    Animated.stagger(140, [f0, f1, f2].map((a) => Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true }))).start();

    AsyncStorage.getItem("@logout_reason").then((reason) => {
      if (reason) {
        AsyncStorage.removeItem("@logout_reason");
        setTimeout(() => showToast(reason, "info"), 600);
      }
    });
  }, []);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Required";
    else if (password.length < 6) errs.password = "Too short";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      showToast("Welcome to TaskFlow!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, colors.primary + "12"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <View style={styles.header}>
              <View style={[styles.logoRing, { borderColor: colors.primary + "30" }]}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.logo}>
                  <Text style={styles.logoText}>📋</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Task<Text style={{ color: colors.primary }}>Flow</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.textTertiary }]}>AI-Powered Productivity</Text>
            </View>

            <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary }, { transform: [{ scale: cardScale }] }]}>
              <AnimatedField style={{ opacity: f0, transform: [{ translateY: f0.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
                <AnimatedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="✉️" error={errors.email} />
              </AnimatedField>

              <AnimatedField style={{ opacity: f1, transform: [{ translateY: f1.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
                <AnimatedInput label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="🔒" error={errors.password} />
              </AnimatedField>

              <AnimatedField style={{ opacity: f2, transform: [{ translateY: f2.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
                <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={{ marginTop: 4 }} disabled={loading}>
                  <LinearGradient colors={[colors.primary, colors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>{loading ? "Logging in..." : "Sign In"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedField>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.secondaryBtn}>
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Create Account</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const AnimatedField = ({ children, style }) => <Animated.View style={[{ marginBottom: 12 }, style]}>{children}</Animated.View>;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logoRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logo: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  logoText: { fontSize: 28 },
  title: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: "500" },
  card: { borderRadius: 18, padding: 20, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  loginBtn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontWeight: "500" },
  secondaryBtn: { alignItems: "center", paddingVertical: 10 },
  secondaryBtnText: { fontSize: 15, fontWeight: "600" },
});

export default LoginScreen;
