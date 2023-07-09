import { useEffect } from 'react';
import './WaitingRoomPage.scss';
import { useNavigate } from 'react-router-dom';
import usePlayerTurnId from '../../store/playerTurnStore';
import useSocket from '../../store/socket';
import useGameState from '../../store/gameState';

const WaitingRoomPage = () => {
  const socket = useSocket(state => state.socket);
  const navigate = useNavigate();
  const setPlayerTurnId = usePlayerTurnId(state => state.setPlayerTurnId);
  const setRound = useGameState(state => state.setRound);

  useEffect(() => {
    socket.on("start", (data) => {
      setPlayerTurnId(data.playerTurn);
      setRound(data.currentRound);
      navigate("/DrawingPage");
    })
  }, [])

  return (
    <div className='waiting-room-page'>
      <div>Waiting for admin to start...</div>
    </div>
  )
}

export default WaitingRoomPage;