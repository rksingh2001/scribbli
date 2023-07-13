import { MouseEventHandler } from 'react';
import useCanvasState from '../../store/canvasState';
import './LineWidthPicker.scss';

const LineWidthPicker = ({ width, height } : { width: number, height : number }) => {
  const currentLineWidth = useCanvasState(state => state.lineWidth);
  const setLineWidth = useCanvasState(state => state.setLineWidth);
  
  const allowedWidths = [
    2.5,
    5,
    10,
    15
  ];

  const handleClick : MouseEventHandler<HTMLDivElement> = (e) => {
    const lineWidthToSelect = (e.currentTarget.innerHTML);
    console.log(lineWidthToSelect)
    setLineWidth(Number(lineWidthToSelect));
  }

  return (
    <div className='line-width-picker' style={{ height: height, width: width }}>
      {
        allowedWidths.map(lineWidth => {
          return (
            currentLineWidth === lineWidth ?
              <div key={lineWidth} onClick={handleClick} style={{ color: "white", backgroundColor: "purple", height: height/2, width: width/2 }}>
                {lineWidth}
              </div>
              :
              <div key={lineWidth} onClick={handleClick} style={{ height: height/2, width: width/2 }}>
                {lineWidth}
              </div>
          )
        })
      }
    </div>
  )
}

export default LineWidthPicker;