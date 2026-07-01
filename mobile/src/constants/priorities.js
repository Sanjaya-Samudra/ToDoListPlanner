export const PRIORITY_MAP = {
  high: { label: "High", color: "#FF4757", icon: "🔴", value: 3 },
  medium: { label: "Medium", color: "#FFA502", icon: "🟡", value: 2 },
  low: { label: "Low", color: "#2ED573", icon: "🟢", value: 1 },
};

export const CATEGORY_MAP = {
  study: { label: "Study", color: "#6C63FF", icon: "📚" },
  work: { label: "Work", color: "#2ED573", icon: "💼" },
  personal: { label: "Personal", color: "#FF6584", icon: "🧘" },
  health: { label: "Health", color: "#FFA502", icon: "💪" },
  other: { label: "Other", color: "#636E72", icon: "📌" },
};

export const getPriorityColor = (priority) => PRIORITY_MAP[priority]?.color || "#999";
export const getPriorityIcon = (priority) => PRIORITY_MAP[priority]?.icon || "⚪";
export const getCategoryColor = (category) => CATEGORY_MAP[category]?.color || "#999";
export const getCategoryIcon = (category) => CATEGORY_MAP[category]?.icon || "📌";

export const formatTaskDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days}d left`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
