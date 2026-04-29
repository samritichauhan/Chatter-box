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
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
    } catch (err) {
      console.error("Media access error:", err);
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
          const me = useAuthStore.getState().user;
          socket.emit("call:initiate", {
            to: targetUser._id,
            callType,
            signal,
            from: { _id: me._id, fullName: me.fullName, avatar: me.avatar },
          });
        } else {
          socket.emit("call:ice-candidate", {
            to: targetUser._id,
            candidate: signal,
          });
        }
      });

      peer.on("stream", (remoteStream) => {
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
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
    } catch (err) {
      console.error("Call setup error:", err);
      stream.getTracks().forEach((t) => t.stop());
      alert("Failed to set up the call: " + err.message);
    }
  },

  acceptCall: async () => {
    const state = get();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: state.callType === "video",
        audio: true,
      });
    } catch (err) {
      console.error("Media access error:", err);
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
          socket.emit("call:accept", {
            to: state.callUser._id,
            signal,
          });
        } else {
          socket.emit("call:ice-candidate", {
            to: state.callUser._id,
            candidate: signal,
          });
        }
      });

      peer.on("stream", (remoteStream) => {
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        get().endCall();
      });

      // Feed the stored offer to the peer — triggers signal event above
      if (state.incomingSignal) {
        peer.signal(state.incomingSignal);
      }

      set({ callState: "ongoing", localStream: stream, peer });
    } catch (err) {
      console.error("Call setup error:", err);
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
