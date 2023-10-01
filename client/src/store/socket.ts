import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import useGameState from "./gameState";
import { v4 as uuidv4 } from 'uuid';

export const socket = io(import.meta.env.VITE_SERVER_URL);

type SocketType = {
  socket: Socket
}

// Passing socket as the default sets the correct type for Socket Context
const useSocket = create<SocketType>((set) => ({
  socket: socket,
}))

socket.on('connect', () => {
  const playerId = localStorage.getItem('playerId');
  if (playerId) {
    setTimeout(() => {
      socket.emit('player-id', { playerId });
    }, 100)
  } else {
    const playerId = uuidv4();
    localStorage.setItem('playerId', playerId); 
    socket.emit('player-id', { playerId });
  }
})

// This is the beginning of player's turn on this round
socket.on('random-suggestions', (data) => {
  const setRandomSuggestions = useGameState.getState().setRandomSuggestions;
  const setIsTimer = useGameState.getState().setIsTimer;
  const setWordToDraw = useGameState.getState().setWordToDraw;

  setRandomSuggestions(data.randomSuggestions);
  setWordToDraw(data.randomSuggestions[0]);
  setIsTimer(true);
})

// socket.on('')

export default useSocket;