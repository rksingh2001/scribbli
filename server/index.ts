import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { v4 } from 'uuid';
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

  socket.on("send_coordinates", (data) => {
    console.log(data);
    // Sends the message to all the clients
    // except the one it recieved it from
    socket.broadcast.emit("recieve_message", data);
  })

  socket.on("mouse-down", (data) => {
    // data here is just {}
    socket.broadcast.emit("mouse-down", data);
  })

  socket.on("mouse-up", (data) => {
    // data here is just {}
    socket.broadcast.emit("mouse-up", data);
  })
});

server.listen(port, () => {
  console.log(`listening on Port: ${port}`);
});