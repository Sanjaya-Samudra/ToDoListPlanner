import React, { useState, useRef, useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AnimatedInput from "../../components/AnimatedInput";
import AnimatedButton from "../../components/AnimatedButton";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useToast } from "../../context/ToastContext";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
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
    if (!name || name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      showToast("Account created!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AnimatedBackground intensity={0.4} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.formCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder, shadowColor: "#000" }, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.accent, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your productivity journey</Text>
          <AnimatedInput label="Full Name" value={name} onChangeText={setName} icon="👤" error={errors.name} />
          <AnimatedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="✉️" error={errors.email} />
          <AnimatedInput label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="🔒" error={errors.password} />
          <AnimatedButton title={loading ? "Creating..." : "Create Account"} onPress={handleRegister} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
          <AnimatedButton title="Already have an account? Sign In" onPress={() => navigation.goBack()} variant="ghost" fullWidth style={{ marginTop: 8 }} />
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  formCard: { borderRadius: 24, padding: 24, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4, overflow: "hidden" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24, fontWeight: "500" },
});

export default RegisterScreen;
