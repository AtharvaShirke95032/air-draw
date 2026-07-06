import { useEffect, useRef, useState } from "react";
import useHandTracking from "../hooks/useHandTracking";
import Toolbar from "./toolbar";

const Camera = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const toolbarButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useHandTracking(videoRef, canvasRef, selectedColor, setSelectedColor ,toolbarButtonRefs);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;

        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>

    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      
      style={{
        width: "1200px",
        height: "900px",
        borderRadius: "12px",
        transform: "scaleX(-1)",
        pointerEvents: "none",
        
      }}
    />
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "900px",
        transform: "scaleX(-1)",
        pointerEvents: "none",

      }}
    />
    <Toolbar selectedColor={selectedColor} setSelectedColor={setSelectedColor} buttonRefs={toolbarButtonRefs} />
    </div>
  );
};

export default Camera;