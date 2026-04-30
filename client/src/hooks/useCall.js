import { useEffect } from "react";
import socket from "../lib/socket";
import useCallStore from "../store/useCallStore";
import useAuthStore from "../store/useAuthStore";

const useCall = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    socket.on("call:incoming", ({ from, callType, signal }) => {
      console.log("[Call] Incoming call from:", from.fullName, "Type:", callType);
      useCallStore.setState({
        callState: "ringing",
        callType,
        callUser: from,
        incomingSignal: signal,
      });
    });

    socket.on("call:accepted", ({ signal }) => {
      console.log("[Call] Call accepted, receiving answer signal");
      const peer = useCallStore.getState().peer;
      if (peer) {
        try {
          peer.signal(signal);
          console.log("[Call] Successfully signaled peer with answer");
        } catch (err) {
          console.error("[Call] Error signaling peer with answer:", err);
        }
      } else {
        console.warn("[Call] Peer not found when accepting call");
      }
      useCallStore.setState({ callState: "ongoing" });
    });

    socket.on("call:rejected", () => {
      console.log("[Call] Call rejected");
      useCallStore.getState().endCall();
    });

    socket.on("call:ended", () => {
      console.log("[Call] Call ended");
      useCallStore.getState().endCall();
    });

    socket.on("call:ice-candidate", ({ candidate }) => {
      console.log("[Call] Received ICE candidate");
      const peer = useCallStore.getState().peer;
      if (peer) {
        try {
          peer.signal(candidate);
          console.log("[Call] Successfully added ICE candidate");
        } catch (err) {
          console.error("[Call] Error adding ICE candidate:", err);
        }
      } else {
        console.warn("[Call] Peer not found when adding ICE candidate");
      }
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:ice-candidate");
    };
  }, [user]);
};

export default useCall;
