import { create } from "zustand";
import api from "../lib/api";

const useChatStore = create((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  hasMoreMessages: true,
  typingUsers: {},
  onlineUsers: {},
  unreadCounts: {},

  setOnlineUsers: (userId, isOnline) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    }));
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await api.get("/conversations");
      set({ conversations: res.data });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: (conversation) => {
    set({
      selectedConversation: conversation,
      messages: [],
      hasMoreMessages: true,
    });
    if (conversation) {
      get().fetchMessages(conversation._id);
    }
  },

  fetchMessages: async (conversationId, cursor) => {
    set({ isLoadingMessages: true });
    try {
      const params = cursor ? `?cursor=${cursor}&limit=50` : "?limit=50";
      const res = await api.get(`/messages/${conversationId}${params}`);
      const newMessages = res.data;

      set((state) => ({
        messages: cursor ? [...newMessages, ...state.messages] : newMessages,
        hasMoreMessages: newMessages.length === 50,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (data) => {
    if (data instanceof FormData) {
      // Use native fetch for file uploads — axios can corrupt the multipart
      // boundary by injecting a Content-Type header before the browser sets it.
      const res = await fetch("/api/messages", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Upload failed (${res.status})`);
      }
      return res.json();
    }
    // JSON messages — axios handles these fine
    const res = await api.post("/messages", data);
    return res.data;
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });

    // Update conversation's lastMessage
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c._id === message.conversationId
            ? { ...c, lastMessage: message, updatedAt: new Date() }
            : c
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },

  updateMessage: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === updatedMessage._id ? updatedMessage : m
      ),
    }));
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, content: "This message was deleted" }
          : m
      ),
    }));
  },

  setTypingUser: (conversationId, userId, isTyping) => {
    set((state) => {
      const conversationTyping = state.typingUsers[conversationId] || [];
      const updated = isTyping
        ? [...new Set([...conversationTyping, userId])]
        : conversationTyping.filter((id) => id !== userId);
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    });
  },

  createConversation: async (participantId) => {
    try {
      const res = await api.post("/conversations", { participantId });
      const conversation = res.data;
      set((state) => {
        const exists = state.conversations.some((c) => c._id === conversation._id);
        return {
          conversations: exists
            ? state.conversations
            : [conversation, ...state.conversations],
          selectedConversation: conversation,
        };
      });
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  },

  createGroup: async (data) => {
    try {
      const res = await api.post("/conversations/group", data);
      set((state) => ({
        conversations: [res.data, ...state.conversations],
        selectedConversation: res.data,
      }));
      return res.data;
    } catch (error) {
      console.error("Error creating group:", error);
      return null;
    }
  },

  setUnreadCount: (conversationId, count) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: count },
    }));
  },
}));

export default useChatStore;
