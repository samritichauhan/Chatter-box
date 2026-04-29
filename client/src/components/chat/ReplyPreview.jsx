import { X } from "lucide-react";

const ReplyPreview = ({ message, onCancel }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border-l-3 border-purple-500 mx-4 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-purple-600">
          {message.sender?.fullName || "Unknown"}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {message.content || "Media"}
        </p>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="p-1 rounded hover:bg-purple-100 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ReplyPreview;
