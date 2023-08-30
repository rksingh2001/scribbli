import "./ScoreWidget.scss";
import { useEffect, useRef, useState } from "react";
import usePlayerList from "../../store/playerList";
import useSocket from "../../store/socket";
import { getSortedScoreArray } from "../../helpers/utilities";
// import { BREAK_POINT } from "../../helpers/constants";
import { RATIO as ratio, BREAK_POINT } from "../../helpers/constants";

type ScoreObjectType = {
  [key: string]: number
}

const ScoreWidget = () => {
  const playerList = usePlayerList(state => state.playerList);
  const socket = useSocket(state => state.socket);
  const width = useRef(window.innerWidth * 0.15)
  const canvasWidthPercentage = window.innerWidth <= BREAK_POINT ? 0.9 : 0.557;
  const [height, setHeight] = useState(window.innerWidth * canvasWidthPercentage / ratio);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const innerWidth = window.innerWidth;
      width.current = (innerWidth * 0.15);
      setHeight(innerWidth * canvasWidthPercentage / ratio);
    })
  }, []);

  const initialScoreObj: ScoreObjectType = {};

  playerList.forEach(({ playerId }) => {
    initialScoreObj[playerId] = 0;
  });

  // Initial Score Object is all the player with ids and score equal to zero
  const [score, setScore] = useState(initialScoreObj);

  const getPlayerColors = (playerId: string) => {
    return playerList.filter(player => player.playerId === playerId)[0].playerColors;
  }

  const getPlayerNameFromList = (playerId: string) => {
    return playerList.filter(player => player.playerId === playerId)[0].playerName;
  }

  useEffect(() => {
    socket.on("score-updation", (scoreObj) => {
      if (scoreObj)
        setScore(scoreObj);
    })
  }, []);

  return (
    <div
      className="score-widget"
      style={{ height: height }}
    >
      {
        getSortedScoreArray(score).map(sc => {
          if (sc[0] === socket.id)
            return (
              <div style={{ backgroundColor: getPlayerColors(sc[0])[0], color: getPlayerColors(sc[0])[1] }} className="score-widget-player" key={sc[0]}>
                <div className="score-widget-player-name">{getPlayerNameFromList(sc[0])}</div>
                :
                <div className="score-widget-player-score">{sc[1]}</div>
              </div>
            )
          else
            return (
              <div className="score-widget-player" style={{ backgroundColor: getPlayerColors(sc[0])[0], color: getPlayerColors(sc[0])[1] }} key={sc[0]}>
                <div className="score-widget-player-name">{getPlayerNameFromList(sc[0])}</div>
                :
                <div className="score-widget-player-score">{sc[1]}</div>
              </div>
            )
        })
      }
    </div>
  )
}

export default ScoreWidget;