import React, { useRef } from "react";
import { TouchableOpacity, Text, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mediumImpact } from "../utils/haptics";

const AnimatedButton = ({
  title, onPress, variant = "primary", size = "md", disabled, loading, icon, style, textStyle, fullWidth,
}) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const colors = theme.colors;

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";

  const getBg = () => {
    if (isPrimary) return colors.primary;
    if (isDanger) return colors.error;
    if (isOutline || isGhost) return "transparent";
    return colors.surface;
  };

  const getTextColor = () => {
    if (isPrimary || isDanger) return "#FFFFFF";
    if (isOutline) return colors.primary;
    return colors.text;
  };

  const getBorderColor = () => {
    if (isOutline) return colors.primary;
    if (isGhost) return "transparent";
    return "transparent";
  };

  const heightMap = { sm: 40, md: 50, lg: 56 };
  const fontMap = { sm: 13, md: 15, lg: 17 };
  const paddingMap = { sm: 16, md: 20, lg: 28 };

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, damping: 15, stiffness: 300, useNativeDriver: true }).start();
    mediumImpact();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: getBg(),
            borderColor: getBorderColor(),
            borderWidth: isOutline ? 1.5 : 0,
            height: heightMap[size],
            paddingHorizontal: paddingMap[size],
            opacity: disabled ? 0.5 : 1,
            borderRadius: size === "lg" ? 16 : 12,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && <Text style={[styles.icon, { color: getTextColor() }]}>{icon}</Text>}
            <Text style={[styles.text, { color: getTextColor(), fontSize: fontMap[size] }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  text: { fontWeight: "600", letterSpacing: 0.3 },
  icon: { fontSize: 18, marginRight: 8 },
  fullWidth: { width: "100%" },
});

export default AnimatedButton;
