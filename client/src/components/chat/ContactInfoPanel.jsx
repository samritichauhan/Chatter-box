import { X, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../common/Avatar";
import useAuthStore from "../../store/useAuthStore";
import api from "../../lib/api";
import toast from "react-hot-toast";

const ContactInfoPanel = ({ isOpen, onClose, conversation, isCurrentUser }) => {
  const { user: currentUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!conversation) return null;

  const isPrivate = conversation.type === "private";
  const contactUser = isPrivate 
    ? conversation.participants.find(p => p._id !== currentUser._id)
    : null;

  const displayUser = isCurrentUser ? currentUser : contactUser;

  if (!displayUser) return null;

  const handleAvatarClick = () => {
    if (isCurrentUser) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      await api.put("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to update profile picture");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            className="info-panel fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="info-section sticky top-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
              <h2 className="font-semibold text-gray-800">
                {isCurrentUser ? "Your Profile" : "Contact Info"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div
                    onClick={handleAvatarClick}
                    className={`w-24 h-24 rounded-full overflow-hidden shadow-lg ${
                      isCurrentUser && !isUploading ? "cursor-pointer" : ""
                    }`}
                  >
                    <img
                      src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.fullName)}`}
                      alt={displayUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isCurrentUser && (
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {displayUser.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">@{displayUser.username}</p>
                </div>

                {/* About */}
                {displayUser.about && (
                  <div className="about-box p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{displayUser.about}</p>
                  </div>
                )}

                {/* Contact Details */}
                <div className="info-section space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="detail-icon p-2 rounded-lg bg-purple-100">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{displayUser.email}</p>
                    </div>
                  </div>

                  {displayUser.phone && (
                    <div className="flex items-center gap-3">
                      <div className="detail-icon p-2 rounded-lg bg-blue-100">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{displayUser.phone}</p>
                      </div>
                    </div>
                  )}

                  {displayUser.lastSeen && (
                    <div className="flex items-center gap-3">
                      <div className="detail-icon p-2 rounded-lg bg-green-100">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Seen</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(displayUser.lastSeen)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Group Members (if group chat) */}
              {!isPrivate && (
                <div className="info-section pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Members</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {conversation.participants.map((member) => (
                      <div
                        key={member._id}
                        className="member-item flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <img
                          src={
                            member.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}`
                          }
                          alt={member.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {member.email || `@${member.username}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactInfoPanel;
