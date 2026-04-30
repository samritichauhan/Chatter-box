import { motion } from "framer-motion";

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 shadow-sm">
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-500"
        />
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500"
        />
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-500"
        />
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
