import { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";

const MessageContainer = ({ onReply, wallpaperStyle }) => {
  const { messages, isLoadingMessages, hasMoreMessages, selectedConversation, fetchMessages, typingUsers } =
    useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLength = useRef(0);

  const typing = typingUsers[selectedConversation?._id] || [];
  const isTyping = typing.filter((id) => id !== user._id).length > 0;

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [selectedConversation?._id]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMessages && messages.length > 0) {
      const oldestMessage = messages[0];
      fetchMessages(selectedConversation._id, oldestMessage.createdAt);
    }
  };

  const groupedMessages = [];
  let lastDateKey = null;

  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (dateKey !== lastDateKey) {
      groupedMessages.push({ type: "date", date: msg.createdAt, key: `date-${dateKey}` });
      lastDateKey = dateKey;
    }
    groupedMessages.push({ type: "message", data: msg, key: msg._id });
  });

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto py-4 transition-all duration-500"
        style={wallpaperStyle}
      >
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-soft flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {groupedMessages.map((item) =>
          item.type === "date" ? (
            <DateSeparator key={item.key} date={item.date} />
          ) : (
            <MessageBubble key={item.key} message={item.data} onReply={onReply} />
          )
        )}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      <button
        onClick={scrollToBottom}
        className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-purple-600 shadow-card transition-all hover:scale-105"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MessageContainer;
