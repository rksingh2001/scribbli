import { useContext, useEffect, useState } from "react";
import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";
import { SocketContext } from '../../context/socket';
import usePlayerTurnId from "../../store/playerTurnStore";

import './DrawingPage.scss';

const DrawingPage = () => {
  const socket = useContext(SocketContext);
  const [socketID] = useState(socket.id);
  const [isDisabled, setIsDisabled] = useState(true);
  const playerTurnId = usePlayerTurnId((state) => state.playerTurnId);
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);

  useEffect(() => {
    if (socketID === playerTurnId) {
      console.log("somethin")
      setIsDisabled(false);
    }

    socket.on("change-player-turn", (data) => {
      setPlayerTurnId(data.playerTurn);

      if (socketID === data.playerTurn) {
        setIsDisabled(true);
      } else {
        if (isDisabled) {
          setIsDisabled(false);
        }
      }
    })
  }, []);

  useEffect(() => {
    if (playerTurnId === socketID) {
      setIsDisabled(false);
    } else {
      if (!isDisabled) setIsDisabled(true);
    }
  }, [playerTurnId])

  return (
    <div className="drawing-page">
      <Canvas width={800} height={500} disable={isDisabled} />
      <ChatWidget width={250} height={500} />
    </div>
  )
}

export default DrawingPage