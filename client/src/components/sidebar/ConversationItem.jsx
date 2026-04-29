import Avatar from "../common/Avatar";
import OnlineDot from "../common/OnlineDot";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import { formatTime } from "../../lib/utils";
import { getConversationName, getConversationAvatar, getOtherParticipant } from "../../lib/utils";

const ConversationItem = ({ conversation, isSelected }) => {
  const { selectConversation, onlineUsers, unreadCounts } = useChatStore();
  const { user } = useAuthStore();

  const name = getConversationName(conversation, user._id);
  const avatar = getConversationAvatar(conversation, user._id);
  const other = conversation.type === "private"
    ? getOtherParticipant(conversation, user._id)
    : null;
  const isOnline = other ? onlineUsers[other._id] : false;
  const unread = unreadCounts[conversation._id] || 0;
  const lastMsg = conversation.lastMessage;

  const getLastMessagePreview = () => {
    if (!lastMsg) return "No messages yet";
    if (lastMsg.isDeleted) return "This message was deleted";
    if (lastMsg.messageType === "image") return "Photo";
    if (lastMsg.messageType === "video") return "Video";
    if (lastMsg.messageType === "audio" || lastMsg.messageType === "voice-note") return "Audio";
    if (lastMsg.messageType === "document") return "Document";
    return lastMsg.content || "";
  };

  return (
    <div
      onClick={() => selectConversation(conversation)}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "conv-active bg-purple-500/10"
          : "hover:bg-white/5 border-l-3 border-transparent"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={avatar} name={name} size="lg" />
        {conversation.type === "private" && <OnlineDot isOnline={isOnline} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-white truncate">
            {name}
          </h3>
          {lastMsg && (
            <span className="text-[11px] text-indigo-300/60 flex-shrink-0 ml-2 font-mono">
              {formatTime(lastMsg.createdAt || conversation.updatedAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-indigo-300/50 truncate">
            {getLastMessagePreview()}
          </p>
          {unread > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] flex items-center justify-center font-bold unread-pulse">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
