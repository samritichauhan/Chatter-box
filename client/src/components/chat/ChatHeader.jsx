import { Phone, Video, MoreVertical, ArrowLeft, Palette, Trash2, Bell, BellOff, Info, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Avatar from "../common/Avatar";
import OnlineDot from "../common/OnlineDot";
import ContactInfoPanel from "./ContactInfoPanel";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useCallStore from "../../store/useCallStore";
import { getConversationName, getConversationAvatar, getOtherParticipant, formatLastSeen } from "../../lib/utils";
import toast from "react-hot-toast";

const ChatHeader = ({ onBack, onWallpaper }) => {
  const { selectedConversation, onlineUsers, typingUsers, clearMessages } = useChatStore();
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  if (!selectedConversation) return null;

  const { initiateCall } = useCallStore();

  const name = getConversationName(selectedConversation, user._id);
  const avatar = getConversationAvatar(selectedConversation, user._id);
  const other = selectedConversation.type === "private"
    ? getOtherParticipant(selectedConversation, user._id)
    : null;
  const isOnline = other ? onlineUsers[other._id] : false;
  const typing = typingUsers[selectedConversation._id] || [];

  const handleCall = (callType) => {
    if (!other) return; // group calls not supported yet
    initiateCall({ _id: other._id, fullName: other.fullName, avatar: other.avatar }, callType);
  };

  const getStatusText = () => {
    if (typing.length > 0) return "typing...";
    if (selectedConversation.type === "group") {
      return `${selectedConversation.participants.length} members`;
    }
    if (isOnline) return "online";
    if (other?.lastSeen) return `last seen ${formatLastSeen(other.lastSeen)}`;
    return "";
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear all messages? This cannot be undone.")) {
      await clearMessages(selectedConversation._id);
      toast.success("Chat history cleared");
      setShowMenu(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Notifications enabled" : "Notifications muted");
    setShowMenu(false);
  };

  const menuItems = [
    {
      icon: Info,
      label: selectedConversation.type === "group" ? "Group Info" : "Contact Info",
      action: () => {
        setShowInfoPanel(true);
        setShowMenu(false);
      },
      color: "text-blue-500",
    },
    {
      icon: Search,
      label: "Search in chat",
      action: () => {
        toast.success("Search feature coming soon!");
        setShowMenu(false);
      },
      color: "text-indigo-500",
    },
    {
      icon: isMuted ? Bell : BellOff,
      label: isMuted ? "Unmute notifications" : "Mute notifications",
      action: handleToggleMute,
      color: "text-orange-500",
    },
    {
      icon: Trash2,
      label: "Clear chat history",
      action: handleClearChat,
      color: "text-red-500",
    },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <Avatar src={avatar} name={name} size="md" />
          {selectedConversation.type === "private" && <OnlineDot isOnline={isOnline} />}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-800">{name}</h3>
          <p className={`text-xs ${typing.length > 0 ? "text-purple-600 font-medium" : "text-gray-400"}`}>
            {getStatusText()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCall("audio")}
          disabled={!other}
          className="relative p-2.5 rounded-xl text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
          title="Voice call"
        >
          <div className="absolute inset-0 rounded-xl bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Phone className="w-5 h-5 relative z-10" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCall("video")}
          disabled={!other}
          className="relative p-2.5 rounded-xl text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
          title="Video call"
        >
          <div className="absolute inset-0 rounded-xl bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Video className="w-5 h-5 relative z-10" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onWallpaper}
          className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
          title="Change wallpaper"
        >
          <Palette className="w-5 h-5" />
        </motion.button>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-40"
                >
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={item.action}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ContactInfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        conversation={selectedConversation}
        isCurrentUser={false}
      />
    </div>
  );
};

export default ChatHeader;
