import './NewRoomPage.scss';
import { useEffect, useState } from 'react';
import { useContext } from 'react';

import { SocketContext } from '../../context/socket';

import { useNavigate } from 'react-router-dom';
import { RoomIdContext } from '../../context/roomid';
import usePlayerTurnId from '../../store/playerTurnStore';
import usePlayerList from '../../store/playerList';

const NewRoomPage = () => {
  const socket = useContext(SocketContext);
  const roomIdContext = useContext(RoomIdContext);
  const [socketID] = useState(socket.id);
  const navigate = useNavigate();
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);
  const playerList = usePlayerList(state => state.playerList);
  const setPlayerList = usePlayerList(state => state.setPlayerList);

  console.log("setPlayerTurnId", setPlayerTurnId);
  console.log(playerList);

  useEffect(() => {
    roomIdContext.setRoomID(socketID);
    setPlayerList([socketID]);

    socket.on("start", (data) => {
      setPlayerTurnId(data.playerTurn);
      console.log("start", data.playerTurn);
      navigate("/DrawingPage");
    })

    socket.on("players-event", (players) => {
      setPlayerList(players);
    })
  }, [])

  const handleStart = () => {
    socket.emit("start", socketID);
    navigate("/DrawingPage")
  }

  return (
    <div className="new-room-page">
      <div>Players in Room: {playerList.length}</div>
      <div>New Room Unique ID : {socketID}</div>
      <div>Copy the ID</div>
      <div>Waiting for users to join...</div>
      <button onClick={handleStart}>Start</button>
    </div>
  )
}

export default NewRoomPage;