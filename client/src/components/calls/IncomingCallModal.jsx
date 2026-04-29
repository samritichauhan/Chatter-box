import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../common/Avatar";
import useCallStore from "../../store/useCallStore";

// Programmatically generate a ringtone using Web Audio API — no audio file needed
function useRingtone(active) {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);

  const playRing = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      const ring = (t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(660, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
      };

      const now = ctx.currentTime;
      ring(now);
      ring(now + 0.45);
    } catch (_) {}
  };

  useEffect(() => {
    if (active) {
      playRing();
      intervalRef.current = setInterval(playRing, 2500);
    }
    return () => {
      clearInterval(intervalRef.current);
      try { ctxRef.current?.close(); } catch (_) {}
      ctxRef.current = null;
    };
  }, [active]);
}

const IncomingCallModal = ({ onAccept, onReject }) => {
  const { callState, callType, callUser } = useCallStore();
  const isRinging = callState === "ringing";

  useRingtone(isRinging);

  return (
    <AnimatePresence>
      {isRinging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-20 px-6"
          style={{
            background: "linear-gradient(160deg, #1a1040 0%, #2d1b69 50%, #1a1040 100%)",
          }}
        >
          {/* Top label */}
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">
              Incoming {callType === "video" ? "Video" : "Voice"} Call
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/40 text-xs"
            >
              {callType === "video" ? "wants to video chat…" : "is calling you…"}
            </motion.p>
          </div>

          {/* Avatar with pulse rings */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/20"
                  animate={{ scale: [1, 1 + i * 0.35], opacity: [0.5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut",
                  }}
                  style={{ width: 100, height: 100 }}
                />
              ))}
              <div className="relative z-10 rounded-full ring-4 ring-white/20 overflow-hidden">
                <Avatar
                  src={callUser?.avatar}
                  name={callUser?.fullName}
                  size="2xl"
                />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-white text-2xl font-bold tracking-tight">
                {callUser?.fullName}
              </h2>
            </div>
          </div>

          {/* Accept / Reject buttons */}
          <div className="flex items-end justify-center gap-16">
            {/* Reject */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/40 transition-colors"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </motion.button>
              <span className="text-white/60 text-xs">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/40 transition-colors"
              >
                {callType === "video" ? (
                  <Video className="w-7 h-7 text-white" />
                ) : (
                  <Phone className="w-7 h-7 text-white" />
                )}
              </motion.button>
              <span className="text-white/60 text-xs">Accept</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallModal;
