import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw, Send, SwitchCamera, ZoomIn, ZoomOut } from "lucide-react";

const CameraCapture = ({ isOpen, onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState("user"); // "user" = front, "environment" = back
  const [capturedImage, setCapturedImage] = useState(null); // data URL
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);

  const startCamera = useCallback(async (facing = facingMode) => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setError(null);
    setCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  }, [facingMode]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      // Stop camera when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCapturedImage(null);
      setError(null);
      setZoom(1);
    }
  }, [isOpen]);

  const switchCamera = async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startCamera(next);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Mirror front camera image so it looks natural
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const sendPhoto = () => {
    if (!capturedImage) return;

    // Convert data URL to File
    const arr = capturedImage.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    const file = new File([u8arr], `photo_${Date.now()}.jpg`, { type: mime });

    onCapture(file);
    onClose();
  };

  // Apply zoom via CSS transform on the video
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          {/* Flash overlay */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-50 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Zoom controls — only show when no captured image */}
            {!capturedImage && !error && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm disabled:opacity-30"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-xs font-mono bg-black/40 px-2 py-1 rounded-full">
                  {zoom.toFixed(2)}x
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm disabled:opacity-30"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Viewfinder / Preview */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
            {error ? (
              <div className="text-center px-8">
                <Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-sm">{error}</p>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: `${facingMode === "user" ? "scaleX(-1) " : ""}scale(${zoom})`,
                  transition: "transform 0.2s ease",
                }}
              />
            )}

            {/* Guide frame overlay */}
            {!capturedImage && !error && (
              <div className="absolute inset-8 pointer-events-none">
                <div className="w-full h-full border border-white/20 rounded-2xl" />
                {/* Corner accents */}
                {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
                  (pos, i) => (
                    <div
                      key={i}
                      className={`absolute w-6 h-6 border-white/60 ${pos} ${
                        i < 2 ? "border-t-2" : "border-b-2"
                      } ${i % 2 === 0 ? "border-l-2" : "border-r-2"} ${
                        i === 0 ? "rounded-tl-lg" : i === 1 ? "rounded-tr-lg" : i === 2 ? "rounded-bl-lg" : "rounded-br-lg"
                      }`}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 pt-6 px-8 bg-gradient-to-t from-black/80 to-transparent">
            {capturedImage ? (
              // Post-capture: retake or send
              <div className="flex items-center justify-between">
                <button
                  onClick={retake}
                  className="flex flex-col items-center gap-1.5 text-white"
                >
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <span className="text-xs">Retake</span>
                </button>

                <button
                  onClick={sendPhoto}
                  className="flex flex-col items-center gap-1.5 text-white"
                >
                  <div className="p-4 rounded-full bg-green-500 shadow-lg shadow-green-500/40">
                    <Send className="w-7 h-7" />
                  </div>
                  <span className="text-xs">Send</span>
                </button>
              </div>
            ) : (
              // Live viewfinder: shutter + flip
              <div className="flex items-center justify-between">
                {/* Spacer */}
                <div className="w-12" />

                {/* Shutter button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={takePhoto}
                  disabled={!!error}
                  className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40"
                  style={{ width: 72, height: 72 }}
                >
                  <div className="w-14 h-14 rounded-full bg-white" />
                </motion.button>

                {/* Flip camera */}
                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-white/20 text-white backdrop-blur-sm"
                  title="Switch camera"
                >
                  <SwitchCamera className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraCapture;
