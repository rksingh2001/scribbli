import { create } from "zustand";
import { io, Socket } from "socket.io-client"; 
import useGameState from "./gameState";

export const socket = io("http://localhost:8000");

type SocketType = {
  socket: Socket
}

// Passing socket as the default sets the correct type for Socket Context
const useSocket = create<SocketType>((set) => ({
  socket: socket,
}))

// This is the beginning of player's turn on this round
socket.on('random-suggestions', (data) => {
  const setRandomSuggestions = useGameState.getState().setRandomSuggestions;
  const setIsTimer = useGameState.getState().setIsTimer;

  setRandomSuggestions(data.randomSuggestions);
  setIsTimer(true);
})

export default useSocket;