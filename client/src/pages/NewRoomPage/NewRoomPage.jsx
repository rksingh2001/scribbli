import { useEffect } from 'react';
import { useContext } from 'react';

import { SocketContext } from '../../context/socket';

import './NewRoomPage.scss';

const NewRoomPage = () => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    const createNewRoom = () => {
      socket.emit("create-new-room", {});
    }

    createNewRoom();
  }, [])

  return (
    <div className="new-room-page">
      <div>Players in Room: 1</div>
      <div>New Room Unique ID : EnciE94</div>
      <div>Copy the ID</div>
      <div>Waiting for users to join...</div>
      <button>Start</button>
    </div>
  )
}

export default NewRoomPage;