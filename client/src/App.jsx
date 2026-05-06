import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import useAuthStore from "./store/useAuthStore";
import useTheme from "./hooks/useTheme";
import { Loader2 } from "lucide-react";

const App = () => {
  const { user, isLoading, checkAuth } = useAuthStore();

  useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center auth-gradient">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <p className="text-indigo-200 text-sm font-medium">Loading ChatterBox...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#1a1a2e",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            fontSize: "14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
          duration: 3000,
        }}
      />
    </>
  );
};

export default App;
