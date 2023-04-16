import { useContext, useEffect } from 'react';
import './WaitingRoomPage.scss';
import { SocketContext } from '../../context/socket';
import { useNavigate } from 'react-router-dom';
import { PlayerTurnContext } from '../../context/playerTurn';

const WaitingRoomPage = () => {
  const socket = useContext(SocketContext);
  const playerTurnContext = useContext(PlayerTurnContext);
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("start", (data) => {
      // playerTurnContext.setplayerTurnId(data.playerTurn)
      
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