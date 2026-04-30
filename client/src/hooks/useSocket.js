import { useEffect } from "react";
import socket from "../lib/socket";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const useSocket = () => {
  const { user } = useAuthStore();
  const {
    addMessage,
    removeMessage,
    setTypingUser,
    setOnlineUsers,
    selectedConversation,
  } = useChatStore();

  useEffect(() => {
    if (!user) return;

    socket.on("message:received", (message) => {
      addMessage(message);
    });

    socket.on("message:deleted", ({ messageId }) => {
      removeMessage(messageId);
    });

    socket.on("message:edited", (message) => {
      useChatStore.getState().updateMessage(message);
    });

    socket.on("message:cleared", ({ conversationId }) => {
      // Only clear if it's the current conversation
      if (conversationId === selectedConversation?._id) {
        useChatStore.setState({ messages: [] });
      }
    });

    socket.on("message:reacted", ({ messageId, reactions }) => {
      const messages = useChatStore.getState().messages;
      const msg = messages.find((m) => m._id === messageId);
      if (msg) {
        useChatStore.getState().updateMessage({ ...msg, reactions });
      }
    });

    socket.on("message:read", ({ conversationId, userId }) => {
      const messages = useChatStore.getState().messages;
      const updated = messages.map((m) =>
        m.conversationId === conversationId
          ? {
              ...m,
              readBy: [...(m.readBy || []), { userId, readAt: new Date() }],
            }
          : m
      );
      // Batch update only if there were changes
      if (updated !== messages) {
        useChatStore.setState({ messages: updated });
      }
    });

    socket.on("user:statusChanged", ({ userId, isOnline }) => {
      setOnlineUsers(userId, isOnline);
    });

    socket.on("user:typing", ({ conversationId, userId }) => {
      if (userId !== user._id) {
        setTypingUser(conversationId, userId, true);
      }
    });

    socket.on("user:stopTyping", ({ conversationId, userId }) => {
      setTypingUser(conversationId, userId, false);
    });

    return () => {
      socket.off("message:received");
      socket.off("message:deleted");
      socket.off("message:edited");
      socket.off("message:cleared");
      socket.off("message:reacted");
      socket.off("message:read");
      socket.off("user:statusChanged");
      socket.off("user:typing");
      socket.off("user:stopTyping");
    };
  }, [user, selectedConversation?._id]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation) {
      socket.emit("join:conversation", selectedConversation._id);
      return () => {
        socket.emit("leave:conversation", selectedConversation._id);
      };
    }
  }, [selectedConversation?._id]);
};

export default useSocket;
