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
      <p style={{ fontFamily: "Barriecito", fontSize: "10rem", color: "white" }}>Scribbli</p>
      <div className="name-div">
        {/* <h3 style={{ color: "white" }}>Enter your name:</h3> */}
        <input placeholder="Enter your name..." onChange={handleChange} value={playerName} />
      <button onClick={handleJoinExistingRoomButton}>Join Existing Room</button>
      <button onClick={handleNewRoomCreation}>Create New Room</button>
      </div>
    </div>
  )
}

export default LandingPage;