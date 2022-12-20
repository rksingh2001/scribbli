import './LandingPage.scss';

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../../context/player';

const LandingPage = () => {
  const navigate = useNavigate();
  const playerContext = useContext(PlayerContext);
  
  const handleChange = (e) => {
    playerContext.setName(e.target.value);
  }

  return (
    <div className="landing-page">
      <div className="name-div">
        <h3 onChange={handleChange} value={playerContext.name} style={{ fontFamily: "sans-serif", color: "white" }}>Enter your name:</h3>
        <input />
      </div>
      <button onClick={() => {navigate('/JoinExistingRoomPage')}}>Join Existing Room</button>
      <button onClick={() => {navigate('/NewRoomPage')}}>Create New Room</button>
    </div>
  )
}

export default LandingPage;