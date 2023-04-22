import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/gameState';
import './Timer.scss';

const Timer = () => {
  const [seconds, setSeconds] = useState(10);
  const intervalRef = useRef(null);
  const randomSuggestions = useGameState(state => state.randomSuggestions);
  const setIsTimer = useGameState(state => state.setIsTimer);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      clearInterval(intervalRef.current);
      console.log(setIsTimer)
      setIsTimer(false);
    }
  }, [seconds]);


  return (
    <div className="timer">
       Timer : {seconds}
       <div>
        { 
          randomSuggestions.map(suggestion => {
            return (
              <button className='timer-button'> {suggestion} </button>
            )
        })}
       </div>
    </div>
  )
}

export default Timer;