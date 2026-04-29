import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useState } from "react";
import useCallStore from "../../store/useCallStore";

const CallControls = ({ onEndCall, showVideoToggle = true }) => {
  const { localStream } = useCallStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // flip: if currently muted, re-enable
      });
    }
    setIsMuted((v) => !v);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff; // flip: if currently off, re-enable
      });
    }
    setIsVideoOff((v) => !v);
  };

  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={toggleMute}
        className={`p-4 rounded-full transition-colors ${
          isMuted ? "bg-white/30 text-white" : "bg-white/10 text-white hover:bg-white/20"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {showVideoToggle && (
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff ? "bg-white/30 text-white" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      )}

      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        title="End call"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CallControls;
