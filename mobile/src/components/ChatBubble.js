import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { formatRelativeTime } from "../utils/dateHelpers";

const ChatBubble = ({ message, isUser, timestamp }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>🤖</Text>
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.aiBubble, { backgroundColor: colors.glass, borderColor: colors.glassBorder }],
          ]}
        >
          <Text style={[styles.text, { color: isUser ? "#fff" : colors.text }]}>{message}</Text>
        </View>
        {timestamp && (
          <Text style={[styles.timestamp, { color: colors.textTertiary, textAlign: isUser ? "right" : "left" }]}>
            {formatRelativeTime(timestamp)}
          </Text>
        )}
      </View>
      {isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.secondary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.secondary }]}>U</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginVertical: 4, paddingHorizontal: 16, gap: 8 },
  userContainer: { justifyContent: "flex-end" },
  aiContainer: { justifyContent: "flex-start" },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 4 },
  avatarText: { fontSize: 12, fontWeight: "700" },
  bubbleWrapper: { maxWidth: "72%" },
  bubble: { padding: 14, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  text: { fontSize: 15, lineHeight: 21 },
  timestamp: { fontSize: 10, marginTop: 4, fontWeight: "500" },
});

export default ChatBubble;
