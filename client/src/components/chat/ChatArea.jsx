import { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageContainer from "./MessageContainer";
import MessageInput from "./MessageInput";
import WallpaperPicker, { WALLPAPERS } from "./WallpaperPicker";
import useChatStore from "../../store/useChatStore";
import { MessageSquare } from "lucide-react";

const STORAGE_KEY = "chatWallpapers"; // { [conversationId]: wallpaperId }

const getStoredWallpapers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const NoChatSelected = () => (
  <div className="no-chat-bg flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/30 text-center px-4">
    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-glow">
      <MessageSquare className="w-14 h-14 text-white" />
    </div>
    <h2 className="font-heading text-3xl font-bold text-gray-800 mb-2">
      Chatter<span className="gradient-text">Box</span>
    </h2>
    <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
      Select a conversation or start a new chat to begin messaging. Your messages are private and secure.
    </p>
    <div className="flex items-center gap-6 mt-8">
      <div className="flex flex-col items-center gap-1">
        <div className="feature-icon w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <span className="text-lg">💬</span>
        </div>
        <span className="feature-label text-[10px] text-gray-400">Chat</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="feature-icon w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <span className="text-lg">📷</span>
        </div>
        <span className="feature-label text-[10px] text-gray-400">Media</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="feature-icon w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <span className="text-lg">📞</span>
        </div>
        <span className="feature-label text-[10px] text-gray-400">Calls</span>
      </div>
    </div>
  </div>
);

const ChatArea = ({ onBack }) => {
  const { selectedConversation } = useChatStore();
  const [replyTo, setReplyTo] = useState(null);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [wallpaperId, setWallpaperId] = useState("default");

  // Load wallpaper for selected conversation from localStorage
  useEffect(() => {
    if (!selectedConversation?._id) return;
    const stored = getStoredWallpapers();
    setWallpaperId(stored[selectedConversation._id] || "default");
  }, [selectedConversation?._id]);

  const handleSelectWallpaper = (id) => {
    setWallpaperId(id);
    if (!selectedConversation?._id) return;
    const stored = getStoredWallpapers();
    stored[selectedConversation._id] = id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  };

  const wallpaperStyle =
    WALLPAPERS.find((w) => w.id === wallpaperId)?.style || WALLPAPERS[0].style;

  if (!selectedConversation) return <NoChatSelected />;

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <ChatHeader onBack={onBack} onWallpaper={() => setShowWallpaperPicker(true)} />
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageContainer onReply={setReplyTo} wallpaperStyle={wallpaperStyle} />
      </div>
      <div className="flex-shrink-0">
        <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      </div>

      <WallpaperPicker
        isOpen={showWallpaperPicker}
        currentWallpaperId={wallpaperId}
        onSelect={handleSelectWallpaper}
        onClose={() => setShowWallpaperPicker(false)}
      />
    </div>
  );
};

export default ChatArea;
