import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

const useAuth = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return { isLoading };
};

export default useAuth;
