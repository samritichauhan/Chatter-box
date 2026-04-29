export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatLastSeen = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return formatDate(date);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const getOtherParticipant = (conversation, currentUserId) => {
  return conversation.participants.find((p) => p._id !== currentUserId);
};

export const getConversationName = (conversation, currentUserId) => {
  if (conversation.type === "group") return conversation.groupName;
  const other = getOtherParticipant(conversation, currentUserId);
  return other?.fullName || "Unknown";
};

export const getConversationAvatar = (conversation, currentUserId) => {
  if (conversation.type === "group") return conversation.groupAvatar;
  const other = getOtherParticipant(conversation, currentUserId);
  return other?.avatar || "";
};
