import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
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
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
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
    await Promise.all([
      AsyncStorage.setItem("@token", data.token),
      AsyncStorage.setItem("@user", JSON.stringify(data.user)),
    ]);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const demoLogin = useCallback(async () => {
    const demoUser = { _id: "demo", name: "Alex Turner", email: "demo@taskflow.app", avatar: null };
    const demoToken = "demo-token-taskflow-2024";
    await Promise.all([
      AsyncStorage.setItem("@token", demoToken),
      AsyncStorage.setItem("@user", JSON.stringify(demoUser)),
    ]);
    api.defaults.headers.common["Authorization"] = `Bearer ${demoToken}`;
    setToken(demoToken);
    setUser(demoUser);
    return demoUser;
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem("@token"),
      AsyncStorage.removeItem("@user"),
    ]);
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const { data: res } = await api.put("/auth/profile", data);
    const updated = res.user;
    await AsyncStorage.setItem("@user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
