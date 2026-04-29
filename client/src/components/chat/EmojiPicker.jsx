import { useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { motion, AnimatePresence } from "framer-motion";

const EmojiPicker = ({ isOpen, onSelect, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={pickerRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute bottom-full left-0 mb-2 z-10"
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              onSelect(emoji.native);
              onClose();
            }}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmojiPicker;
