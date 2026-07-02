import React, { useState, useRef, useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AnimatedInput from "../../components/AnimatedInput";
import AnimatedButton from "../../components/AnimatedButton";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useToast } from "../../context/ToastContext";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { login, demoLogin } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, damping: 18, stiffness: 80, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      showToast("Welcome back!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AnimatedBackground intensity={0.4} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.topSection}>
          <Animated.View style={[styles.logoCircle, { backgroundColor: colors.primary + "15" }]}>
            <Text style={styles.logoIcon}>📋</Text>
          </Animated.View>
          <Text style={[styles.appName, { color: colors.primary }]}>TaskFlow</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>AI-Powered Productivity</Text>
        </View>

        <Animated.View style={[styles.formCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder, shadowColor: "#000" }, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
          <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>
          <AnimatedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="✉️" error={errors.email} />
          <AnimatedInput label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="🔒" error={errors.password} />
          <AnimatedButton title={loading ? "Logging in..." : "Login"} onPress={handleLogin} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <AnimatedButton title="Create Account" onPress={() => navigation.navigate("Register")} variant="outline" fullWidth />

          <TouchableOpacity
            onPress={async () => {
              try {
                await demoLogin();
                showToast("Welcome to TaskFlow!", "success");
              } catch {
                showToast("Demo login failed", "error");
              }
            }}
            style={styles.demoButton}
          >
            <Text style={[styles.demoButtonText, { color: colors.textTertiary }]}>Explore Demo</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  topSection: { alignItems: "center", marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { fontSize: 14, marginTop: 4, fontWeight: "500" },
  formCard: { borderRadius: 24, padding: 24, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4, overflow: "hidden" },
  formTitle: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontWeight: "500" },
  demoButton: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  demoButtonText: { fontSize: 14, fontWeight: "600" },
});

export default LoginScreen;
