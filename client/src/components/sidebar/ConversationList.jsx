import ConversationItem from "./ConversationItem";
import SkeletonLoader from "../common/SkeletonLoader";
import useChatStore from "../../store/useChatStore";

const ConversationList = ({ searchQuery }) => {
  const { conversations, selectedConversation, isLoadingConversations } = useChatStore();

  if (isLoadingConversations) return <SkeletonLoader count={8} />;

  const filtered = searchQuery
    ? conversations.filter((c) => {
        const name = c.groupName || c.participants.map((p) => p.fullName).join(", ");
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-[var(--text-secondary)] text-sm">
          {searchQuery ? "No conversations found" : "No conversations yet"}
        </p>
        <p className="text-[var(--text-secondary)] text-xs mt-1">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isSelected={selectedConversation?._id === conversation._id}
        />
      ))}
    </div>
  );
};

export default ConversationList;
