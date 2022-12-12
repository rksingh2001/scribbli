import { useEffect, useRef } from "react";

// Bare Bones Canvas Element takes in draw function
// height and weight as the input
const Canvas = ({ draw, height, width }) => {
  const canvas = useRef();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    draw(context);
  })

  return (
    <canvas 
      id="canvas" 
      width={width}
      height={height}
      ref={canvas}
    />
  )
}

export default Canvas;