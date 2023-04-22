import { create } from "zustand";
import { io, Socket } from "socket.io-client"; 

export const socket = io("http://localhost:8000");

type SocketType = {
  socket: Socket
}

// Passing socket as the default sets the correct type for Socket Context
const useSocket = create<SocketType>((set) => ({
  socket: socket,
}))

export default useSocket;