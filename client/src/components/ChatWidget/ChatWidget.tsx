import { useContext, useState, useEffect } from 'react';
import './ChatWidget.scss';
import { SocketContext } from '../../context/socket';
import useRoomId from '../../store/roomId';

const ChatWidget = ({ height, width } : { height: number, width: number }) => {
  const [messages, setMessages] = useState([""]);
  const [inputValue, setInputValue] = useState("");
  const socket = useContext(SocketContext);
  const roomId = useRoomId(state => state.roomId);

  useEffect(() => {
    socket.on("recieve-message", ({ senderID, msg }) => {
      setMessages(current => [...current, msg]);
    })
  }, []);

  const handleChange = (e: any) => {
    setInputValue(e.target.value);
  }

  const handleKeyDown = (e: any) => {
    if (e.key !==  'Enter') return;
    
    // Emit the Message to rest of the users
    socket.emit("send-message", { roomId: roomId, msg: inputValue });
    setInputValue("");
  }

  return (
    <div style={{ height: height, width: width }} className="chat-widget">
      <div className='chat-messages'>
        {messages.map((message, idx) => {
          return (
            <div key={idx}>{message}</div>
          )
        })}
      </div>
      <div className='chat-input'>
        <input onKeyDown={handleKeyDown} onChange={handleChange} value={inputValue} />
      </div>
    </div>
  )
}

export default ChatWidget;