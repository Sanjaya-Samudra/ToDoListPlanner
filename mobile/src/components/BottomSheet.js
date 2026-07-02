import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const { height } = Dimensions.get("window");

const BottomSheet = ({ visible, onClose, children, title, snapPoint = height * 0.6 }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const translateY = useRef(new Animated.Value(snapPoint)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: snapPoint, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.backdrop, { backgroundColor: colors.overlay, opacity: backdropOpacity }]}
      >
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.surfaceElevated, transform: [{ translateY }], maxHeight: snapPoint }]}
      >
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.textTertiary + "40" }]} />
        </View>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  backdropTouch: { flex: 1 },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 40,
  },
  handle: { alignItems: "center", paddingVertical: 12 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  title: { fontSize: 18, fontWeight: "700", paddingHorizontal: 24, marginBottom: 8 },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
});

export default BottomSheet;
