import { useContext, useState, useEffect, useRef } from 'react';
import './ChatWidget.scss';
import useRoomId from '../../store/roomId';
import useSocket from '../../store/socket';
import usePlayerTurnId from '../../store/playerTurnStore';
import usePlayerList from '../../store/playerList';
import { BREAK_POINT, RATIO as ratio } from '../../helpers/constants';

const innerWidth = window.innerWidth;
const canvasWidthPercentage = innerWidth <= BREAK_POINT ? 0.9 : 0.557;
const ChatWidget = () => {
  const [messages, setMessages] = useState([{ msg: "", colors: ["white", "white"] }]);  // [message, senderId]
  const [inputValue, setInputValue] = useState("");
  const socket = useSocket(state => state.socket);
  const roomId = useRoomId(state => state.roomId);
  const playerTurnId = usePlayerTurnId(state => state.playerTurnId);
  const playersList = usePlayerList(state => state.playerList);
  const width = useRef(innerWidth * 0.15)
  const [height, setHeight] = useState(innerWidth * canvasWidthPercentage / ratio);

  const getPlayerColors = (playerId: string) => {
    return playersList.filter(player => player.playerId === playerId)[0].playerColors;
  }

  useEffect(() => {
    window.addEventListener("resize", () => {
      const innerWidth = window.innerWidth;
      width.current = (innerWidth * 0.15);
      setHeight(innerWidth * canvasWidthPercentage / ratio);
    })
  }, []);

  useEffect(() => {
    socket.on("recieve-message", ({ senderID, msg }) => {
      if (messages.length > 50) messages.shift();
      setMessages(current => [...current, { msg, colors: getPlayerColors(senderID) }]);
    })
  }, []);

  const handleChange = (e: any) => {
    setInputValue(e.target.value);
  }

  const handleKeyDown = (e: any) => {
    if (e.key !== 'Enter') return;
    if (socket.id === playerTurnId) return;

    // Emit the Message to rest of the users
    socket.emit("send-message", { roomId: roomId, msg: inputValue });
    setInputValue("");
  }

  return (
    <div style={{ height: height, width: width.current }} className="chat-widget">
      <div className='chat-messages'>
        {messages.map((message, idx) => {
          return (
            <div style={{ backgroundColor: message.colors[0], color: message.colors[1] }} key={idx}>{message.msg}</div>
          )
        })}
      </div>
      <div className='chat-input'>
        {socket.id != playerTurnId ? <input onKeyDown={handleKeyDown} onChange={handleChange} value={inputValue} /> : <input disabled />}
      </div>
    </div>
  )
}

export default ChatWidget;