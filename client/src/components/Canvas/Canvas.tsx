import "./Canvas.css";

import { useState, useEffect, useRef, MouseEventHandler } from "react";
import useRoomId from "../../store/roomId";
import useSocket from "../../store/socket";
import useCanvasState from "../../store/canvasState";

// Fixed ratio of width to height
// const ratio = BASE_CANVAS_WIDTH / 500;
import { RATIO as ratio, BASE_CANVAS_WIDTH, BREAK_POINT } from "../../helpers/constants";
// Timeout is there because on resizing window, resize event is being emitted
// more than once, so as to now increase server load too much, we wait for a little
// time before rerendering it
let isTimeOutStarted = false;

const Canvas = ({ disable }: { disable: boolean }) => {
  const [isPainting, setIsPainting] = useState(false);
  const roomId = useRoomId(state => state.roomId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socket = useSocket(state => state.socket);
  const color = useCanvasState(state => state.color);
  const lineWidth = useCanvasState(state => state.lineWidth);
  const utilitySelected = useCanvasState(state => state.utilitySelected);
  const canvasWidthPercentage = window.innerWidth <= BREAK_POINT ? 0.9 : 0.557;
  const width = useRef(window.innerWidth * canvasWidthPercentage);
  const height = useRef(window.innerWidth * canvasWidthPercentage / ratio);
  const calculatedScale = useRef(innerWidth * canvasWidthPercentage / BASE_CANVAS_WIDTH);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const innerWidth = window.innerWidth;
      const canvasWidthPercentage = innerWidth <= BASE_CANVAS_WIDTH ? 0.9 : 0.557;
      width.current = (innerWidth * canvasWidthPercentage);
      height.current = (innerWidth * canvasWidthPercentage / ratio);
      calculatedScale.current = (innerWidth * canvasWidthPercentage / BASE_CANVAS_WIDTH);
      if (isTimeOutStarted) return;
      isTimeOutStarted = true;
      // This timeout is there because we don't want to overload the server, in case there
      // are a lot of window resizes in a short period of time.
      setTimeout(() => {
        socket.emit("request-drawing", { roomId: roomId });
        isTimeOutStarted = false;
      }, 500)
    })
  }, []);

  const applyScale = ({ posX, posY }: { posX: number, posY: number }): { posX: number, posY: number } => {
    return { posX: posX * calculatedScale.current, posY: posY * calculatedScale.current };
  }

  const removeScale = ({ posX, posY }: { posX: number, posY: number }): { posX: number, posY: number } => {
    return { posX: posX / calculatedScale.current, posY: posY / calculatedScale.current };
  }

  useEffect(() => {
    socket.on("recieve_message", ({ pos, color, lineWidth }) => {
      draw(applyScale(pos), color, lineWidth);
    })

    socket.on("mouse-down", (data) => {
      startPainting();
    })

    socket.on("mouse-up", (data) => {
      stopPainting();
    })

    socket.on("clear-canvas", (data) => {
      clearCanvas();
    })

    socket.on('color-fill', ({ posX, posY, colorToFill }) => {
      const pos = applyScale({ posX, posY });
      dfsColorFill(pos.posX, pos.posY, colorToFill);
    })
  }, [socket]);

  const draw = (pos: { posX: number, posY: number }, color: string, lineWidth: number) => {
    const context = canvasRef.current?.getContext('2d');

    if (context) {
      context.lineWidth = lineWidth * calculatedScale.current;
      context.lineCap = "round";
      context.strokeStyle = color;

      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }

      context.lineTo(pos.posX, pos.posY);
      context.stroke();
      context.beginPath();
      context.moveTo(pos.posX, pos.posY);
    } else {
      throw new Error("Canvas context not found.");
    }
  }

  const clearCanvas = () => {
    const context = canvasRef.current?.getContext('2d');

    if (context) {
      context.clearRect(0, 0, width.current + 2, height.current + 2);
    } else {
      throw new Error("Canvas context not found.");
    }
  }

  // Possible Optimization Techniques,
  // First mark all colors in the Clamped Array ImageData, and then paint to the canvas in the end
  // Use flood fill instead of color fill
  const dfsColorFill = (posX: number, posY: number, colorToFill: string) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      throw new Error('Could not retrieve 2D context from canvas element');
    }

    // posX and posY shouldn't be floats, as getPixelColor, would
    // not work, this might be the reason of inconsistencies in color
    // fill
    posX = Math.round(posX);
    posY = Math.round(posY);

    const imageData: ImageData = ctx.getImageData(0, 0, width.current, height.current);

    const startColor = getPixelColor(posX, posY);
    const replacementColor: number[] = [0, 0, 0, 0];

    if (compareColors(startColor, replacementColor) && utilitySelected === 'eraser') {
      return;
    }

    const pixelStack: { posX: number; posY: number }[] = [];
    pixelStack.push({ posX, posY });

    let uniquePixelValues = new Set<string>;

    // const startTime = performance.now();

    while (pixelStack.length) {
      const pixel = pixelStack.shift()!;
      const { posX, posY } = pixel;
      if (uniquePixelValues.has(`${posX}|${posY}`)) continue;

      const color: number[] = getPixelColor(posX, posY);

      if (compareColors(color, startColor)) {
        ctx.fillStyle = colorToFill;
        const off = 1;
        ctx.fillRect(posX - off, posY - off, off * 2, off * 2);

        uniquePixelValues.add(`${posX}|${posY}`);
        const offset = 2;
        for (let i = 1; i <= offset; ++i) {
          if (posX - i >= 0) pixelStack.push({ posX: posX - i, posY });
          if (posX + i <= width.current - 1) pixelStack.push({ posX: posX + i, posY });
          if (posY - i >= 0) pixelStack.push({ posX, posY: posY - i });
          if (posY + i <= height.current - 1) pixelStack.push({ posX, posY: posY + i });
        }
      }
    }
    // const endTime = performance.now();
    // console.log(endTime - startTime);

    function getPixelColor(x: number, y: number) {
      const pixelDataIndex = (Math.round(y) * imageData.width + Math.round(x)) * 4;
      const r = imageData.data[pixelDataIndex];
      const g = imageData.data[pixelDataIndex + 1];
      const b = imageData.data[pixelDataIndex + 2];
      const a = imageData.data[pixelDataIndex + 3];

      return [r, g, b, a];
    }

    function compareColors(color1: number[], color2: number[]): boolean {
      return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
    }
  }

  const mouseDraw: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isPainting) return;

    const context = canvasRef.current?.getContext('2d');

    if (context) {
      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }

      const offsetY = canvasRef.current.getBoundingClientRect().top;
      const offsetX = canvasRef.current.getBoundingClientRect().left;

      const posX = e.clientX - offsetX;
      const posY = e.clientY - offsetY;

      const pos = { posX, posY };

      if (lineWidth)
        draw(pos, color, lineWidth);
    } else {
      throw console.error("Context Not Found");
    }
  }

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!lineWidth) {
      return;
    }

    const context = canvasRef.current?.getContext('2d');

    if (context) {
      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }

      const offsetY = canvasRef.current.getBoundingClientRect().top;
      const offsetX = canvasRef.current.getBoundingClientRect().left;

      if (isPainting) {
        const posX = e.clientX - offsetX;
        const posY = e.clientY - offsetY;

        const pos = removeScale({ posX, posY });

        // We can transfer the data
        socket.emit("send_coordinates", { roomId, pos, color, lineWidth });
      }
    } else {
      throw console.error("Context Not Found");
    }

    mouseDraw(e);
  }

  const handleMouseDown = () => {
    if (!lineWidth) {
      return;
    }

    socket.emit("mouse-down", { roomId });
    startPainting();
  }

  const handleMouseUp = () => {
    if (!lineWidth)
      return;
    socket.emit("mouse-up", { roomId });
    stopPainting();
  }

  const handleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!canvasRef?.current || (utilitySelected !== 'eraser' && utilitySelected !== 'colorfill')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const posX = Math.round(e.clientX - rect.left);
    const posY = Math.round(e.clientY - rect.top);

    const pos = removeScale({ posX, posY });

    let colorToFill;
    if (utilitySelected === 'eraser') colorToFill = 'white';
    if (utilitySelected === 'colorfill') colorToFill = color;

    socket.emit('color-fill', { ...pos, colorToFill: colorToFill, roomId: roomId });
    // @ts-ignore: colorToFill will never be undefined 
    dfsColorFill(posX, posY, colorToFill);
  }

  const startPainting = () => {
    setIsPainting(true);
  }

  const stopPainting = () => {
    setIsPainting(false);
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.beginPath();
    } else {
      throw console.error("Context Not Found");
    }
  }

  return (
    disable ?
      <canvas
        id="canvas"
        width={width.current}
        height={height.current}
        ref={canvasRef}
        style={{ backgroundColor: "white" }}
      />
      :
      <canvas
        id="canvas"
        width={width.current}
        height={height.current}
        ref={canvasRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ backgroundColor: "white" }}
      />
  )
}

export default Canvas;