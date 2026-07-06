import { useEffect, useRef, type RefObject } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import {
  // DRAW_COLOR,
  DRAW_CONFIRM_FRAMES,
  DRAW_LINE_WIDTH,
  DRAW_PINCH_DISTANCE,
  DRAW_SMOOTHING,
  ERASE_CONFIRM_FRAMES,
  ERASER_RADIUS,
  LOST_FRAME_LIMIT,
  MIN_DRAW_MOVEMENT,
} from "../constants/handTracking";

import type { Point, Tool } from "../types/hand";

const useHandTracking = (
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  selectedColor: string,
  setSelectedColor: (color: string) => void,
  toolbarButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
) => {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const previousPointRef = useRef<Point | null>(null);
  const smoothedPointRef = useRef<Point | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lostFramesRef = useRef(0);
  const drawFrameRef = useRef(0);
  const eraseFrameRef = useRef(0);
  const selectedColorRef = useRef(selectedColor);

  useEffect(() => {
    selectedColorRef.current = selectedColor;
    console.log(toolbarButtonRefs.current);

  }, [selectedColor]);

  useEffect(() => {

    const loadModel = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      handLandmarkerRef.current = handLandmarker;
      console.log("handref", handLandmarkerRef.current);
      console.log("handmarker", handLandmarker);
      console.log("✅ Hand model loaded");
    };

    const detectHands = () => {
      if (!handLandmarkerRef.current) {
        requestAnimationFrame(detectHands);
        return;
      }

      if (!videoRef.current) {
        requestAnimationFrame(detectHands);
        return;
      }

      if (!canvasRef.current) {
        requestAnimationFrame(detectHands);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext("2d");
      }
      const ctx = ctxRef.current;
      if (!ctx) {
        requestAnimationFrame(detectHands);
        return;
      }

      if (video.readyState < 2) {
        requestAnimationFrame(detectHands);
        return;
      }

      if (video.currentTime === lastVideoTimeRef.current) {
        requestAnimationFrame(detectHands);
        return;
      }

      lastVideoTimeRef.current = video.currentTime;

      const results = handLandmarkerRef.current.detectForVideo(
        video,
        video.currentTime * 1000
      );

      if (results.landmarks.length === 0) {
        lostFramesRef.current++;

        if (lostFramesRef.current > LOST_FRAME_LIMIT) {
          previousPointRef.current = null;
          smoothedPointRef.current = null;
        }

        requestAnimationFrame(detectHands);
        return;
      }

      lostFramesRef.current = 0;

      const hand = results.landmarks[0];
      const thumbTip = hand[4];
      const indexTip = hand[8];
      const indexOpen = hand[8].y > hand[5].y;
      const middleOpen = hand[12].y > hand[9].y;
      const ringOpen = hand[16].y > hand[13].y;
      const pinkyOpen = hand[20].y > hand[17].y;
      const palm = hand[9];

      const canvasRect = canvas.getBoundingClientRect();

      const fingerX =
        canvasRect.left + (1 - indexTip.x) * canvasRect.width;

      const fingerY =
        canvasRect.top + indexTip.y * canvasRect.height;
      let hoveredColor: string | null = null;
      for (const [color, button] of Object.entries(toolbarButtonRefs.current)) {
        if (!button) continue;

        const rect = button.getBoundingClientRect();

        const isHovering =
          fingerX >= rect.left &&
          fingerX <= rect.right &&
          fingerY >= rect.top &&
          fingerY <= rect.bottom;

        if (isHovering) {
          hoveredColor = color;
          
        }
      }
      if(hoveredColor && hoveredColor !== selectedColorRef.current) {
        setSelectedColor(hoveredColor);
      }
      // console.log(fingerX, fingerY);
      // const thumbOpen = hand[4].x < hand[3].x;
      // const fingerX = indexTip.x * canvas.width;
      // const fingerY = indexTip.y * canvas.height;
      // console.log("fingerX", fingerX, "fingerY", fingerY);
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      // console.log(distance);
      let tool: Tool = "none";


      const isDrawingGesture = distance < DRAW_PINCH_DISTANCE;
      const isErasingGesture =
        indexOpen && middleOpen && ringOpen && pinkyOpen;

      if (isDrawingGesture) {
        drawFrameRef.current = Math.min(
          drawFrameRef.current + 1,
          DRAW_CONFIRM_FRAMES
        ); eraseFrameRef.current = 0;
      } else if (isErasingGesture) {

        eraseFrameRef.current = Math.min(
          eraseFrameRef.current + 1,
          ERASE_CONFIRM_FRAMES
        ); drawFrameRef.current = 0;
      } else {
        drawFrameRef.current = 0;
        eraseFrameRef.current = 0;
      }

      if (drawFrameRef.current >= DRAW_CONFIRM_FRAMES) {
        tool = "draw";
      }
      else if (eraseFrameRef.current >= ERASE_CONFIRM_FRAMES) {
        tool = "erase";
      }
      // Distance between thumb and index



      switch (tool) {
        case "draw": {
          const rawX = indexTip.x * canvas.width;
          const rawY = indexTip.y * canvas.height;

          let x = rawX;
          let y = rawY;

          if (smoothedPointRef.current) {
            const smoothing = DRAW_SMOOTHING;

            x =
              smoothedPointRef.current.x +
              (rawX - smoothedPointRef.current.x) * smoothing;

            y =
              smoothedPointRef.current.y +
              (rawY - smoothedPointRef.current.y) * smoothing;
          }

          smoothedPointRef.current = { x, y };

          ctx.strokeStyle = selectedColorRef.current;
          ctx.lineWidth = DRAW_LINE_WIDTH;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (!previousPointRef.current) {
            previousPointRef.current = { x, y };
          } else {
            const dx = x - previousPointRef.current.x;
            const dy = y - previousPointRef.current.y;

            const movement = Math.sqrt(dx * dx + dy * dy);

            if (movement > MIN_DRAW_MOVEMENT) {
              const midX = (previousPointRef.current.x + x) / 2;
              const midY = (previousPointRef.current.y + y) / 2;

              ctx.beginPath();

              ctx.moveTo(
                previousPointRef.current.x,
                previousPointRef.current.y
              );

              ctx.quadraticCurveTo(
                previousPointRef.current.x,
                previousPointRef.current.y,
                midX,
                midY
              );

              ctx.stroke();

              previousPointRef.current = { x, y };
            }
          }
          break;
        }
        case "erase": {
          // console.log("erase")
          // let x = indexTip.x * canvas.width;
          // let y = indexTip.y * canvas.height;
          let x = palm.x * canvas.width;
          let y = palm.y * canvas.height;
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.arc(x, y, ERASER_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          previousPointRef.current = null
          smoothedPointRef.current = null;
          break;
        }
        default: {
          previousPointRef.current = null;
          smoothedPointRef.current = null;
        }
      }


      requestAnimationFrame(detectHands);
    };

    loadModel();
    detectHands();
  }, [videoRef, canvasRef]);
};

export default useHandTracking;

