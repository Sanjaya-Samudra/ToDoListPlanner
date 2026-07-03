import { useState, useCallback, useRef } from "react";
import api from "../services/api";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  const fetchTasks = useCallback(async (filters = {}, force = false) => {
    const cacheKey = JSON.stringify(filters);
    if (!force && cache.current[cacheKey]) {
      setTasks(cache.current[cacheKey]);
      return cache.current[cacheKey];
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(params ? `/tasks?${params}` : "/tasks");
      cache.current[cacheKey] = data;
      setTasks(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayTasks = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks/today");
      setTasks(data);
    } catch (err) {
      setError("Failed to load today's tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeekTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks/week");
      setTasks(data);
    } catch (err) {
      setError("Failed to load week tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    setTasks((prev) => [data, ...prev]);
    cache.current = {};
    return data;
  }, []);

  const updateTask = useCallback(async (taskId, data) => {
    const { data: updated } = await api.put(`/tasks/${taskId}`, data);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    cache.current = {};
    return updated;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    cache.current = {};
  }, []);

  const toggleStatus = useCallback(async (taskId) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
    cache.current = {};
    return data;
  }, []);

  const toggleTask = toggleStatus;

  const getProgress = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks/progress");
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load progress");
      return { completed: 0, total: 0, percentage: 0 };
    }
  }, []);

  const getCategoryCounts = useCallback(() => {
    const counts = {};
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const getUpcomingDeadlines = useCallback((days = 7) => {
    const now = new Date();
    const deadline = new Date(now.getTime() + days * 86400000);
    return tasks.filter((t) => t.dueDate && t.status === "pending" && new Date(t.dueDate) <= deadline)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  const refresh = useCallback(async (filters = {}) => {
    setRefreshing(true);
    await fetchTasks(filters, true);
    setRefreshing(false);
  }, [fetchTasks]);

  return {
    tasks, loading, refreshing, error,
    fetchTasks, fetchTodayTasks, fetchWeekTasks,
    createTask, updateTask, deleteTask, toggleTask, toggleStatus,
    getProgress, getCategoryCounts, getUpcomingDeadlines,
    refresh, setTasks,
  };
};
