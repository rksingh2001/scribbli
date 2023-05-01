import './NewRoomPage.scss';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import usePlayerTurnId from '../../store/playerTurnStore';
import usePlayerList from '../../store/playerList';
import useRoomId from '../../store/roomId';
import useSocket from '../../store/socket';

const NewRoomPage = () => {
  const socket = useSocket(state => state.socket);
  const roomId = useRoomId(state => state.roomId);
  const [socketID] = useState(socket.id);
  const navigate = useNavigate();
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);
  const playerList = usePlayerList(state => state.playerList);
  const setPlayerList = usePlayerList(state => state.setPlayerList);

  console.log("setPlayerTurnId", setPlayerTurnId);
  console.log(playerList);

  useEffect(() => {
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
    socket.emit("start", roomId);
    navigate("/DrawingPage")
  }

  return (
    <div className="new-room-page">
      <div>Players in Room: {playerList.length}</div>
      <div>New Room Unique ID : {roomId}</div>
      <div>Copy the ID</div>
      <div>Waiting for users to join...</div>
      <button onClick={handleStart}>Start</button>
    </div>
  )
}

export default NewRoomPage;