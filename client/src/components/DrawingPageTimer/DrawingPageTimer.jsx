import { useEffect, useState } from 'react';
import { socket } from '../../store/socket';
import './DrawingPageTimer.scss';

const DrawingPageTimer = () => {
  const [seconds, setSeconds] = useState();
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on('drawing-page-timer', ({ count, message }) => {
      setSeconds(count);
      setMessage(message);
    })
  }, []);

  return (
    <div className='drawing-page-timer'>Timer: {seconds} {message}</div>
  )
}

export default DrawingPageTimer;