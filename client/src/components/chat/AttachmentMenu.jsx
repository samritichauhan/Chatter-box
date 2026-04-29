import { Image, FileText, Film, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AttachmentMenu = ({ isOpen, onSelect, onClose, onCamera }) => {
  const fileItems = [
    { icon: Image, label: "Photo", accept: "image/*", color: "text-green-400" },
    { icon: Film, label: "Video", accept: "video/*", color: "text-purple-400" },
    { icon: FileText, label: "Document", accept: ".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar", color: "text-blue-400" },
  ];

  const handleFileSelect = (accept) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) onSelect(file);
    };
    input.click();
    onClose();
  };

  const handleCamera = () => {
    onClose();
    onCamera?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 z-20 p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] shadow-xl"
          >
            <div className="flex gap-2">
              {fileItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleFileSelect(item.accept)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[var(--surface)] transition-colors"
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="text-[10px] text-[var(--text-secondary)]">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleCamera}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[var(--surface)] transition-colors"
              >
                <Camera className="w-6 h-6 text-orange-400" />
                <span className="text-[10px] text-[var(--text-secondary)]">Camera</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AttachmentMenu;
