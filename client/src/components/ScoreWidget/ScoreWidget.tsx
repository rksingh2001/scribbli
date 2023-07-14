import "./ScoreWidget.scss";
import { useEffect, useState } from "react";
import usePlayerList from "../../store/playerList";
import useSocket from "../../store/socket";
import { getPlayerNameFromList, getSortedScoreArray } from "../../helpers/utilities";

const ScoreWidget = ({ width, height } : { width: number, height: number }) => {
  const playerList = usePlayerList(state => state.playerList);
  const socket = useSocket(state => state.socket);
  
  type ScoreObjectType = {
    [key: string]: number
  }
  
  const initialScoreObj: ScoreObjectType = {};
  
  playerList.forEach(({ playerId }) => {
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

  console.log("This is score", score)
  
  return (
    <div 
      className="score-widget"
      style={{ width: width, height: height }}
    >
      {
        getSortedScoreArray(score).map(sc => {
          if (sc[0] === socket.id)
            return (
              <div style={{ color: "purple" }} className="score-widget-player" key={sc[0]}>
                <div className="score-widget-player-name">{getPlayerNameFromList(sc[0])}</div>
                :
                <div className="score-widget-player-score">{sc[1]}</div>
              </div>
            )
          else
          return (
            <div className="score-widget-player" key={sc[0]}>
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