import React, { useState, useRef, useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import AnimatedInput from "../../components/AnimatedInput";
import { useToast } from "../../context/ToastContext";

const ForgotPasswordScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, damping: 18, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateStep1 = () => {
    const errs = {};
    if (!email) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!code || code.length !== 6) errs.code = "Enter the 6-digit code";
    if (!newPassword) errs.newPassword = "Required";
    else if (newPassword.length < 6) errs.newPassword = "Too short";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      showToast("Reset code sent to your email", "success");
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      showToast("Password reset successful! Sign in with your new password.", "success");
      navigation.navigate("Login");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, colors.primary + "12"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <View style={styles.header}>
              <View style={[styles.logoRing, { borderColor: colors.primary + "30" }]}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.logo}>
                  <Text style={styles.logoText}>🔑</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                {step === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
              </Text>
            </View>

            <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary }, { transform: [{ scale: cardScale }] }]}>
              {step === 1 ? (
                <>
                  <AnimatedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="✉️" error={errors.email} />

                  <TouchableOpacity onPress={handleSendCode} activeOpacity={0.85} style={{ marginTop: 4 }} disabled={loading}>
                    <LinearGradient colors={[colors.primary, colors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                      <Text style={styles.btnText}>{loading ? "Sending..." : "Send Reset Code"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <AnimatedInput label="Reset Code (6 digits)" value={code} onChangeText={setCode} keyboardType="number-pad" icon="🔢" error={errors.code} />
                  <AnimatedInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry icon="🔒" error={errors.newPassword} />
                  <AnimatedInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry icon="🔒" error={errors.confirmPassword} />

                  <TouchableOpacity onPress={handleReset} activeOpacity={0.85} style={{ marginTop: 4 }} disabled={loading}>
                    <LinearGradient colors={[colors.primary, colors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                      <Text style={styles.btnText}>{loading ? "Resetting..." : "Reset Password"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                <Text style={[styles.backText, { color: colors.textTertiary }]}>
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>Back to Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logoRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logo: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center" },
  logoText: { fontSize: 28 },
  title: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: "500", textAlign: "center" },
  card: { borderRadius: 18, padding: 20, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  btn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backLink: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  backText: { fontSize: 14 },
});

export default ForgotPasswordScreen;
