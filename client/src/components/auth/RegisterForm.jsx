import { useState } from "react";
import { Mail, Lock, User, AtSign, Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const { register, isRegistering } = useAuthStore();

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#eab308", "#22c55e", "#16a34a"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    const result = await register(formData);
    if (!result.success) {
      toast.error(result.message);
    }
  };

  const inputClass =
    "w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Full name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <div className="relative">
        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value.toLowerCase() })
          }
          className={inputClass}
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password (min 6 characters)"
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

      {formData.password && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i <= strength ? strengthColors[strength] : "#e5e7eb",
                }}
              />
            ))}
          </div>
          <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
            {strengthLabels[strength]}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isRegistering}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
      >
        {isRegistering ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
