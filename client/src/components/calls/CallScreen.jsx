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
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval;
    if (callState === "ongoing") {
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
      className="fixed inset-0 z-40 bg-dark-bg flex flex-col items-center justify-center"
    >
      {callType === "video" ? (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-4 right-4 w-32 h-44 rounded-xl object-cover border-2 border-white/20"
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Avatar src={callUser?.avatar} name={callUser?.fullName} size="2xl" />
          <h2 className="text-xl font-heading font-semibold text-white">
            {callUser?.fullName}
          </h2>
          <p className="text-white/60">
            {callState === "calling" ? "Calling..." : formatTimer(timer)}
          </p>
        </div>
      )}

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
