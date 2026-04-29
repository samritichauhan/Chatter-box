import { Sun, Moon } from "lucide-react";
import useThemeStore from "../../store/useThemeStore";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-white/8 text-indigo-300 hover:text-white transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;
