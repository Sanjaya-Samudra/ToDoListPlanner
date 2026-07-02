import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mediumImpact } from "../utils/haptics";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;
const INDICATOR_WIDTH = 24;

const TABS = [
  { key: "DashboardTab", label: "Home", icon: "🏠", activeIcon: "🏡" },
  { key: "TasksTab", label: "Tasks", icon: "📋", activeIcon: "📋" },
  { key: "StatsTab", label: "Stats", icon: "📊", activeIcon: "📊" },
  { key: "AIChat", label: "AI Chat", icon: "🤖", activeIcon: "🤖" },
  { key: "Profile", label: "Profile", icon: "👤", activeIcon: "👤" },
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const indicatorPos = useRef(new Animated.Value(state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2)).current;

  React.useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
      damping: 20,
      stiffness: 200,
      useNativeDriver: false,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBar, borderTopColor: colors.borderLight, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.indicator, { backgroundColor: colors.primary, transform: [{ translateX: indicatorPos }] }]} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tab = TABS.find((t) => t.key === route.name) || TABS[0];

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
              mediumImpact();
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tab}
            >
              <Text style={styles.tabIcon}>{isFocused ? tab.activeIcon : tab.icon}</Text>
              <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textTertiary, fontWeight: isFocused ? "700" : "500" }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 6,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    borderRadius: 2,
  },
  tabRow: { flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 10, letterSpacing: -0.2 },
});

export default CustomTabBar;
