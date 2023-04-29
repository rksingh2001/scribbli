import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { getRandomSuggestions, sendOnlyToSocketId, sleep } from './utilities';
import { suggestions } from './constants';

dotenv.config();

const app: Express = express();
app.use(cors());
const server = http.createServer(app);
const port = process.env.PORT;

type ScoreObjectType = {
  [key: string]: number
}

type GameStateObjectType = {
  isPlaying: boolean,
  score: ScoreObjectType,
  word?: string,
}

type GameStateType = Map<string, GameStateObjectType>;

// roomId -> GameStateObject
const gameState: GameStateType = new Map();
const safeAssign: <T>(target: T, ...sources: Partial<T>[]) => T = Object.assign

// Updates the key, or add the key if not already there
const updateValuesInGameState = (newObj: Partial<GameStateObjectType>, roomId: string) => {
  const gameStateObj = gameState.get(roomId);

  if (!gameStateObj) {
    // In case the object isn't present in the Map
    // this make sures there is no error as newObj type is not gameStateObjectType

    // Get the complete Map of all the people

    const newObjRef: GameStateObjectType = {
      isPlaying: false,
      // roomId because the room is created on the basis of creator's socket id
      score: { roomId: 0 }
    };

    safeAssign(newObjRef, newObj);

    gameState.set(roomId, newObjRef);
    return;
  }

  safeAssign(gameStateObj, newObj);

  console.log(gameState.get(roomId));

  return;
}

export const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Server responding!");
})

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
      
      // Start of player's turn in a round
      const randomSuggestions = getRandomSuggestions(3, suggestions);
      sendOnlyToSocketId(playerSocketId, "random-suggestions", { randomSuggestions: randomSuggestions });
      
      // This controls the timer on the frontend while selecting
      // any options for drawing
      for (let i = 15; i >= 0; --i) {
        io.in(roomName).emit('select-word-timer', { count: i });
        io.in(roomName).emit('drawing-page-timer', { count: i, message: "Waiting for player to choose a word" });
        await sleep(1000);
      }

      // Player turn to draw now
      for (let i = 60; i >= 0; --i) {
        io.in(roomName).except(playerSocketId).emit('drawing-page-timer', { count: i, message: "Player is drawing, guess what it is" });
        sendOnlyToSocketId(playerSocketId, 'drawing-page-timer', { count: i, message: "Your turn to draw" });
        await sleep(1000);
      }

      visitedPlayers.add(playerSocketId);
      // End of player's turn in a round
    } else {
      // This means that this round is now over
      break;
    }
  }

  console.log("Round Ended!!!");
  return;
}

const matchStringAndUpdateScore = (roomId: string, message: string, socketId: string) => {
  const gameStateObj =  gameState.get(roomId);

  if (!gameStateObj || !gameStateObj.word) {
    // Word hasn't been selected or game doesn't exist
    return;
  }

  if (message.toLowerCase() !== gameStateObj.word.toLowerCase()) {
    return;
  }

  // String has matched, we should update the score
  // and the message should have way to show that the word has matched
  const curr_score = gameStateObj.score[socketId]
  if (curr_score) {
    gameStateObj.score[socketId] = curr_score + 10;
  } else {
    gameStateObj.score[socketId] = 10;
  }

  io.in(roomId).emit("score-updation", gameStateObj.score);
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on("send-message", ({ roomId, msg }) => {
    const socketID = socket.id;
    matchStringAndUpdateScore(roomId, msg, socketID);
    io.to(roomId).emit("recieve-message", { senderID: socketID, msg: msg });
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

  socket.on("start", (roomId) => {
    console.log("roomId1", roomId);
    updateValuesInGameState({ isPlaying: true }, roomId);
    startGame(roomId);
  })

  socket.on("send_coordinates", ({ roomId, pos }) => {
    // Sends the message to all the clients
    // except the one it recieved it from
    io.to(roomId).emit("recieve_message", pos);
  })

  socket.on("mouse-down", ({ roomId }) => {
    // data here is just {}
    io.to(roomId).emit("mouse-down", {});
  })

  socket.on("mouse-up", ({ roomId }) => {
    // data here is just {}
    io.to(roomId).emit("mouse-up", {});
  })

  socket.on("word-selected-to-draw", ({ roomId, word } : { roomId: string, word: string }) => {
    console.log('word-selected-to-draw', word);
    updateValuesInGameState({ word: word }, roomId);
  })
});

server.listen(port, () => {
  console.log(`listening on Port: ${port}`);
});