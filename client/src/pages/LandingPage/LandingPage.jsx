import './LandingPage.scss';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <button onClick={() => {navigate('/JoinExistingRoomPage')}}>Join Existing Room</button>
      <button onClick={() => {navigate('/NewRoomPage')}}>Create New Room</button>
    </div>
  )
}

export default LandingPage;