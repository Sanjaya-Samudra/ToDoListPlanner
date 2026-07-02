import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "./ThemeContext";

const ToastContext = createContext();

const TOAST_DURATION = 3000;
const { width } = Dimensions.get("window");

const ToastItem = ({ message, type, onHide, onUndo }) => {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  const bgColors = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.primary,
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 15, stiffness: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -50, duration: 250, useNativeDriver: true }),
      ]).start(() => onHide());
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bgColors[type] || bgColors.info,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.icon}>{icons[type] || icons.info}</Text>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      {onUndo && (
        <TouchableOpacity style={styles.undoBtn} onPress={() => { onUndo(); onHide(); }}>
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  icon: { fontSize: 18, color: "#fff", fontWeight: "700", marginRight: 10 },
  message: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" },
  undoBtn: { marginLeft: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)" },
  undoText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", undoAction = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, onUndo: undoAction }]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} type={t.type} onHide={() => hideToast(t.id)} onUndo={t.onUndo} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
