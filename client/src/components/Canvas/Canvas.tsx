import "./Canvas.css";

import { useState, useEffect, useRef, MouseEventHandler } from "react";
import useRoomId from "../../store/roomId";
import useSocket from "../../store/socket";
import useCanvasState from "../../store/canvasState";

const Canvas = ({ height, width, disable }: { height: number, width: number, disable: boolean }) => {
  const [isPainting, setIsPainting] = useState(false);
  const roomId = useRoomId(state => state.roomId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socket = useSocket(state => state.socket);
  const color = useCanvasState(state => state.color);
  const lineWidth = useCanvasState(state => state.lineWidth);
  const utilitySelected = useCanvasState(state => state.utilitySelected);

  useEffect(() => {
    socket.on("recieve_message", ({ pos, color, lineWidth }) => {
      draw(pos, color, lineWidth);
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
      dfsColorFill(posX, posY, colorToFill)
    })
  }, [socket]);

  const draw = (pos: { posX: number, posY: number }, color: string, lineWidth: number) => {
    const context = canvasRef.current?.getContext('2d');

    if (context) {
      context.lineWidth = lineWidth;
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
      context.clearRect(0, 0, width, height);
    } else {
      throw new Error("Canvas context not found.");
    }
  }

  const dfsColorFill = (x: number, y: number, colorToFill: string) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      throw new Error('Could not retrieve 2D context from canvas element');
    }

    x = Math.round(x);
    y = Math.round(y);

    const imageData: ImageData = ctx.getImageData(0, 0, width, height);

    const startColor = getPixelColor(x, y);
    const replacementColor: number[] = [0, 0, 0, 0];

    if (compareColors(startColor, replacementColor) && utilitySelected === 'eraser') {
      return;
    }

    const pixelStack: { x: number; y: number }[] = [];
    pixelStack.push({ x, y });

    let uniquePixelValues = new Set<string>;

    // const startTime = performance.now();
    while (pixelStack.length) {
      const pixel = pixelStack.shift()!;
      const { x, y } = pixel;
      if (uniquePixelValues.has(`${x}|${y}`)) continue;

      const color: number[] = getPixelColor(x, y);

      if (compareColors(color, startColor)) {
        ctx.fillStyle = colorToFill;
        const off = 1;
        ctx.fillRect(x - off, y - off, off * 2, off * 2);

        uniquePixelValues.add(`${x}|${y}`);
        const offset = 2;
        for (let i = 1; i <= offset; ++i) {
          if (x - i >= 0) pixelStack.push({ x: x - i, y });
          if (x + i <= width - 1) pixelStack.push({ x: x + i, y });
          if (y - i >= 0) pixelStack.push({ x, y: y - i });
          if (y + i <= height - 1) pixelStack.push({ x, y: y + i });
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
      context.lineWidth = lineWidth ?? 10;
      context.lineCap = "round";
      context.strokeStyle = color;

      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }

      const offsetY = canvasRef.current.getBoundingClientRect().top;
      const offsetX = canvasRef.current.getBoundingClientRect().left;

      const posX = e.clientX - offsetX;
      const posY = e.clientY - offsetY;

      if (lineWidth)
        draw({ posX, posY }, color, lineWidth);
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

        const pos = { posX, posY }

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

    let colorToFill;
    if (utilitySelected === 'eraser') colorToFill = 'white';
    if (utilitySelected === 'colorfill') colorToFill = color;

    socket.emit('color-fill', { posX: posX, posY: posY, colorToFill: colorToFill, roomId: roomId });
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
        width={width}
        height={height}
        ref={canvasRef}
        style={{ backgroundColor: "white" }}
      />
      :
      <canvas
        id="canvas"
        width={width}
        height={height}
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