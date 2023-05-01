import './LandingPage.scss';

import { useNavigate } from 'react-router-dom';
import usePlayer from '../../store/playerStore';
import useSocket from '../../store/socket';
import useRoomId from '../../store/roomId';

const LandingPage = () => {
  const navigate = useNavigate();
  const playerName = usePlayer(state => state.playerName);
  const setPlayerName = usePlayer(state => state.setPlayerName);
  const socket = useSocket(state => state.socket);
  const setRoomId = useRoomId(state => state.setRoomId);
  
  const handleChange = (e) => {
    setPlayerName(e.target.value);
  }

  const handleNewRoomCreation = () => {
    socket.on('room-id', ({ roomId }) => {
      setRoomId(roomId);
    })
    socket.emit("create-new-room");
    navigate('/NewRoomPage');
  }

  return (
    <div className="landing-page">
      <div className="name-div">
        <h3 onChange={handleChange} value={playerName} style={{ fontFamily: "sans-serif", color: "white" }}>Enter your name:</h3>
        <input />
      </div>
      <button onClick={() => {navigate('/JoinExistingRoomPage')}}>Join Existing Room</button>
      <button onClick={handleNewRoomCreation}>Create New Room</button>
    </div>
  )
}

export default LandingPage;