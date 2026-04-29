import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (!result.success) {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
      >
        {isLoggingIn ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
