import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resetData, setResetData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setResetData(res.data);
      setIsSent(true);
      toast.success("Reset link generated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Check your email</h3>
          <p className="text-sm text-gray-500 mt-2">
            A password reset link has been sent to <strong>{email}</strong>
          </p>
        </div>
        {resetData?.resetToken && (
          <div className="p-3 bg-gray-50 rounded-xl text-left">
            <p className="text-xs text-gray-500 mb-1">Reset link (dev mode):</p>
            <a
              href={resetData.resetUrl}
              className="text-xs text-purple-600 break-all hover:underline"
            >
              {resetData.resetUrl}
            </a>
          </div>
        )}
        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Forgot Password?</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Send Reset Link"
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
