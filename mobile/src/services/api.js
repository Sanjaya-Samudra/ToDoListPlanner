import axios from "axios";
import { API_URL } from "../constants/config";

const MOCK_TASKS = [
  { _id: "1", title: "Design new landing page", description: "Create wireframes and mockups for the redesigned homepage", priority: "high", status: "in_progress", category: "work", dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { _id: "2", title: "Review team pull requests", description: "Check code quality and merge pending PRs", priority: "medium", status: "todo", category: "work", dueDate: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date().toISOString() },
  { _id: "3", title: "Gym session", description: "Cardio and strength training", priority: "low", status: "completed", category: "health", dueDate: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date().toISOString() },
  { _id: "4", title: "Buy groceries", description: "Milk, eggs, bread, vegetables", priority: "low", status: "todo", category: "personal", dueDate: new Date(Date.now() + 43200000).toISOString(), createdAt: new Date().toISOString() },
  { _id: "5", title: "Prepare presentation slides", description: "Quarterly review deck for stakeholders", priority: "high", status: "in_progress", category: "work", dueDate: new Date(Date.now() + 259200000).toISOString(), createdAt: new Date().toISOString() },
  { _id: "6", title: "Study React Native animations", description: "Learn Reanimated 3 and gesture handler", priority: "medium", status: "todo", category: "study", dueDate: new Date(Date.now() + 604800000).toISOString(), createdAt: new Date().toISOString() },
  { _id: "7", title: "Team standup meeting", description: "Daily sync with the dev team", priority: "medium", status: "completed", category: "work", dueDate: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: "8", title: "Fix login screen bug", description: "Users reporting blank screen on password reset", priority: "high", status: "todo", category: "work", dueDate: new Date(Date.now() + 3600000).toISOString(), createdAt: new Date().toISOString() },
];

const MOCK_STATS = {
  total: 24,
  completed: 14,
  pending: 5,
  percentage: 58,
  productivityScore: 72,
  streak: 8,
  weeklyData: [5, 8, 6, 12, 9, 7, 14],
  categoryBreakdown: { work: 12, personal: 5, health: 3, study: 4 },
};

const isDemoable = (config) => {
  return config?.url?.startsWith("/tasks") || config?.url?.startsWith("/auth/profile");
};

const mockResponse = (config) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();

  if (url === "/tasks/today") return { data: MOCK_TASKS.filter((t) => t.status !== "completed").slice(0, 4) };
  if (url === "/tasks/week") return { data: MOCK_TASKS };
  if (url === "/tasks/progress") return { data: MOCK_STATS };
  if (url?.startsWith("/tasks/") && method === "patch" && url?.endsWith("/status")) return { data: { ...MOCK_TASKS[0], status: "completed" } };
  if (url === "/tasks") return { data: MOCK_TASKS };
  if (url?.startsWith("/auth/profile") && method === "put") return { data: { user: { _id: "demo", name: "Alex Turner", email: "demo@taskflow.app" } } };
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] Unauthorized");
    }
    if (!error.response && isDemoable(error.config)) {
      const mock = mockResponse(error.config);
      if (mock) return Promise.resolve(mock);
    }
    return Promise.reject(error);
  }
);

export default api;
