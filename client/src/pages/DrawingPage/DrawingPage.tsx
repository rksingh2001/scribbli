import { useContext, useEffect, useState } from "react";
import Canvas from "../../components/Canvas/Canvas";
import ChatWidget from "../../components/ChatWidget/ChatWidget";
import ColorWidget from "../../components/ColorWidget/ColorWidget";
import DrawingPageTimer from "../../components/DrawingPageTimer/DrawingPageTimer";
import GameEndOverlay from "../../components/GameEndOverlay/GameEndOverlay";
import LineWidthPicker from "../../components/LineWidthPicker/LineWidthPicker";
import ScoreWidget from "../../components/ScoreWidget/ScoreWidget";
import SelectWordTimer from "../../components/SuggestionsOverlay/SuggestionsOverlay";
import UtilitiesWidget from "../../components/UtilitiesWidget/UtilitiesWidget";
import useGameState from "../../store/gameState";
import usePlayerTurnId from "../../store/playerTurnStore";
import useSocket from "../../store/socket";

import './DrawingPage.scss';

type ScoreObjectType = {
  [key: string]: number
}

const DrawingPage = () => {
  const socket = useSocket(state => state.socket);
  const [socketID] = useState(socket.id);
  const playerTurnId = usePlayerTurnId((state) => state.playerTurnId);
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);
  const [isDisabled, setIsDisabled] = useGameState(state => [state.isDisabled, state.setIsDisabled]);
  const isTimer = useGameState(state => state.isTimer);
  const round = useGameState(state => state.round);
  const setRound = useGameState(state => state.setRound);
  const [isGameEnd, setIsGameEnd] = useState(false);
  const [score, setScore] = useState({});

  useEffect(() => {
    if (socketID === playerTurnId) {
      setIsDisabled(false);
    }

    socket.on("change-player-turn", (data) => {
      setPlayerTurnId(data.playerTurn);
      setRound(data.currentRound);

      if (socketID === data.playerTurn) {
        setIsDisabled(true);
      } else {
        if (isDisabled) {
          setIsDisabled(false);
        }
      }
    })

    socket.on("game-end", ({ score }) => {
      // score = );
      // console.log(score1);
      setScore(score);
      setIsGameEnd(true);
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
      <div style={{ fontSize: "2rem" }} className="flexbox">Round: {round}</div>
      <div><DrawingPageTimer /></div>
      {isTimer ? <SelectWordTimer /> : null}
      {isGameEnd ? <GameEndOverlay score={score} /> : null}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexDirection: 'row',
          gap: "1%"
        }}>
        <ScoreWidget />
        <Canvas disable={isDisabled} />
        <ChatWidget />
      </div>
      <div style={{ gap: "0.5rem" }} className="flexbox">
        <ColorWidget width={400} height={80} />
        <LineWidthPicker width={80} height={80} />
        <UtilitiesWidget width={40} height={80} />
      </div>
    </div>
  )
}

export default DrawingPage