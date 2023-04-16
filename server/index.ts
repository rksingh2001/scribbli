import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';

dotenv.config();

const app: Express = express();
app.use(cors());
const server = http.createServer(app);
const port = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Server responding!");
})

const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// This function will be the starting point of the game and will control the game flow
// It will emit all the important stuff like what to do? Options to choose words
// Will tell to all the clients, whose turn it is, would enable and disable drawing
// for those clients respectively.
const startGame = async (roomName: string) => {
  const visitedPlayers: Set<string> = new Set();

  // Limited to max 8 iterations so as not to create a lot of garbage memory
  for (let i = 0; i < 8; ++i) {
    const room = io?.sockets?.adapter?.rooms?.get(roomName) ?? "";
    if (!room) {
      console.error("Room doesn't exist");
      return;
    }

    let playerSocketId = "";

    for (const socketId of room) {
      if (!visitedPlayers.has(socketId)) {
        playerSocketId = socketId;
        break;
      }
    }

    if (playerSocketId !== "")  {
      console.log("i: " + i);
      // Assign a player turn
      if (i === 0) {
        io.in(roomName).emit("start", {
          playerTurn: playerSocketId,
        });
      } else {
        io.in(roomName).emit("change-player-turn", {
          playerTurn: playerSocketId,
        })
      }

      visitedPlayers.add(playerSocketId);

      await sleep(10000);
    } else {
      // This means that this round is now over
      break;
    }
  }

  console.log("Round Ended!!!");
  return;
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on("send-message", ({ roomID, msg }) => {
    const socketID = socket.id;
    io.to(roomID).emit("recieve-message", { senderID: socketID, msg: msg });
  })

  socket.on("create-new-room", (data) => {
    // We are using the socket id for the admin/creator
    // of the room to create room, users will be able
    // to join the room if they have socket.id of that user
    socket.join(socket.id);
  })

  socket.on("join-room", (uuid) => {
    socket.join(uuid);
    // const clients = io.sockets.adapter.rooms.get(uuid);
    // const numClients = clients ? clients.size : 0;

    // We want to send the list of all the clients to the client
    // after it joins the room
    const players = io.sockets.adapter.rooms.get(uuid);
    if (players)
      io.in(uuid).emit("players-event", [...players])
    else
      throw console.error("No Clients in the room:", uuid);
  })

  socket.on("start", (uuid) => {
    startGame(uuid);
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