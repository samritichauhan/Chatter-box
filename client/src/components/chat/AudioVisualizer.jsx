import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AudioVisualizer = ({ stream, isRecording }) => {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!stream || !isRecording) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyzer.connect(audioContext.destination);
    source.connect(analyzer);
    
    analyzer.fftSize = 256;
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    
    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const draw = () => {
      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width / devicePixelRatio, 0);
      gradient.addColorStop(0, "rgba(168, 85, 247, 0.1)");
      gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.1)");
      gradient.addColorStop(1, "rgba(168, 85, 247, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

      // Draw bars
      const barWidth = (canvas.width / devicePixelRatio) / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / devicePixelRatio);

        const hue = (i / dataArray.length) * 60 + 240; // Purple to blue range
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, (canvas.height / devicePixelRatio) - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stream, isRecording]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 backdrop-blur-sm overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-12 rounded-lg"
      />
    </motion.div>
  );
};

export default AudioVisualizer;
