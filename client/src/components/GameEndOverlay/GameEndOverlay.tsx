import { getPlayerNameFromList, getSortedScoreArray } from '../../helpers/utilities';
import { socket } from '../../store/socket';
import './GameEndOverlay.scss';

const GameEndOverlay = ({ score }: any) => {
  console.log(getSortedScoreArray(score));

  return (
    <div className="overlay">
      <h3>Game has ended</h3>
      <div className="scores">
        {getSortedScoreArray(score).map(sc => {
          return (
            <div key={sc[0]}>{getPlayerNameFromList(sc[0])} : {sc[1]}</div>
          )
        })}
        {/* {Object.keys(score).map((key) => {
          return (
            <div>{getPlayerNameFromList(key)} : {score[key]}</div>
          )
        })} */}
      </div>
    </div>
  )
}

export default GameEndOverlay;