import { useContext, useEffect } from 'react';
import './WaitingRoomPage.scss';
import { SocketContext } from '../../context/socket';
import { useNavigate } from 'react-router-dom';

const WaitingRoomPage = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("start", (data) => {
      console.log("start")
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