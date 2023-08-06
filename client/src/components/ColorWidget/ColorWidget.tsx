import { MouseEventHandler } from 'react';
import useCanvasState from '../../store/canvasState';
import './ColorWidget.scss';

const ColorWidget = ({ width, height }: { width: number, height: number }) => {
  const currentColor = useCanvasState(state => state.color);
  const setColor = useCanvasState(state => state.setColor);

  const colors = [
    '#f44336', // Red
    '#9c27b0', // Purple
    '#3f51b5', // Indigo
    '#4363d8', // Blue
    '#03a9f4', // Light Blue
    '#009688', // Teal
    '#8bc34a', // Light Green
    '#ffeb3b', // Yellow
    '#ff5722', // Deep orange
    '#ffffff', // White
    '#e91e63', // Pink
    '#673ab7', // Deep Purple
    '#2196f3', // Blue
    '#00bcd4', // Cyan
    '#4caf50', // Green
    '#cddc39', // Lime
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#795548', // Brown
    '#000000'  // Black
  ];

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const colorToSelect = (e.currentTarget.getAttribute("color"));
    setColor(colorToSelect);
  }

  return (
    <div style={{ width: width, height: height }} className='color-widget'>
      {
        colors.map(color => {
          return (
            color === currentColor ?
              <div style={{ backgroundColor: color, height: height / 2, width: width / 10.39, border: "1px solid white" }}></div>
              :
              <div color={color} onClick={handleClick} style={{ backgroundColor: color, height: height / 2, width: width / 10.39, border: "1px solid black" }}></div>
          )
        })
      }
    </div>
  )
}

export default ColorWidget;