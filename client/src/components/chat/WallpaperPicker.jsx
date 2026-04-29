import { useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const WALLPAPERS = [
  // --- Solids ---
  {
    id: "default",
    label: "Default",
    style: {
      backgroundColor: "#e5ddd5",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    },
    preview: "#e5ddd5",
    category: "solid",
  },
  {
    id: "white",
    label: "White",
    style: { backgroundColor: "#ffffff" },
    preview: "#ffffff",
    category: "solid",
  },
  {
    id: "sand",
    label: "Sand",
    style: { backgroundColor: "#fef3c7" },
    preview: "#fef3c7",
    category: "solid",
  },
  {
    id: "blush",
    label: "Blush",
    style: { backgroundColor: "#fce7f3" },
    preview: "#fce7f3",
    category: "solid",
  },
  {
    id: "mint",
    label: "Mint",
    style: { backgroundColor: "#d1fae5" },
    preview: "#d1fae5",
    category: "solid",
  },
  {
    id: "sky",
    label: "Sky",
    style: { backgroundColor: "#dbeafe" },
    preview: "#dbeafe",
    category: "solid",
  },
  {
    id: "lavender",
    label: "Lavender",
    style: { backgroundColor: "#ede9fe" },
    preview: "#ede9fe",
    category: "solid",
  },
  {
    id: "midnight",
    label: "Midnight",
    style: { backgroundColor: "#131226" },
    preview: "#131226",
    category: "solid",
  },
  {
    id: "slate",
    label: "Slate",
    style: { backgroundColor: "#1e293b" },
    preview: "#1e293b",
    category: "solid",
  },
  {
    id: "charcoal",
    label: "Charcoal",
    style: { backgroundColor: "#374151" },
    preview: "#374151",
    category: "solid",
  },

  // --- Gradients ---
  {
    id: "grad-purple",
    label: "Aurora",
    style: { backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    preview: "linear-gradient(135deg, #667eea, #764ba2)",
    category: "gradient",
  },
  {
    id: "grad-sunset",
    label: "Sunset",
    style: { backgroundImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    preview: "linear-gradient(135deg, #f093fb, #f5576c)",
    category: "gradient",
  },
  {
    id: "grad-ocean",
    label: "Ocean",
    style: { backgroundImage: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    preview: "linear-gradient(135deg, #4facfe, #00f2fe)",
    category: "gradient",
  },
  {
    id: "grad-forest",
    label: "Forest",
    style: { backgroundImage: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    preview: "linear-gradient(135deg, #43e97b, #38f9d7)",
    category: "gradient",
  },
  {
    id: "grad-golden",
    label: "Golden",
    style: { backgroundImage: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
    preview: "linear-gradient(135deg, #f7971e, #ffd200)",
    category: "gradient",
  },
  {
    id: "grad-rose",
    label: "Rose",
    style: { backgroundImage: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
    preview: "linear-gradient(135deg, #ff9a9e, #fecfef)",
    category: "gradient",
  },
  {
    id: "grad-night",
    label: "Night",
    style: { backgroundImage: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
    preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    category: "gradient",
  },
  {
    id: "grad-candy",
    label: "Candy",
    style: { backgroundImage: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
    preview: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    category: "gradient",
  },

  // --- Patterns ---
  {
    id: "pat-dots",
    label: "Dots",
    style: {
      backgroundColor: "#e8f4f8",
      backgroundImage:
        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
    preview: "radial-gradient(circle, #94a3b8 1px, transparent 1px), #e8f4f8",
    category: "pattern",
  },
  {
    id: "pat-grid",
    label: "Grid",
    style: {
      backgroundColor: "#f8fafc",
      backgroundImage:
        "linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    },
    preview: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), #f8fafc",
    category: "pattern",
  },
  {
    id: "pat-diagonal",
    label: "Lines",
    style: {
      backgroundColor: "#fdf6e3",
      backgroundImage:
        "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 11px)",
    },
    preview: "repeating-linear-gradient(45deg, transparent 10px, rgba(0,0,0,0.15) 11px), #fdf6e3",
    category: "pattern",
  },
  {
    id: "pat-bubbles",
    label: "Bubbles",
    style: {
      backgroundColor: "#e0f2fe",
      backgroundImage:
        "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.08) 0%, transparent 60%)",
    },
    preview: "radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.4), transparent), #e0f2fe",
    category: "pattern",
  },
];

const CATEGORIES = [
  { key: "solid", label: "Colors" },
  { key: "gradient", label: "Gradients" },
  { key: "pattern", label: "Patterns" },
];

const WallpaperPicker = ({ isOpen, currentWallpaperId, onSelect, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            ref={ref}
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">Chat Wallpaper</h2>
                <p className="text-xs text-gray-400 mt-0.5">Choose a background for this chat</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallpaper grid by category */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {CATEGORIES.map((cat) => {
                const items = WALLPAPERS.filter((w) => w.category === cat.key);
                return (
                  <div key={cat.key}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                      {cat.label}
                    </p>
                    <div className="grid grid-cols-5 gap-2.5">
                      {items.map((wp) => {
                        const isActive = currentWallpaperId === wp.id;
                        return (
                          <button
                            key={wp.id}
                            onClick={() => onSelect(wp.id)}
                            title={wp.label}
                            className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                              isActive
                                ? "ring-2 ring-purple-500 ring-offset-2 scale-95"
                                : "hover:scale-105 hover:shadow-md"
                            }`}
                            style={{ background: wp.preview }}
                          >
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Check className="w-4 h-4 text-white drop-shadow" />
                              </div>
                            )}
                            <span className="sr-only">{wp.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WallpaperPicker;
