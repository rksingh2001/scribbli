import { useContext, useEffect, useState } from "react";
import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";
import Timer from "../../components/Timer/Timer";
import useGameState from "../../store/gameState";
import usePlayerTurnId from "../../store/playerTurnStore";
import useSocket from "../../store/socket";

import './DrawingPage.scss';

const DrawingPage = () => {
  const socket = useSocket(state => state.socket);
  const [socketID] = useState(socket.id);
  const playerTurnId = usePlayerTurnId((state) => state.playerTurnId);
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);
  const [isDisabled, setIsDisabled] = useGameState(state => [state.isDisabled, state.setIsDisabled]);
  const isTimer = useGameState(state => state.isTimer);
  
  useEffect(() => {
    if (socketID === playerTurnId) {
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
  }, [playerTurnId]);

  return (
    <div className="drawing-page">
      { isTimer ? <Timer /> : null }
      <Canvas width={800} height={500} disable={isDisabled} />
      <ChatWidget width={250} height={500} />
    </div>
  )
}

export default DrawingPage