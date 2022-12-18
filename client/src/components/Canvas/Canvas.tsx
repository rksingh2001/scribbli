import "./Canvas.css";

import { useState, useEffect, useRef, MouseEventHandler, useContext } from "react";
import { SocketContext } from "../../context/socket";
import { RoomIdContext } from '../../context/roomid';

const Canvas = ({ height, width } : {height: number, width: number}) => {
  const [isPainting, setIsPainting] = useState(false);
  const roomIdContext = useContext(RoomIdContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socket = useContext(SocketContext);

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
        const roomID = roomIdContext.roomID;
        socket.emit("send_coordinates", { roomID, pos });
      }
    } else {
      throw console.error("Context Not Found");
    }

    mouseDraw(e);
  }

  const handleMouseDown = () => {
    const roomID = roomIdContext.roomID;
    socket.emit("mouse-down", { roomID });

    startPainting();
  }

  const handleMouseUp = () => {
    const roomID = roomIdContext.roomID;
    socket.emit("mouse-up", { roomID });

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
      style={{ backgroundColor: "white" }}
    />
  )
}

export default Canvas;