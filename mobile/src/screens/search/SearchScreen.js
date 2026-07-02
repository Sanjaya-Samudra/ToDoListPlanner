import React, { useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../hooks/useTasks";
import TaskCard from "../../components/TaskCard";
import EmptyState from "../../components/EmptyState";
import PremiumSearchBar from "../../components/PremiumSearchBar";
import AnimatedBackground from "../../components/AnimatedBackground";
import { mediumImpact } from "../../utils/haptics";

const recentSearches = ["AI assignment", "study for exam", "buy groceries", "team meeting"];

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim()) {
      const filtered = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(text.toLowerCase()) ||
          t.description?.toLowerCase().includes(text.toLowerCase()) ||
          t.category?.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  const handleRecent = (term) => {
    setQuery(term);
    handleSearch(term);
    mediumImpact();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground intensity={0.3} />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient colors={[c.primary + "10", "transparent"]} style={styles.headerGlow} />
        <PremiumSearchBar value={query} onChangeText={handleSearch} onSubmit={() => {}} placeholder="Search tasks..." icon="🔍" />
      </Animated.View>

      {!searched && results.length === 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.recentTitle, { color: c.text }]}>Recent Searches</Text>
          <View style={styles.chipsRow}>
            {recentSearches.map((term, i) => (
              <TouchableOpacity key={i} style={[styles.chip, { backgroundColor: c.glass, borderColor: c.glassBorder }]} onPress={() => handleRecent(term)}>
                <Text style={[styles.chipText, { color: c.text }]}>🕐 {term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <TaskCard task={item} index={index} onPress={(t) => navigation.navigate("TaskDetail", { task: t })} />
          )}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={<EmptyState variant="search" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 12, position: "relative" },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 80, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  recentSection: { flex: 1, padding: 16 },
  recentTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
  listContent: { paddingTop: 4, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: "center" },
});

export default SearchScreen;
