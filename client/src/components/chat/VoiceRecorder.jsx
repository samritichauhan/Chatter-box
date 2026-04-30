import { useState, useRef, useEffect } from "react";
import { Mic, Video, Square, Send, X, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "./AudioVisualizer";

const VoiceRecorder = ({ onSend, onActiveChange }) => {
  const [mode, setMode] = useState(null); // null | "audio" | "video"
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingBlob, setPendingBlob] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const videoLiveRef = useRef(null);
  const audioPreviewRef = useRef(null);

  const isActive = !!(mode || previewUrl);

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  const startRecording = async (type) => {
    try {
      const constraints =
        type === "video"
          ? { audio: true, video: { facingMode: "user", width: 320, height: 240 } }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = type === "video" ? "video/webm" : "audio/webm";
        const name = type === "video" ? "video-note.webm" : "voice-note.webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPendingBlob({ blob, name, type: mimeType });
        stopStream();
        setDuration(0);
      };

      mediaRecorder.start();
      setMode(type);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      // Attach video stream after state update
      if (type === "video") {
        requestAnimationFrame(() => {
          if (videoLiveRef.current) {
            videoLiveRef.current.srcObject = stream;
          }
        });
      }
    } catch (error) {
      console.error("Media access denied:", error);
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    clearInterval(timerRef.current);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mode) {
      mediaRecorderRef.current.stop();
      setMode(null);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mode) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopStream();
    setMode(null);
    setDuration(0);
    chunksRef.current = [];
  };

  const discardPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingBlob(null);
    setAudioPlaying(false);
  };

  const sendPending = () => {
    if (!pendingBlob) return;
    const file = new File([pendingBlob.blob], pendingBlob.name, {
      type: pendingBlob.type,
    });
    onSend(file);
    discardPreview();
  };

  const toggleAudioPreview = () => {
    const el = audioPreviewRef.current;
    if (!el) return;
    if (audioPlaying) {
      el.pause();
    } else {
      el.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  const formatDuration = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Preview (after stop) ────────────────────────────────────────────────
  if (previewUrl) {
    const isVideo = pendingBlob?.type.startsWith("video");

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 border-t border-gray-100 bg-white"
      >
        <button
          onClick={discardPreview}
          className="p-2 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
          title="Discard"
        >
          <X className="w-4 h-4" />
        </button>

        {isVideo ? (
          <video
            src={previewUrl}
            controls
            className="flex-1 max-h-32 rounded-xl bg-black object-contain"
          />
        ) : (
          <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
            <audio
              ref={audioPreviewRef}
              src={previewUrl}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
            <button
              onClick={toggleAudioPreview}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20"
            >
              {audioPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2">
              {/* Waveform bars */}
              <div className="flex items-end gap-[3px] h-6 flex-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = 4 + Math.sin(i * 0.7) * 10 + Math.random() * 8;
                  return (
                    <div
                      key={i}
                      className={`w-[3px] rounded-full transition-colors duration-200 ${
                        audioPlaying ? "bg-purple-500" : "bg-purple-300"
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400 shrink-0">
              {isVideo ? "Video" : "Voice"}
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendPending}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-shadow shrink-0"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  // ── Active recording ────────────────────────────────────────────────────
  if (mode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 border-t border-gray-100 bg-white"
      >
        <button
          onClick={cancelRecording}
          className="p-2 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {mode === "video" ? (
          <div className="flex-1 flex items-center gap-3">
            <video
              ref={videoLiveRef}
              autoPlay
              muted
              playsInline
              className="h-20 w-28 rounded-xl object-cover bg-black ring-2 ring-red-400/40 shrink-0"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-sm font-semibold text-red-500">REC</span>
              </div>
              <span className="text-lg font-mono text-gray-700 tracking-wider">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <AudioVisualizer stream={streamRef.current} isRecording={true} />
            <span className="text-sm font-mono font-semibold text-red-500 tracking-wider shrink-0 w-12 text-right">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stopRecording}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 shrink-0"
          title="Stop & preview"
        >
          <Square className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  // ── Idle buttons ────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => startRecording("audio")}
        className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
        title="Voice note"
      >
        <Mic className="w-5 h-5" />
      </button>
      <button
        onClick={() => startRecording("video")}
        className="p-2.5 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
        title="Video note"
      >
        <Video className="w-5 h-5" />
      </button>
    </div>
  );
};

export default VoiceRecorder;
