import { X, Ban, Star, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../common/Avatar";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import { getConversationName, getConversationAvatar, getOtherParticipant } from "../../lib/utils";

const ContactInfoPanel = ({ isOpen, onClose }) => {
  const { selectedConversation } = useChatStore();
  const { user } = useAuthStore();

  if (!selectedConversation) return null;

  const name = getConversationName(selectedConversation, user._id);
  const avatar = getConversationAvatar(selectedConversation, user._id);
  const other =
    selectedConversation.type === "private"
      ? getOtherParticipant(selectedConversation, user._id)
      : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="w-80 h-full bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="font-heading font-semibold text-[var(--text-primary)]">
              Contact Info
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar & Name */}
          <div className="flex flex-col items-center py-8 px-4">
            <Avatar src={avatar} name={name} size="2xl" />
            <h2 className="mt-4 font-heading font-semibold text-lg text-[var(--text-primary)]">
              {name}
            </h2>
            {other && (
              <p className="text-sm text-[var(--text-secondary)]">@{other.username}</p>
            )}
            {other?.about && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">
                {other.about}
              </p>
            )}
          </div>

          {/* Group Members */}
          {selectedConversation.type === "group" && (
            <div className="px-4 py-3 border-t border-[var(--border)]">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Members ({selectedConversation.participants.length})
              </h4>
              <div className="space-y-2">
                {selectedConversation.participants.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 py-1">
                    <Avatar src={p.avatar} name={p.fullName} size="sm" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{p.fullName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">@{p.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 mt-auto border-t border-[var(--border)]">
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] text-sm">
              <Star className="w-4 h-4" />
              Starred Messages
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] text-sm">
              <ImageIcon className="w-4 h-4" />
              Shared Media
            </button>
            {other && (
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-danger text-sm mt-2">
                <Ban className="w-4 h-4" />
                Block {other.fullName}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactInfoPanel;
