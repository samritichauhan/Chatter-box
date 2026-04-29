import { Phone, Video, MoreVertical, ArrowLeft, Palette } from "lucide-react";
import Avatar from "../common/Avatar";
import OnlineDot from "../common/OnlineDot";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useCallStore from "../../store/useCallStore";
import { getConversationName, getConversationAvatar, getOtherParticipant, formatLastSeen } from "../../lib/utils";

const ChatHeader = ({ onBack, onWallpaper }) => {
  const { selectedConversation, onlineUsers, typingUsers } = useChatStore();
  const { user } = useAuthStore();

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
        <button
          onClick={() => handleCall("audio")}
          disabled={!other}
          className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleCall("video")}
          disabled={!other}
          className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          onClick={onWallpaper}
          className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
          title="Change wallpaper"
        >
          <Palette className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
