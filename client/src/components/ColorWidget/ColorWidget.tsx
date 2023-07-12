import { MouseEventHandler } from 'react';
import useCanvasState from '../../store/canvasState';
import './ColorWidget.scss';

const ColorWidget = ({ width, height } : { width: number, height: number }) => {
  const currentColor = useCanvasState(state => state.color);
  const setColor = useCanvasState(state => state.setColor);

  const colors = [
    '#e6194b', // Red
    '#3cb44b', // Green
    '#ffe119', // Yellow
    '#4363d8', // Blue
    '#f58231', // Orange
    '#911eb4', // Purple
    '#46f0f0', // Cyan
    '#f032e6', // Magenta
    '#bcf60c', // Lime
    '#fabebe', // Pink
    '#008080', // Teal
    '#e6beff', // Lavender
    '#9a6324', // Brown
    '#fffac8', // Beige
    '#800000', // Maroon
    '#aaffc3', // Mint
    '#808000', // Olive
    '#000075', // Navy
    '#ffffff', // White
    '#000000'  // Black
  ];

  const handleClick : MouseEventHandler<HTMLDivElement> = (e) => {
    const colorToSelect = (e.currentTarget.getAttribute("color"));
    setColor(colorToSelect);
  }
  
  return (
    <div style={{ width: width, height: height }} className='color-widget'>
      {
        colors.map(color => {
          return (
            color === currentColor ?
              <div style={{ backgroundColor: color, height: height/2, width: width/10.39, border: "1px solid white" }}></div>
            :
              <div color={color} onClick={handleClick} style={{ backgroundColor: color, height: height/2, width: width/10.39, border: "1px solid black" }}></div>
          )
        })
      }
    </div>
  )
}

export default ColorWidget;