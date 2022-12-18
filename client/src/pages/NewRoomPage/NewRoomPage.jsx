import { useEffect, useState } from 'react';
import { useContext } from 'react';

import { SocketContext } from '../../context/socket';

import './NewRoomPage.scss';
import { useNavigate } from 'react-router-dom';
import { RoomIdContext } from '../../context/roomid';

const NewRoomPage = () => {
  const socket = useContext(SocketContext);
  const roomIdContext = useContext(RoomIdContext);
  const [socketID] = useState(socket.id);
  const [players, setPlayers] = useState([socket.id]);
  const navigate = useNavigate();

  useEffect(() => {
    roomIdContext.setRoomID(socketID);
    socket.on("player-joined", (playerID) => {
      setPlayers(current => [...current, playerID]);
    })
  }, [])

  const handleStart = () => {
    socket.emit("start", socketID);
    navigate("/DrawingPage")
  }

  return (
    <div className="new-room-page">
      <div>Players in Room: {players.length}</div>
      <div>New Room Unique ID : {socketID}</div>
      <div>Copy the ID</div>
      <div>Waiting for users to join...</div>
      <button onClick={handleStart}>Start</button>
    </div>
  )
}

export default NewRoomPage;