// For physical Android device testing over Wi-Fi: use your local machine's IP (detected: 192.168.8.197)
const DEV_API_URL = "http://192.168.1.102:5000/api";

// For Android Emulator testing: use loopback address
// const DEV_API_URL = "http://10.0.2.2:5000/api";

const PROD_API_URL = "https://your-production-url.com/api";

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const APP_NAME = "TaskFlow";
export const APP_TAGLINE = "AI-Powered Productivity";

export const REMINDER_FREQUENCIES = [
  { label: "Every 5 min", value: 5, icon: "⏱" },
  { label: "Every 10 min", value: 10, icon: "⏰" },
  { label: "Every 15 min", value: 15, icon: "⏲" },
  { label: "Every 30 min", value: 30, icon: "⌛" },
];

export const CATEGORIES = [
  { label: "Study", value: "study", icon: "📚", color: "#6C63FF" },
  { label: "Work", value: "work", icon: "💼", color: "#2ED573" },
  { label: "Personal", value: "personal", icon: "🧘", color: "#FF6584" },
  { label: "Health", value: "health", icon: "💪", color: "#FFA502" },
  { label: "Other", value: "other", icon: "📌", color: "#636E72" },
];

export const PRIORITIES = [
  { label: "High", value: "high", icon: "🔴", color: "#FF4757" },
  { label: "Medium", value: "medium", icon: "🟡", color: "#FFA502" },
  { label: "Low", value: "low", icon: "🟢", color: "#2ED573" },
];

export const TASK_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
};

export const VIEW_MODES = [
  { label: "List", value: "list", icon: "📋" },
  { label: "Grid", value: "grid", icon: "🔲" },
  { label: "Timeline", value: "timeline", icon: "📅" },
];

export const SORT_OPTIONS = [
  { label: "Due Date", value: "dueDate" },
  { label: "Priority", value: "priority" },
  { label: "Created", value: "createdAt" },
  { label: "Alphabetical", value: "title" },
];
