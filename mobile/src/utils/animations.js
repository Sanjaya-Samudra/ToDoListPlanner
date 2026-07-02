import { Animated } from "react-native";

export const fadeIn = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

export const fadeOut = (value, duration = 200) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

export const slideUp = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

export const slideDown = (value, toValue = 50, duration = 200) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

export const scaleIn = (value, duration = 300) => {
  return Animated.spring(value, {
    toValue: 1,
    damping: 12,
    stiffness: 200,
    useNativeDriver: true,
  });
};

export const stagger = (animations, delay = 80) => {
  return Animated.stagger(
    delay,
    animations.map((anim, i) =>
      Animated.delay(i * delay, Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }))
    )
  );
};

export const createStaggeredAnimations = (count, delay = 80) => {
  const values = Array.from({ length: count }, () => new Animated.Value(0));
  const animate = () => {
    Animated.stagger(
      delay,
      values.map((v) =>
        Animated.spring(v, {
          toValue: 1,
          damping: 14,
          stiffness: 150,
          useNativeDriver: true,
        })
      )
    ).start();
  };
  return { values, animate };
};

export const pulse = (value) => {
  return Animated.sequence([
    Animated.timing(value, { toValue: 1.05, duration: 150, useNativeDriver: true }),
    Animated.timing(value, { toValue: 1, duration: 150, useNativeDriver: true }),
  ]);
};

export const shake = (value) => {
  return Animated.sequence([
    Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -5, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};
