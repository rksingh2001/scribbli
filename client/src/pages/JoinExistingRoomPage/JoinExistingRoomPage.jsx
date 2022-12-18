import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/socket';
import { RoomIdContext } from '../../context/roomid';

import './JoinExistingRoomPage.scss';

const JoinExistingRoomPage = () => {
  const socket = useContext(SocketContext);
  const roomIdContext = useContext(RoomIdContext);
  const [roomID, setRoomID] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setRoomID(e.target.value);
  }

  const handleClick = () => {
    socket.emit("join-room", roomID);
    roomIdContext.setRoomID(roomID);
    navigate("/WaitingRoomPage");
  }

  return (
    <div className="join-existing-room-page">
      <input onChange={handleChange} value={roomID} placeholder='Enter Room ID' className='join-room-input' />
      <button onClick={handleClick}>Join Existing Room</button>
    </div>
  )
}

export default JoinExistingRoomPage;