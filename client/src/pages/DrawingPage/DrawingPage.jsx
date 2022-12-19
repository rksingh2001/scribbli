import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";

import './DrawingPage.scss';

const DrawingPage = () => {
  return (
    <div className="drawing-page">
      <Canvas width={800} height={500} />
      <ChatWidget width={250} height={500} />
    </div>
  )
}

export default DrawingPage