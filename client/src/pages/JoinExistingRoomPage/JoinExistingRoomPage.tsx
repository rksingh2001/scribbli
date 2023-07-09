import './JoinExistingRoomPage.scss';

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerList from '../../store/playerList';
import useRoomId from '../../store/roomId';
import useSocket from '../../store/socket';


const JoinExistingRoomPage = () => {
  const socket = useSocket(state => state.socket);
  const roomId = useRoomId(state => state.roomId);
  const setRoomId = useRoomId(state => state.setRoomId);
  const playerList = usePlayerList(state => state.playerList);
  const setPlayerList = usePlayerList(state => state.setPlayerList);
  const navigate = useNavigate();

  console.log(playerList)

  useEffect(() => {
    socket.on("players-event", (players) => {
      setPlayerList(players);
    })
  }, [])

  const handleChange = (e: any) => {
    setRoomId(e.target.value);
  }

  const handleClick = () => {
    socket.emit("join-room", roomId);
    navigate("/WaitingRoomPage");
  }

  return (
    <div className="join-existing-room-page">
      <input onChange={handleChange} value={roomId} placeholder='Enter Room ID' className='join-room-input' />
      <button onClick={handleClick}>Join Existing Room</button>
    </div>
  )
}

export default JoinExistingRoomPage;