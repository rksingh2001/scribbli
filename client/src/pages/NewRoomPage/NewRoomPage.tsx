import './NewRoomPage.scss';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import usePlayerTurnId from '../../store/playerTurnStore';
import usePlayerList from '../../store/playerList';
import useRoomId from '../../store/roomId';
import useSocket from '../../store/socket';
import useGameState from '../../store/gameState';

const NewRoomPage = () => {
  const socket = useSocket(state => state.socket);
  const roomId = useRoomId(state => state.roomId);
  const [socketID] = useState(socket.id);
  const navigate = useNavigate();
  const setPlayerTurnId = usePlayerTurnId((state) => state.setPlayerTurnId);
  const playerList = usePlayerList(state => state.playerList);
  const setPlayerList = usePlayerList(state => state.setPlayerList);
  const setRound = useGameState(state => state.setRound);
  const [numOfRounds, selectNumOfRounds] = useState("3");

  // console.log("setPlayerTurnId", setPlayerTurnId);
  // console.log(playerList);

  useEffect(() => {
    setPlayerList([socketID]);

    socket.on("start", (data) => {
      setPlayerTurnId(data.playerTurn);
      setRound(data.currentRound)
      console.log("start", data.playerTurn);
      navigate("/DrawingPage");
    })

    socket.on("players-event", (players) => {
      setPlayerList(players);
    })
  }, [])

  const handleStart = () => {
    socket.emit("start", { roomId, numOfRounds });
    navigate("/DrawingPage")
  }

  const handleSelect = (e: any) => {
    selectNumOfRounds(e.target.value);
  }

  return (
    <div className="new-room-page">
      <div className="flexbox">Players in Room: {playerList.length}</div>
      <div className="flexbox">New Room Unique ID : {roomId}</div>
      <div className="flexbox">Copy the ID</div>
      <div className="flexbox">Waiting for users to join...</div>
      <div className='select-rounds'>
        <h5>Number of Rounds:</h5>
        <select onChange={handleSelect}>
          <option>1</option>
          <option selected>3</option>
          <option>5</option>
          <option>7</option>
          <option>10</option>
        </select>
      </div>
      <button onClick={handleStart}>Start</button>
    </div>
  )
}

export default NewRoomPage;