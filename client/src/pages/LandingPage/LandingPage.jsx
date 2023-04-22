import './LandingPage.scss';

import { useNavigate } from 'react-router-dom';
import usePlayer from '../../store/playerStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const playerName = usePlayer(state => state.playerName);
  const setPlayerName = usePlayer(state => state.setPlayerName);
  
  const handleChange = (e) => {
    setPlayerName(e.target.value);
  }

  return (
    <div className="landing-page">
      <div className="name-div">
        <h3 onChange={handleChange} value={playerName} style={{ fontFamily: "sans-serif", color: "white" }}>Enter your name:</h3>
        <input />
      </div>
      <button onClick={() => {navigate('/JoinExistingRoomPage')}}>Join Existing Room</button>
      <button onClick={() => {navigate('/NewRoomPage')}}>Create New Room</button>
    </div>
  )
}

export default LandingPage;