import React, { useEffect, useState, useRef } from "react";
import { Animated, Text } from "react-native";

const AnimatedNumber = ({ value, style, duration = 800 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: value, duration, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);
  return <Text style={style}>{display}</Text>;
};

export default AnimatedNumber;
