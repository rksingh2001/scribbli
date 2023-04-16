import { BrowserRouter, Route, Routes } from "react-router-dom";
import { socket, SocketContext } from './context/socket';

import './App.css';
import LandingPage from './pages/LandingPage/LandingPage';
import DrawingPage from './pages/DrawingPage/DrawingPage';
import NewRoomPage from './pages/NewRoomPage/NewRoomPage';
import JoinExistingRoomPage from './pages/JoinExistingRoomPage/JoinExistingRoomPage';
import WaitingRoomPage from "./pages/WaitingRoomPage/WaitingRoomPage";

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/DrawingPage" element={<DrawingPage />} />
          <Route path="/NewRoomPage" element={<NewRoomPage />} />
          <Route path="/WaitingRoomPage" element={<WaitingRoomPage />} />
          <Route path="/JoinExistingRoomPage" element={<JoinExistingRoomPage />} />
        </Routes>
      </BrowserRouter>
    </SocketContext.Provider>
  );
}

export default App;
