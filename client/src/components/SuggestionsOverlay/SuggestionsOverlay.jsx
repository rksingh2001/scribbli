import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/gameState';
import useRoomId from '../../store/roomId';
import { socket } from '../../store/socket';
import './SuggestionsOverlay.scss';

const SuggestionsOverlay = () => {
  const [seconds, setSeconds] = useState();
  const intervalRef = useRef(null);
  const randomSuggestions = useGameState(state => state.randomSuggestions);
  const setIsTimer = useGameState(state => state.setIsTimer);
  const [wordToDraw, setWordToDraw] = useGameState(state => [state.wordToDraw, state.setWordToDraw]);
  const roomId = useRoomId(state => state.roomId);

  useEffect(() => {
    socket.on('select-word-timer', ({ count }) => {
      // This needs to be added as this useEffect runs only once, and wordToDraw is passed
      // as the original value only

      if (count === 0) {
        setIsTimer(false);
        socket.off('select-word-timer');
      } else {
        setSeconds(count);
      }
    })
  }, []);

  const handleClick = (suggestion) => {
    console.log('suggestion', suggestion)
    socket.emit('word-selected-to-draw', { word: randomSuggestions[0] });
    setWordToDraw(suggestion);
  }

  return (
    <div className="timer">
       Timer : {seconds}
       <div>
        { 
          randomSuggestions.map(suggestion => {
            if (suggestion === wordToDraw) {
              return (
                <button 
                  id={suggestion} 
                  onClick={() => handleClick(suggestion)} 
                  className='timer-button highlighted-button'
                > 
                  {suggestion}
                </button>
              )
            } else {
              return (
                <button 
                  id={suggestion} 
                  onClick={() => handleClick(suggestion)} 
                  className='timer-button'
                > 
                  {suggestion}
                </button>
              )
            }
        })}
       </div>
    </div>
  )
}

export default SuggestionsOverlay;