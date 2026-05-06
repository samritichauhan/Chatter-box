import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, Reply, Trash2, Download, File, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/useAuthStore";
import { formatTime, formatFileSize } from "../../lib/utils";
import ImageLightbox from "./ImageLightbox";
import ReplyPreview from "./ReplyPreview";
import api from "../../lib/api";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const QUICK_REACTIONS = ["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDC4D", "\uD83D\uDE4F"];

const MessageBubble = ({ message, onReply }) => {
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const reactionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target)) {
        setShowReactionPicker(false);
        setShowFullPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSent = message.sender?._id === user._id;
  const isSystem = message.messageType === "system";
  const hasMedia = !!message.mediaUrl;
  const isMediaOnly = hasMedia && !message.content;

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="system-msg px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 text-xs shadow-sm border border-gray-100">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div className={`flex ${isSent ? "justify-end" : "justify-start"} px-4 my-1`}>
        <div
          className={`deleted-msg max-w-[70%] px-4 py-2.5 rounded-2xl ${
            isSent ? "bg-purple-100/50 rounded-br-sm" : "bg-gray-100/50 rounded-bl-sm"
          }`}
        >
          <p className="text-sm italic text-gray-400">This message was deleted</p>
        </div>
      </div>
    );
  }

  const getReadStatus = () => {
    if (!isSent) return null;
    const readCount = message.readBy?.length || 0;
    const deliveredCount = message.deliveredTo?.length || 0;

    if (readCount > 1) {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    } else if (deliveredCount > 0) {
      return <CheckCheck className="w-3.5 h-3.5 text-white/60" />;
    }
    return <Check className="w-3.5 h-3.5 text-white/60" />;
  };

  const handleDelete = async (deleteType) => {
    try {
      await api.delete(`/messages/${message._id}`, { data: { deleteType } });
    } catch (error) {
      console.error("Delete error:", error);
    }
    setShowActions(false);
  };

  const handleReact = async (emoji) => {
    try {
      await api.post(`/messages/${message._id}/react`, { emoji });
    } catch (error) {
      console.error("React error:", error);
    }
    setShowReactionPicker(false);
    setShowFullPicker(false);
    setShowActions(false);
  };

  const renderMedia = () => {
    switch (message.messageType) {
      case "image":
        return (
          <>
            <div
              className="relative overflow-hidden rounded-xl cursor-pointer group/img"
              onClick={() => setLightbox(true)}
            >
              <img
                src={message.mediaUrl}
                alt="Shared"
                className="w-full h-auto max-h-[220px] object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors rounded-xl" />
            </div>
            <ImageLightbox src={message.mediaUrl} isOpen={lightbox} onClose={() => setLightbox(false)} />
          </>
        );
      case "video":
        return (
          <div className="relative overflow-hidden rounded-xl">
            <video
              src={message.mediaUrl}
              controls
              className="w-full h-auto max-h-[220px] rounded-xl object-cover bg-black"
              preload="metadata"
            />
          </div>
        );
      case "audio":
      case "voice-note":
        return (
          <div className={`flex items-center gap-2.5 py-1 ${isSent ? "" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isSent ? "bg-white/20" : "bg-purple-100"
            }`}>
              <Play className={`w-3.5 h-3.5 ml-0.5 ${isSent ? "text-white" : "text-purple-600"}`} />
            </div>
            <audio
              src={message.mediaUrl}
              controls
              className="flex-1 max-w-[200px] h-8 [&::-webkit-media-controls-panel]:bg-transparent"
            />
          </div>
        );
      case "document":
        return (
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
              isSent ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isSent ? "bg-white/15" : "bg-purple-50"
            }`}>
              <File className={`w-4.5 h-4.5 ${isSent ? "text-white/80" : "text-purple-500"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{message.mediaName || "Document"}</p>
              <p className={`text-[11px] ${isSent ? "text-white/50" : "text-gray-400"}`}>
                {formatFileSize(message.mediaSize)}
              </p>
            </div>
            <Download className={`w-4 h-4 shrink-0 ${isSent ? "text-white/50" : "text-gray-400"}`} />
          </a>
        );
      default:
        return null;
    }
  };

  /* --- Bubble padding: tighter for image/video-only messages --- */
  const isVisualMedia = message.messageType === "image" || message.messageType === "video";
  const bubblePadding = isVisualMedia && isMediaOnly ? "p-1.5" : "px-3.5 py-2.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isSent ? "justify-end" : "justify-start"} px-4 my-1 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!showReactionPicker && !showFullPicker) setShowActions(false);
      }}
    >
      {/* Sender avatar for received messages */}
      {!isSent && message.sender && (
        <div className="flex-shrink-0 mr-2 mt-auto mb-1">
          <img
            src={message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.fullName)}&background=7c3aed&color=fff&size=32`}
            alt={message.sender.fullName}
            className="w-7 h-7 rounded-full object-cover"
          />
        </div>
      )}
      <div className="relative max-w-[65%] min-w-[120px]">
        {/* Reply preview */}
        {message.replyTo && (
          <div className={`mb-1 ${isSent ? "text-right" : "text-left"}`}>
            <ReplyPreview message={message.replyTo} />
          </div>
        )}

        <div
          className={`${bubblePadding} ${
            isSent
              ? "bubble-sent text-white"
              : "bubble-received text-gray-800 border border-gray-100/80"
          }`}
        >
          {/* Sender name */}
          {!isSent && message.sender && (
            <p className="sender-name text-[11px] font-semibold text-purple-600 mb-1 tracking-wide">
              {message.sender.fullName}
            </p>
          )}

          {/* Media */}
          {hasMedia && <div className={message.content ? "mb-1.5" : ""}>{renderMedia()}</div>}

          {/* Text */}
          {message.content && (
            <p className={`text-[13.5px] whitespace-pre-wrap break-words leading-relaxed ${
              isVisualMedia ? "px-2 pt-1" : ""
            }`}>
              {message.content}
            </p>
          )}

          {/* Meta row */}
          <div className={`flex items-center gap-1 mt-0.5 ${
            isSent ? "justify-end" : "justify-start"
          } ${isVisualMedia && isMediaOnly ? "px-1.5 pb-0.5" : ""}`}>
            {message.isEdited && (
              <span className={`text-[10px] ${isSent ? "text-white/40" : "text-gray-400"}`}>edited</span>
            )}
            <span className={`text-[10px] font-mono ${isSent ? "text-white/50" : "text-gray-400"}`}>
              {formatTime(message.createdAt)}
            </span>
            {getReadStatus()}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isSent ? "justify-end" : "justify-start"}`}>
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="reaction-pill px-1.5 py-0.5 rounded-full bg-white border border-gray-200/80 text-xs shadow-sm hover:scale-110 transition-transform"
              >
                {emoji} {count > 1 && <span className="text-[10px] text-gray-500">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              ref={reactionRef}
              className={`absolute -top-1 ${
                isSent ? "left-0 -translate-x-full" : "right-0 translate-x-full"
              } flex items-center gap-0.5 px-1`}
            >
              <div className="relative">
                <button
                  onClick={() => {
                    setShowReactionPicker((v) => !v);
                    setShowFullPicker(false);
                  }}
                  className="msg-action-btn p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  title="React"
                >
                  <span className="text-sm">{"\uD83D\uDE0A"}</span>
                </button>

                <AnimatePresence>
                  {showReactionPicker && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0, y: 8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.7, opacity: 0, y: 8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`absolute bottom-full mb-2 z-50 ${isSent ? "right-0" : "left-0"}`}
                    >
                      <div className="quick-reaction-bar flex items-center gap-1 bg-white rounded-full shadow-xl border border-gray-100 px-2 py-1.5">
                        {QUICK_REACTIONS.map((emoji) => (
                          <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.35 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReact(emoji)}
                            className="text-xl leading-none p-0.5"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                        <button
                          onClick={() => setShowFullPicker((v) => !v)}
                          className="more-btn w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold transition-colors ml-0.5"
                          title="More"
                        >
                          +
                        </button>
                      </div>

                      <AnimatePresence>
                        {showFullPicker && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`absolute bottom-full mb-2 z-50 ${isSent ? "right-0" : "left-0"}`}
                          >
                            <Picker
                              data={data}
                              onEmojiSelect={(e) => handleReact(e.native)}
                              theme="light"
                              previewPosition="none"
                              skinTonePosition="none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => onReply(message)}
                className="msg-action-btn p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
              {isSent && (
                <button
                  onClick={() => handleDelete("for_everyone")}
                  className="msg-action-btn p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
