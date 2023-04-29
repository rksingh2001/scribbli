import "./ScoreWidget.scss";
import { useEffect, useState } from "react";
import usePlayerList from "../../store/playerList";
import useSocket from "../../store/socket";

const ScoreWidget = ({ width, height } : { width: number, height: number }) => {
  const playerList = usePlayerList(state => state.playerList);
  const socket = useSocket(state => state.socket);

  type ScoreObjectType = {
    [key: string]: number
  }

  const initialScoreObj: ScoreObjectType = {};

  playerList.forEach(playerId => {
    initialScoreObj[playerId] = 0;
  });

  // Initial Score Object is all the player with ids and score equal to zero
  const [score, setScore] = useState(initialScoreObj);

  useEffect(() => {
    socket.on("score-updation", (scoreObj) => {
      if (scoreObj)
        setScore(scoreObj);
    })
  }, []);
  
  return (
    <div 
      className="score-widget"
      style={{ width: width, height: height }}
    >
      {
        Object.entries(score).map(([key, value]) => (
          <div className="score-widget-player" key={key}>
            <div className="score-widget-player-name">{key}</div>
            :
            <div className="score-widget-player-score">{value}</div>
          </div>
        ))
      }
    </div>
  )
}

export default ScoreWidget;