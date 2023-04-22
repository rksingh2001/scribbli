import { useEffect } from 'react';
import './WaitingRoomPage.scss';
import { useNavigate } from 'react-router-dom';
import usePlayerTurnId from '../../store/playerTurnStore';
import useSocket from '../../store/socket';

const WaitingRoomPage = () => {
  const socket = useSocket(state => state.socket);
  const navigate = useNavigate();
  const setPlayerTurnId = usePlayerTurnId(state => state.setPlayerTurnId);

  useEffect(() => {
    socket.on("start", (data) => {
      setPlayerTurnId(data.playerTurn);
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