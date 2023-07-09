import "./Canvas.css";

import { useState, useEffect, useRef, MouseEventHandler, useContext } from "react";
import useRoomId from "../../store/roomId";
import useSocket from "../../store/socket";

const Canvas = ({ height, width, disable } : {height: number, width: number, disable: boolean}) => {
  const [isPainting, setIsPainting] = useState(false);
  const roomId = useRoomId(state => state.roomId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socket = useSocket(state => state.socket);

  useEffect(() => {
    socket.on("recieve_message", (data) => {
      draw(data);
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
  }, [socket]);

  const draw = (pos : { posX : string, posY : string}) => {
    const context = canvasRef.current?.getContext('2d');
    
    if (context) {
      context.lineWidth = 10;
      context.lineCap = "round";
      context.strokeStyle = "purple";
      
      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }
      
      context.lineTo(parseFloat(pos.posX), parseFloat(pos.posY));
      context.stroke();
      context.beginPath();
      context.moveTo(parseFloat(pos.posX), parseFloat(pos.posY));
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
  
  const mouseDraw : MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isPainting) return;
    
    const context = canvasRef.current?.getContext('2d');

    if (context) {
      context.lineWidth = 10;
      context.lineCap = "round";
      context.strokeStyle = "purple";
      
      if (canvasRef.current === null) {
        console.error("Error: CanvasRef.current is null");
        return;
      }

      const offsetY = canvasRef.current.getBoundingClientRect().top;
      const offsetX = canvasRef.current.getBoundingClientRect().left;

      const posX = e.clientX - offsetX;
      const posY = e.clientY - offsetY;

      context.lineTo(posX, posY);
      context.stroke();
      context.beginPath();
      context.moveTo(posX, posY);
    } else {
      throw console.error("Context Not Found");
    }
  }

  const handleMouseMove : MouseEventHandler<HTMLCanvasElement> = (e) => {
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
        socket.emit("send_coordinates", { roomId, pos });
      }
    } else {
      throw console.error("Context Not Found");
    }

    mouseDraw(e);
  }

  const handleMouseDown = () => {
    socket.emit("mouse-down", { roomId });

    startPainting();
  }

  const handleMouseUp = () => {
    socket.emit("mouse-up", { roomId });

    stopPainting();
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: "white" }}
    />
  )
}

export default Canvas;