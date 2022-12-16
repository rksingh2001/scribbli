import "./Canvas.css";
import type { MouseEventHandler } from 'react';

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// This creates a socket connection with the server
const socket = io("http://localhost:8000");

const Canvas = ({ height, width } : {height:any, width:any}) => {
  const [isPainting, setIsPainting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // This creates a socket connection with the server 
    const createConnection = () =>  { 
      socket.emit("send_data", { message: "hello" });
    }

    createConnection();
  }, [])

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
  }, [socket])
  
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
      throw console.error("Canvas context not found.");
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
        socket.emit("send_coordinates", pos);
      }
    } else {
      throw console.error("Context Not Found");
    }

    mouseDraw(e);
  }

  const handleMouseDown = () => {
    socket.emit("mouse-down", {});

    startPainting();
  }

  const handleMouseUp = () => {
    socket.emit("mouse-up", {});

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
    <canvas 
      id="canvas" 
      width={width}
      height={height}
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    />
  )
}

export default Canvas;