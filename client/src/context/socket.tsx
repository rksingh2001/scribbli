import { createContext } from "react";
import io from "socket.io-client"; 

export const socket = io("http://localhost:8000");

// Passing socket as the default sets the correct type for Socket Context
export const SocketContext = createContext(socket);