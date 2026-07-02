import React, { useRef, useState } from "react";
import { View, TextInput, Text, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const AnimatedInput = ({ label, value, onChangeText, placeholder, secureTextEntry, multiline, error, keyboardType, icon, autoCapitalize }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const labelStyle = {
    position: "absolute",
    left: icon ? 44 : 16,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [multiline ? 16 : 15, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textTertiary, focused ? colors.primary : colors.textSecondary],
    }),
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={labelStyle}>{label || placeholder}</Animated.Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : focused ? colors.primary : colors.border, borderWidth: focused ? 1.5 : 1 }]}>
        {icon && <Text style={[styles.icon, { color: focused ? colors.primary : colors.textTertiary }]}>{icon}</Text>}
        <TextInput
          style={[styles.input, { color: colors.text, minHeight: multiline ? 100 : 48 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={focused ? placeholder : ""}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingTop: 2,
  },
  icon: { fontSize: 18, paddingLeft: 14 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontWeight: "500" },
  error: { fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: "500" },
});

export default AnimatedInput;
