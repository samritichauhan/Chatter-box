import { useEffect } from "react";
import socket from "../lib/socket";
import useCallStore from "../store/useCallStore";
import useAuthStore from "../store/useAuthStore";

const useCall = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    socket.on("call:incoming", ({ from, callType, signal }) => {
      useCallStore.setState({
        callState: "ringing",
        callType,
        callUser: from,
        incomingSignal: signal,
      });
    });

    socket.on("call:accepted", ({ signal }) => {
      const peer = useCallStore.getState().peer;
      if (peer) peer.signal(signal);
      useCallStore.setState({ callState: "ongoing" });
    });

    socket.on("call:rejected", () => {
      useCallStore.getState().endCall();
    });

    socket.on("call:ended", () => {
      useCallStore.getState().endCall();
    });

    socket.on("call:ice-candidate", ({ candidate }) => {
      const peer = useCallStore.getState().peer;
      if (peer) peer.signal(candidate);
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
