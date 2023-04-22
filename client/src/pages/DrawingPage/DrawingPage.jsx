import { useContext, useEffect, useState } from "react";
import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";
import DrawingPageTimer from "../../components/DrawingPageTimer/DrawingPageTimer";
import SelectWordTimer from "../../components/SuggestionsOverlay/SuggestionsOverlay";
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
      <div><DrawingPageTimer /></div>
      { isTimer ? <SelectWordTimer /> : null }
      <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row'}}>
        <Canvas width={800} height={500} disable={isDisabled} />
        <ChatWidget width={250} height={500} />
      </div>
    </div>
  )
}

export default DrawingPage