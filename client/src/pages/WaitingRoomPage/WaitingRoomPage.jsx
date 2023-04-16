import { useContext, useEffect } from 'react';
import './WaitingRoomPage.scss';
import { SocketContext } from '../../context/socket';
import { useNavigate } from 'react-router-dom';
import usePlayerTurnId from '../../store/playerTurnStore';

const WaitingRoomPage = () => {
  const socket = useContext(SocketContext);
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