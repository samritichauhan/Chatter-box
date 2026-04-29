import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { MessageSquare } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-glow">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-white tracking-tight">
            ChatterBox
          </h1>
          <p className="text-indigo-200 text-sm mt-2">
            {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          {/* Tabs */}
          <div className="flex mb-7 bg-gray-100 rounded-2xl p-1.5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLogin ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-indigo-300/60 text-xs mt-6">
          Secure, fast, and beautiful messaging
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
