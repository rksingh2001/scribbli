import { MouseEventHandler } from 'react';
import useCanvasState from '../../store/canvasState';
import './LineWidthPicker.scss';

const LineWidthPicker = ({ width, height } : { width: number, height : number }) => {
  const currentLineWidth = useCanvasState(state => state.lineWidth);
  const setLineWidth = useCanvasState(state => state.setLineWidth);
  const color = useCanvasState(state => state.color);
  
  const allowedWidths = [
    2.5,
    5,
    10,
    20
  ];

  const handleClick = (lineWidthToSelect: number) => {
    setLineWidth(lineWidthToSelect);
  }

  return (
    <div className='line-width-picker' style={{ height: height, width: width }}>
      {
        allowedWidths.map(lineWidth => {
          return (
            currentLineWidth === lineWidth ?
              <div key={lineWidth} style={{ color: "white", backgroundColor: "white", height: height/2, width: width/2 }}>
                <div style={{ border: "2.5px solid black", backgroundColor: color, height: lineWidth*1.3, width: lineWidth*1.3, borderRadius: "100%" }} ></div>
              </div>
              :
              <div key={lineWidth} onClick={() => handleClick(lineWidth)} style={{ zIndex: 10 , height: height/2, width: width/2 }}>
                <div style={{ border: "1px solid black", backgroundColor: color, height: lineWidth*1.3, width: lineWidth*1.3, borderRadius: "100%" }} ></div>
              </div>
          )
        })
      }
    </div>
  )
}

export default LineWidthPicker;