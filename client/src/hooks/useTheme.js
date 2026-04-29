import { useEffect } from "react";
import useThemeStore from "../store/useThemeStore";

const useTheme = () => {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);
};

export default useTheme;
