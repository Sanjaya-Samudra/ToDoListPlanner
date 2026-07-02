import React, { useRef, useState } from "react";
import { View, TextInput, Text, Animated, StyleSheet, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";

const AnimatedInput = ({ label, value, onChangeText, secureTextEntry, multiline, error, keyboardType, icon, autoCapitalize }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isActive = focused || value;

  const handleFocus = () => {
    setFocused(true);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    }
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const webFocusStyle = Platform.OS === "web" ? { outline: "none" } : {};

  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, { backgroundColor: colors.inputBg }, webFocusStyle]}>
        {icon && <Text style={[styles.icon, { color: isActive ? colors.primary : colors.textTertiary }]}>{icon}</Text>}
        <View style={styles.fieldArea}>
          <Animated.Text style={[styles.label, { color: isActive ? colors.primary : colors.textTertiary, top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }), fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] }) }]}>
            {label}
          </Animated.Text>
          <TextInput
            style={[styles.input, { color: colors.text, minHeight: multiline ? 100 : 48, paddingTop: isActive ? 18 : 14 }, webFocusStyle]}
            value={value}
            onChangeText={onChangeText}
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
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  wrapper: { flexDirection: "row", borderRadius: 14, alignItems: "flex-start" },
  icon: { fontSize: 17, paddingLeft: 14, paddingTop: 16 },
  fieldArea: { flex: 1, paddingHorizontal: 14 },
  label: { fontWeight: "600", letterSpacing: 0.2 },
  input: { fontSize: 15, fontWeight: "500", paddingBottom: 12 },
  error: { fontSize: 11, marginTop: 4, marginLeft: 4, fontWeight: "500" },
});

export default AnimatedInput;
