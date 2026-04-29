import { motion, AnimatePresence } from "framer-motion";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, danger = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-semibold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-md ${
                  danger
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25"
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
