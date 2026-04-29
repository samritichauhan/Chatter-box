import { useState, useEffect } from "react";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import useChatStore from "../../store/useChatStore";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const { fetchConversations } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <>
      <div className="w-full md:w-[380px] h-full flex flex-col bg-[#1e1b4b] border-r border-white/5">
        <SidebarHeader onNewChat={() => setShowNewChat(true)} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <ConversationList searchQuery={searchQuery} />
      </div>
      <NewChatModal isOpen={showNewChat} onClose={() => setShowNewChat(false)} />
    </>
  );
};

export default Sidebar;
