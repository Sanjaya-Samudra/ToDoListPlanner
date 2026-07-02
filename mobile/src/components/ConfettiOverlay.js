import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const COLORS = ["#6C63FF", "#00D2D3", "#FF6584", "#FFC107", "#2ED573", "#FF6B6B"];
const PIECES = 60;

const ConfettiPiece = ({ startX, startY, color, size, delay, duration }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 300 + Math.random() * 400, useNativeDriver: true })
      ),
    ]).start();
  }, []);

  const tx = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120] });
  const ty = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, -60 - Math.random() * 80, height * 0.4] });
  const opacity = anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const rot = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: startX,
          top: startY,
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
          opacity,
          transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }],
        },
      ]}
    />
  );
};

const ConfettiOverlay = ({ visible = false, x = width / 2, y = height / 2 }) => {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PIECES }).map((_, i) => (
        <ConfettiPiece
          key={i}
          startX={x + (Math.random() - 0.5) * 40}
          startY={y}
          color={COLORS[i % COLORS.length]}
          size={6 + Math.random() * 8}
          delay={Math.random() * 200}
          duration={1500 + Math.random() * 1000}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: { position: "absolute" },
});

export default ConfettiOverlay;
