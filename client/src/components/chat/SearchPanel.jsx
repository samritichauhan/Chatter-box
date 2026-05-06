import { X, Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useChatStore from "../../store/useChatStore";
import MessageBubble from "./MessageBubble";

const SearchPanel = ({ isOpen, onClose }) => {
  const { messages, selectedConversation } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return messages
      .filter((msg) => msg.content?.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [searchQuery, messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="info-panel fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="info-section sticky top-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
              <h2 className="font-semibold text-gray-800">Search Chat</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Found {searchResults.length} message{searchResults.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <SearchIcon className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    Type to search in this conversation
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <SearchIcon className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    No messages found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {searchResults.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      {/* Date */}
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(message.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Sender */}
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        {message.sender?.fullName}
                      </p>

                      {/* Message content with highlighting */}
                      <p className="text-sm text-gray-700 break-words">
                        {message.content && (
                          <>
                            {message.content.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <span key={i} className="bg-yellow-300 font-semibold">
                                  {part}
                                </span>
                              ) : (
                                part
                              )
                            )}
                          </>
                        )}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchPanel;
