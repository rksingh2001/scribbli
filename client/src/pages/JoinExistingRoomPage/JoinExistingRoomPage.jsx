import './JoinExistingRoomPage.scss';

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/socket';
import { RoomIdContext } from '../../context/roomid';
import { PlayersContext } from '../../context/players';


const JoinExistingRoomPage = () => {
  const socket = useContext(SocketContext);
  const roomIdContext = useContext(RoomIdContext);
  const playersContext = useContext(PlayersContext);
  const [roomID, setRoomID] = useState("");
  const navigate = useNavigate();

  console.log(playersContext.players)

  useEffect(() => {
    socket.on("players-event", (players) => {
      console.log(players);
      // playersContext.addPlayer(playerID);
    })
  }, [])

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