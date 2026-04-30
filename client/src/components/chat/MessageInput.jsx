import { useState, useRef, useCallback } from "react";
import { Smile, Paperclip, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "./EmojiPicker";
import AttachmentMenu from "./AttachmentMenu";
import CameraCapture from "./CameraCapture";
import VoiceRecorder from "./VoiceRecorder";
import ReplyPreview from "./ReplyPreview";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import socket from "../../lib/socket";

const MessageInput = ({ replyTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recorderActive, setRecorderActive] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { selectedConversation, sendMessage } = useChatStore();
  const { user } = useAuthStore();

  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;
    socket.emit("user:typing", {
      conversationId: selectedConversation._id,
      userId: user._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("user:stopTyping", {
        conversationId: selectedConversation._id,
        userId: user._id,
      });
    }, 2000);
  }, [selectedConversation, user]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    if (!selectedConversation) return;

    setSending(true);
    const messageData = {
      conversationId: selectedConversation._id,
      content: text.trim(),
      messageType: "text",
    };

    if (replyTo) {
      messageData.replyTo = replyTo._id;
    }

    try {
      await sendMessage(messageData);
      setText("");
      onCancelReply?.();
      socket.emit("user:stopTyping", {
        conversationId: selectedConversation._id,
        userId: user._id,
      });
      textareaRef.current?.focus();
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedConversation) return;

    let messageType = "document";
    if (file.type.startsWith("image/")) messageType = "image";
    else if (file.type.startsWith("video/")) messageType = "video";
    else if (file.type.startsWith("audio/")) messageType = "voice-note";

    const formData = new FormData();
    formData.append("media", file);
    formData.append("conversationId", selectedConversation._id);
    formData.append("messageType", messageType);

    setUploadingFile(true);
    const toastId = toast.loading("Uploading...");

    try {
      const result = await sendMessage(formData);
      if (result) {
        toast.success("Sent!", { id: toastId });
      } else {
        toast.error("Upload failed. Please try again.", { id: toastId });
      }
    } catch {
      toast.error("Upload failed. Please try again.", { id: toastId });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping();

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + "px";
    }
  };

  return (
    <div className="bg-white border-t border-gray-100">
      {replyTo && !recorderActive && (
        <div className="px-4 pt-2 pb-0 border-b border-gray-100">
          <ReplyPreview message={replyTo} onCancel={onCancelReply} />
        </div>
      )}

      {/* Always render VoiceRecorder in same location to preserve state */}
      <VoiceRecorder onSend={handleFileUpload} onActiveChange={setRecorderActive} />

      {/* Text input area - only show when recorder is not active */}
      {!recorderActive && (
        <div className="flex items-end gap-2 px-4 py-3">
          <div className="relative">
            <button
              onClick={() => {
                setShowEmoji(!showEmoji);
                setShowAttachment(false);
              }}
              className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <EmojiPicker
              isOpen={showEmoji}
              onSelect={(emoji) => setText((prev) => prev + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowAttachment(!showAttachment);
                setShowEmoji(false);
              }}
              disabled={uploadingFile}
              className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            >
              {uploadingFile ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
            <AttachmentMenu
              isOpen={showAttachment}
              onSelect={handleFileUpload}
              onClose={() => setShowAttachment(false)}
              onCamera={() => setShowCamera(true)}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 resize-none transition-all overflow-y-auto"
            style={{ maxHeight: "80px", minHeight: "40px" }}
          />

          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : null}
        </div>
      )}

      <CameraCapture
        isOpen={showCamera}
        onCapture={handleFileUpload}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
};

export default MessageInput;
