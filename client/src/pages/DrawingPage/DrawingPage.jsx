import { useContext, useEffect, useState } from "react";
import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";
import { PlayerTurnContext } from "../../context/playerTurn";
import { SocketContext } from '../../context/socket';
import { socket } from "../../context/socket";
import usePlayerTurnId from "../../store/playerTurnStore";

import './DrawingPage.scss';

const DrawingPage = () => {
  // const playerTurnContext = useContext(PlayerTurnContext);
  const socket = useContext(SocketContext);
  const [socketID] = useState(socket.id);
  const [isDisabled, setIsDisabled] = useState(true);

  console.log("isDaiables", isDisabled);

  const playerTurnId = usePlayerTurnId((state) => state.playerTurnId);
  console.log("bear", playerTurnId);

  useEffect(() => {
    // Check at the starting if it is the starting player
    console.log("REACHED HERE!", playerTurnId, socketID);
    if (socketID === playerTurnId) {
      console.log("somethin")
      setIsDisabled(false);
    }

    socket.on("change-player-turn", (data) => {
      if (socketID === data.playerTurn) {
        setIsDisabled(true);
      } else {
        // playerTurnContext.setplayerTurnId(data.playerTurn);
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