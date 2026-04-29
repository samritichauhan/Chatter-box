import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import CallScreen from "../components/calls/CallScreen";
import IncomingCallModal from "../components/calls/IncomingCallModal";
import useChatStore from "../store/useChatStore";
import useCallStore from "../store/useCallStore";
import useSocket from "../hooks/useSocket";
import useChat from "../hooks/useChat";
import useCall from "../hooks/useCall";

const HomePage = () => {
  const { selectedConversation } = useChatStore();
  const { acceptCall, rejectCall } = useCallStore();
  const [showSidebar, setShowSidebar] = useState(true);

  useSocket();
  useChat();
  useCall();

  const handleSelectChat = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBack = () => {
    setShowSidebar(true);
    useChatStore.getState().selectConversation(null);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden"
        } md:flex flex-shrink-0`}
        onClick={handleSelectChat}
      >
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div
        className={`${
          !showSidebar || selectedConversation ? "flex" : "hidden"
        } md:flex flex-1 min-w-0`}
      >
        <ChatArea onBack={handleBack} />
      </div>

      {/* Call overlays */}
      <CallScreen />
      <IncomingCallModal onAccept={acceptCall} onReject={rejectCall} />
    </div>
  );
};

export default HomePage;
