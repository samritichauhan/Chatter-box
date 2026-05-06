import { useEffect, useRef } from "react";
import socket from "../lib/socket";
import useCallStore from "../store/useCallStore";
import useAuthStore from "../store/useAuthStore";

const useCall = () => {
  const { user } = useAuthStore();
  const pendingCandidates = useRef([]);

  useEffect(() => {
    if (!user) return;

    socket.on("call:incoming", ({ from, callType, signal }) => {
      console.log("[Call] Incoming call from:", from.fullName, "Type:", callType);
      pendingCandidates.current = [];
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
          // Flush any queued ICE candidates
          pendingCandidates.current.forEach((c) => {
            try { peer.signal(c); } catch (e) { /* ignore */ }
          });
          pendingCandidates.current = [];
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
      pendingCandidates.current = [];
      useCallStore.getState().endCall();
    });

    socket.on("call:ended", () => {
      console.log("[Call] Call ended");
      pendingCandidates.current = [];
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
          // Queue candidate if peer isn't ready yet
          console.warn("[Call] Queuing ICE candidate for later");
          pendingCandidates.current.push(candidate);
        }
      } else {
        // Queue candidate - peer may not be created yet
        console.warn("[Call] Peer not found, queuing ICE candidate");
        pendingCandidates.current.push(candidate);
      }
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:ice-candidate");
      pendingCandidates.current = [];
    };
  }, [user]);
};

export default useCall;
