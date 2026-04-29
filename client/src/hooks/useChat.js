import { useEffect } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import api from "../lib/api";

const useChat = () => {
  const { user } = useAuthStore();
  const { selectedConversation } = useChatStore();

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      api.post(`/messages/read/${selectedConversation._id}`).catch(() => {});
    }
  }, [selectedConversation?._id, user]);
};

export default useChat;
