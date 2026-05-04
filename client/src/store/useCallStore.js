import { create } from "zustand";
import socket from "../lib/socket";
import useAuthStore from "./useAuthStore";
import api from "../lib/api";

// Lazy-load simple-peer only when a call is actually started
const getSimplePeer = async () => {
  const mod = await import("simple-peer");
  return mod.default ?? mod;
};

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Free TURN servers for relay when direct P2P fails (behind symmetric NATs)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

const useCallStore = create((set, get) => ({
  callState: null,      // null | "calling" | "ringing" | "ongoing"
  callType: null,       // "audio" | "video"
  callUser: null,
  localStream: null,
  remoteStream: null,
  peer: null,
  incomingSignal: null,
  callHistory: [],

  setCallState: (state) => set({ callState: state }),
  setCallType: (type) => set({ callType: type }),
  setCallUser: (user) => set({ callUser: user }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeer: (peer) => set({ peer: peer }),

  fetchCallHistory: async () => {
    try {
      const res = await api.get("/calls/history");
      set({ callHistory: res.data });
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  },

  initiateCall: async (targetUser, callType) => {
    console.log("[CallStore] Initiating", callType, "call to:", targetUser.fullName);
    let stream;
    try {
      console.log("[CallStore] Requesting camera/microphone access...");
      stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      console.log("[CallStore] Media access granted");
    } catch (err) {
      console.error("[CallStore] Media access error:", err);
      if (err.name === "NotAllowedError") {
        alert("Camera/microphone permission denied. Please allow access in your browser settings and try again.");
      } else if (err.name === "NotFoundError") {
        alert("No camera or microphone found on this device.");
      } else if (err.name === "NotReadableError") {
        alert("Camera/microphone is already in use by another app. Close it and try again.");
      } else {
        alert("Could not access camera/microphone: " + err.message);
      }
      return;
    }

    try {
      console.log("[CallStore] Creating SimplePeer instance...");
      const SimplePeer = await getSimplePeer();
      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream,
        config: ICE_SERVERS,
      });

      // First signal = SDP offer, subsequent = ICE candidates
      let offerSent = false;
      peer.on("signal", (signal) => {
        if (!offerSent) {
          offerSent = true;
          console.log("[CallStore] Sending SDP offer");
          const me = useAuthStore.getState().user;
          socket.emit("call:initiate", {
            to: targetUser._id,
            callType,
            signal,
            from: { _id: me._id, fullName: me.fullName, avatar: me.avatar },
          });
        } else {
          console.log("[CallStore] Sending ICE candidate");
          socket.emit("call:ice-candidate", {
            to: targetUser._id,
            candidate: signal,
          });
        }
      });

      peer.on("stream", (remoteStream) => {
        console.log("[CallStore] Received remote stream");
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("[CallStore] Peer connection error:", err);
        alert("Call connection error: " + err.message);
        get().endCall();
      });

      set({
        callState: "calling",
        callType,
        callUser: targetUser,
        localStream: stream,
        peer,
        incomingSignal: null,
      });
      console.log("[CallStore] Call initiated, waiting for response");
    } catch (err) {
      console.error("[CallStore] Call setup error:", err);
      stream.getTracks().forEach((t) => t.stop());
      alert("Failed to set up the call: " + err.message);
    }
  },

  acceptCall: async () => {
    console.log("[CallStore] Accepting call...");
    const state = get();
    let stream;
    try {
      console.log("[CallStore] Requesting camera/microphone access...");
      stream = await navigator.mediaDevices.getUserMedia({
        video: state.callType === "video",
        audio: true,
      });
      console.log("[CallStore] Media access granted for incoming call");
    } catch (err) {
      console.error("[CallStore] Media access error:", err);
      if (err.name === "NotAllowedError") {
        alert("Camera/microphone permission denied. Please allow access in your browser settings.");
      } else if (err.name === "NotReadableError") {
        alert("Camera/microphone is already in use by another app.");
      } else {
        alert("Could not access camera/microphone: " + err.message);
      }
      get().rejectCall();
      return;
    }

    try {
      console.log("[CallStore] Creating SimplePeer instance for incoming call...");
      const SimplePeer = await getSimplePeer();
      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream,
        config: ICE_SERVERS,
      });

      // First signal = SDP answer, subsequent = ICE candidates
      let answerSent = false;
      peer.on("signal", (signal) => {
        if (!answerSent) {
          answerSent = true;
          console.log("[CallStore] Sending SDP answer");
          socket.emit("call:accept", {
            to: state.callUser._id,
            signal,
          });
        } else {
          console.log("[CallStore] Sending ICE candidate from answerer");
          socket.emit("call:ice-candidate", {
            to: state.callUser._id,
            candidate: signal,
          });
        }
      });

      peer.on("stream", (remoteStream) => {
        console.log("[CallStore] Received remote stream from initiator");
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("[CallStore] Peer connection error:", err);
        get().endCall();
      });

      // Feed the stored offer to the peer — triggers signal event above
      if (state.incomingSignal) {
        console.log("[CallStore] Signaling peer with stored offer");
        peer.signal(state.incomingSignal);
      } else {
        console.warn("[CallStore] No incoming signal found!");
      }

      set({ callState: "ongoing", localStream: stream, peer });
      console.log("[CallStore] Call accepted successfully");
    } catch (err) {
      console.error("[CallStore] Call setup error:", err);
      stream.getTracks().forEach((t) => t.stop());
      alert("Failed to set up the call: " + err.message);
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const state = get();
    if (state.callUser) {
      socket.emit("call:reject", { to: state.callUser._id });
    }
    set({
      callState: null,
      callType: null,
      callUser: null,
      incomingSignal: null,
    });
  },

  endCall: () => {
    const state = get();
    if (state.callUser) {
      socket.emit("call:end", { to: state.callUser._id });
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }
    if (state.peer) {
      state.peer.destroy();
    }
    set({
      callState: null,
      callType: null,
      callUser: null,
      localStream: null,
      remoteStream: null,
      peer: null,
      incomingSignal: null,
    });
  },
}));

export default useCallStore;
