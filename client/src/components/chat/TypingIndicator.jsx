const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white bubble-received border border-gray-100 shadow-sm">
        <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
        <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
        <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
      </div>
    </div>
  );
};

export default TypingIndicator;
