import { motion } from "framer-motion";

const OnlineDot = ({ isOnline, size = "sm" }) => {
  if (!isOnline) return null;

  const sizes = {
    sm: { dot: "w-2.5 h-2.5", ring: "w-3.5 h-3.5" },
    md: { dot: "w-3 h-3", ring: "w-4 h-4" },
    lg: { dot: "w-3.5 h-3.5", ring: "w-4.5 h-4.5" },
  };

  return (
    <span className="absolute bottom-0 right-0 flex items-center justify-center">
      {/* Pulsing ring */}
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`${sizes[size].ring} rounded-full absolute bg-green-400 opacity-20`}
      />
      {/* Main dot */}
      <span className={`${sizes[size].dot} rounded-full bg-green-500 ring-2 ring-white relative z-10 shadow-lg`} />
    </span>
  );
};

export default OnlineDot;
