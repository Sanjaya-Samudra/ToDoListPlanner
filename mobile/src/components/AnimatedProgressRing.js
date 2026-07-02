import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

let Svg, Circle, AnimatedCircle;
try {
  const RNSvg = require("react-native-svg");
  Svg = RNSvg.default || RNSvg.Svg;
  Circle = RNSvg.Circle;
  AnimatedCircle = Circle ? Animated.createAnimatedComponent(Circle) : null;
} catch {
  Svg = View;
  Circle = View;
  AnimatedCircle = View;
}

const AnimatedProgressRing = ({ percentage = 0, size = 120, strokeWidth = 10, label, sublabel, color }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const half = size / 2;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: percentage / 100,
      damping: 15,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const progressColor = color || (percentage >= 80 ? colors.success : percentage >= 40 ? colors.warning : colors.primary);

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={half}
            cy={half}
            r={radius}
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={half}
            cy={half}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${half}, ${half})`}
          />
        </Svg>
        <View style={[styles.centerContent, { width: size, height: size }]}>
          <Text style={[styles.percentage, { color: colors.text }]}>{Math.round(percentage)}%</Text>
          {sublabel && <Text style={[styles.sublabel, { color: colors.textSecondary }]}>{sublabel}</Text>}
        </View>
      </View>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  centerContent: { position: "absolute", top: 0, left: 0, justifyContent: "center", alignItems: "center" },
  percentage: { fontSize: 22, fontWeight: "700" },
  sublabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 10 },
});

export default AnimatedProgressRing;
