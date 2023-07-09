import { getPlayerNameFromList } from '../../helpers/utilities';
import { socket } from '../../store/socket';
import './GameEndOverlay.scss';

const GameEndOverlay = ({ score }: any) => {
  console.log(score)
  return (
    <div className="overlay">
      <h3>Game has ended</h3>
      <div className="scores">
        {Object.keys(score).map((key) => {
          console.log(key,getPlayerNameFromList(key), "CDUJC")
          return (
            <div>{getPlayerNameFromList(key)} : {score[key]}</div>
          )
        })}
      </div>
    </div>
  )
}

export default GameEndOverlay;