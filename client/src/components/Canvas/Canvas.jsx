import "./Canvas.css";
import { useState, useEffect, useRef } from "react";

const Canvas = ({ height, width }) => {
  const [isPainting, setIsPainting] = useState(false);
  const canvasRef = useRef(null);

  let context;
  useEffect (() => {
    context = canvasRef.current.getContext('2d');
  })
  
  const draw = (e) => {
    if (!isPainting) return;

    context.lineWidth = 10;
    context.lineCap = "round";
    context.strokeStyle = "red";

    const offsetY = canvasRef.current.getBoundingClientRect().top;
    const offsetX = canvasRef.current.getBoundingClientRect().left;
    
    context.lineTo(e.clientX - offsetX, e.clientY - offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.clientX - offsetX, e.clientY - offsetY);
  }

  const startPainting = () => {
    setIsPainting(true);
  }

  const stopPainting = () => {
    setIsPainting(false);
    context.beginPath();
  }


  return (
    <canvas 
      id="canvas" 
      width={width}
      height={height}
      ref={canvasRef}
      onMouseDown={startPainting}
      onMouseUp={stopPainting}
      onMouseMove={draw}
    />
  )
}

export default Canvas;