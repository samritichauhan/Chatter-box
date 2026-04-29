import { useState } from "react";
import { X, Search, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import useChatStore from "../../store/useChatStore";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const NewChatModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { createConversation, createGroup } = useChatStore();

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    if (isGroupMode) {
      const exists = selectedUsers.find((u) => u._id === user._id);
      if (exists) {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      const conversation = await createConversation(user._id);
      if (conversation) onClose();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedUsers.length < 1) return toast.error("Add at least 1 member");

    const result = await createGroup({
      groupName: groupName.trim(),
      participants: selectedUsers.map((u) => u._id),
    });

    if (result) {
      onClose();
      setGroupName("");
      setSelectedUsers([]);
      setIsGroupMode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
              <h3 className="font-heading font-semibold text-white text-lg">
                {isGroupMode ? "New Group" : "New Chat"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsGroupMode(!isGroupMode);
                    setSelectedUsers([]);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    isGroupMode ? "bg-white/25 text-white" : "text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                  title={isGroupMode ? "Private chat" : "Create group"}
                >
                  <Users className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/15 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Group name */}
            {isGroupMode && (
              <div className="px-5 pt-4">
                <input
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedUsers.map((u) => (
                      <span
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                      >
                        {u.fullName}
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search */}
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : results.length > 0 ? (
                results.map((user) => {
                  const isSelected = selectedUsers.some((u) => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-purple-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar src={user.avatar} name={user.fullName} size="md" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : search.length >= 2 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  No users found
                </p>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">
                  Type to search for users
                </p>
              )}
            </div>

            {/* Create group button */}
            {isGroupMode && selectedUsers.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={handleCreateGroup}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/25"
                >
                  Create Group ({selectedUsers.length} members)
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
