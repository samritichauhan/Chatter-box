import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      document.documentElement.classList.toggle("light", newTheme === "light");
      return { theme: newTheme };
    });
  },

  initTheme: () => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    set({ theme });
  },
}));

export default useThemeStore;
