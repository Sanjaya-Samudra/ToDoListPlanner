import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const CHECK_INTERVAL = 30 * 1000;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivity = useRef(Date.now());
  const inactivityTimer = useRef(null);

  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  const logout = useCallback(async (reason) => {
    if (reason) {
      await AsyncStorage.setItem("@logout_reason", reason);
    }
    await Promise.all([
      AsyncStorage.removeItem("@token"),
      AsyncStorage.removeItem("@user"),
    ]);
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;

    const handleAppState = (nextState) => {
      if (nextState === "active") {
        const elapsed = Date.now() - lastActivity.current;
        if (elapsed > INACTIVITY_TIMEOUT) {
          logout("You have been logged out due to inactivity");
        }
      }
    };
    const subscription = AppState.addEventListener("change", handleAppState);

    inactivityTimer.current = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      if (elapsed > INACTIVITY_TIMEOUT) {
        logout("You have been logged out due to inactivity");
      }
    }, CHECK_INTERVAL);

    return () => {
      subscription.remove();
      if (inactivityTimer.current) clearInterval(inactivityTimer.current);
    };
  }, [token, logout]);

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("@token"),
        AsyncStorage.getItem("@user"),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [loadStoredAuth, logout]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    lastActivity.current = Date.now();
    await AsyncStorage.removeItem("@logout_reason");
    await Promise.all([
      AsyncStorage.setItem("@token", data.token),
      AsyncStorage.setItem("@user", JSON.stringify(data.user)),
    ]);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    lastActivity.current = Date.now();
    await AsyncStorage.removeItem("@logout_reason");
    await Promise.all([
      AsyncStorage.setItem("@token", data.token),
      AsyncStorage.setItem("@user", JSON.stringify(data.user)),
    ]);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (data) => {
    const { data: res } = await api.put("/auth/profile", data);
    const updated = res.user;
    await AsyncStorage.setItem("@user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  }, []);

  const changeEmail = useCallback(async (password, newEmail) => {
    const { data: res } = await api.put("/auth/change-email", { password, newEmail });
    const updated = res.user;
    await AsyncStorage.setItem("@user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, updateActivity, changePassword, changeEmail, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
