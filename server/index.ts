import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
// import { v4 } from 'uuid';
import cors from 'cors';
const http = require('http');

dotenv.config();

const app: Express = express();
app.use(cors());
const server = http.createServer(app);
const port = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on("create-new-room", (data) => {
    // We are using the socket id for the admin/creator
    // of the room to create room, users will be able
    // to join the room if they have socket.id of that user
    socket.join(socket.id);
  })

  socket.on("join-room", (uuid) => {
    socket.join(uuid);
    const clients = io.sockets.adapter.rooms.get(uuid);
    const numClients = clients ? clients.size : 0;
    io.to(uuid).emit("player-joined", socket.id);
  })

  socket.on("start", (uuid) => {
    io.to(uuid).emit("start", {});
  })

  socket.on("send_coordinates", ({ roomID, pos }) => {
    // Sends the message to all the clients
    // except the one it recieved it from
    io.to(roomID).emit("recieve_message", pos);
  })

  socket.on("mouse-down", ({ roomID }) => {
    // data here is just {}
    io.to(roomID).emit("mouse-down", {});
  })

  socket.on("mouse-up", ({ roomID }) => {
    // data here is just {}
    io.to(roomID).emit("mouse-up", {});
  })
});

server.listen(port, () => {
  console.log(`listening on Port: ${port}`);
});