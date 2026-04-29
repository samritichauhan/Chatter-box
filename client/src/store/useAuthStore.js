import { create } from "zustand";
import api from "../lib/api";
import socket from "../lib/socket";

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isRegistering: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/check");
      set({ user: res.data });
      socket.connect();
      socket.emit("user:online", { userId: res.data._id });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isRegistering: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ user: res.data });
      socket.connect();
      socket.emit("user:online", { userId: res.data._id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      set({ isRegistering: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ user: res.data });
      socket.connect();
      socket.emit("user:online", { userId: res.data._id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      socket.disconnect();
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },
}));

export default useAuthStore;
