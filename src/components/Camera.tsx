import { useEffect, useRef, useState } from "react";
import useHandTracking from "../hooks/useHandTracking";
import Toolbar from "./toolbar";
import Cursor from "./cursor";

const Camera = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const toolbarButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
const [cursors, setCursors] = useState({
  thumb: {
    x: 0,
    y: 0,
    visible: false,
  },
  finger: {
    x: 0,
    y: 0,
    visible: false,
  },
});
  useHandTracking(videoRef, canvasRef, selectedColor, setSelectedColor ,toolbarButtonRefs,setCursors);
  
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
  <div
    style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "1200px",
          height: "900px",
          transform: "scaleX(-1)",
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

      <Toolbar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        buttonRefs={toolbarButtonRefs}
      />

{cursors.thumb.visible && <Cursor selectedColor={selectedColor} cursors={cursors.thumb} />}
{cursors.finger.visible && <Cursor selectedColor={selectedColor} cursors={cursors.finger} />}

    </div>
  </div>
);
};

export default Camera;