import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CallControls from "./CallControls";
import Avatar from "../common/Avatar";
import useCallStore from "../../store/useCallStore";

const CallScreen = () => {
  const { callState, callType, callUser, localStream, remoteStream, endCall } =
    useCallStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval;
    if (callState === "ongoing") {
      setTimer(0);
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!callState || callState === "ringing") return null;

  const formatTimer = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #0f0e17 0%, #1a1040 40%, #2d1b69 70%, #1a1040 100%)",
      }}
    >
      {callType === "video" ? (
        <>
          {/* Remote video — full screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video — picture-in-picture */}
          <motion.div
            drag
            dragMomentum={false}
            className="absolute top-6 right-6 z-10 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-28 h-40 object-cover bg-gray-900"
            />
          </motion.div>

          {/* Status overlay */}
          {callState === "calling" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <Avatar src={callUser?.avatar} name={callUser?.fullName} size="2xl" />
                <h2 className="text-white text-xl font-semibold mt-4">
                  {callUser?.fullName}
                </h2>
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white/60 mt-2"
                >
                  Calling...
                </motion.p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Audio call UI */
        <div className="flex flex-col items-center gap-5">
          {/* Pulse rings around avatar */}
          <div className="relative flex items-center justify-center">
            {callState === "ongoing" &&
              [1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-purple-400/20"
                  animate={{ scale: [1, 1 + i * 0.3], opacity: [0.4, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{ width: 120, height: 120 }}
                />
              ))}
            <div className="relative z-10 rounded-full ring-4 ring-white/10 overflow-hidden">
              <Avatar src={callUser?.avatar} name={callUser?.fullName} size="2xl" />
            </div>
          </div>

          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
            {callUser?.fullName}
          </h2>

          {callState === "calling" ? (
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/50 text-sm"
            >
              Calling...
            </motion.p>
          ) : (
            <p className="text-white/70 text-lg font-mono tracking-widest">
              {formatTimer(timer)}
            </p>
          )}
        </div>
      )}

      {/* Controls at bottom */}
      <div className="absolute bottom-12 left-0 right-0">
        <CallControls
          onEndCall={endCall}
          showVideoToggle={callType === "video"}
        />
      </div>
    </motion.div>
  );
};

export default CallScreen;
