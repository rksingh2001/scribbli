import './LandingPage.scss';

import { useNavigate } from 'react-router-dom';
import usePlayer from '../../store/playerStore';
import useSocket from '../../store/socket';
import useRoomId from '../../store/roomId';

const LandingPage = () => {
  const navigate = useNavigate();
  const playerName = usePlayer(state => state.name);
  const setName = usePlayer(state => state.setName);
  const socket = useSocket(state => state.socket);
  const setRoomId = useRoomId(state => state.setRoomId);

  const handleChange = (e: any) => {
    setName(e.target.value);
  }

  const handleNewRoomCreation = () => {
    socket.on('room-id', ({ roomId }) => {
      setRoomId(roomId);
    })
    socket.emit("create-new-room");
    socket.emit("save-name", { playerName });
    navigate('/NewRoomPage');
  }

  const handleJoinExistingRoomButton = () => {
    socket.emit("save-name", { playerName });
    navigate('/JoinExistingRoomPage');
  }

  return (
    <div className="landing-page">
      <div className="name-div">
        <h3 style={{ fontFamily: "sans-serif", color: "white" }}>Enter your name:</h3>
        <input onChange={handleChange} value={playerName} />
      </div>
      <button onClick={handleJoinExistingRoomButton}>Join Existing Room</button>
      <button onClick={handleNewRoomCreation}>Create New Room</button>
    </div>
  )
}

export default LandingPage;