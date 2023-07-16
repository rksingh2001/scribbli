import './UtilitiesWidget.scss';
import { BiSolidEraser, BiSolidColorFill } from "react-icons/bi";
import useCanvasState from '../../store/canvasState';

const UtilitiesWidget = ({ width, height } : { width: number, height: number }) => {
  const utilitySelected = useCanvasState(state => state.utilitySelected);
  const setUtilitySelected = useCanvasState(state => state.setUtilitySelected);
  const setLineWidth = useCanvasState(state => state.setLineWidth);

  const handleClick = (utilityName: string) => {
    setUtilitySelected(utilityName);
    setLineWidth(undefined);
  }

  return (
    <div className='utilites-widget' style={{ width: width, height: height }}>
      <div onClick={() => handleClick('eraser')} style={{ width: width, height: height/2 }}>
        {utilitySelected === 'eraser' ? <BiSolidEraser size="large" color='purple' /> : <BiSolidEraser size="large" />}
      </div>
      <div onClick={() => handleClick('colorfill')} style={{ width: width, height: height/2 }}>
        {utilitySelected === 'colorfill' ? <BiSolidColorFill size="large" color="purple" /> : <BiSolidColorFill size="large" />}
      </div>
    </div>
  )
}

export default UtilitiesWidget;