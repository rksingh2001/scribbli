import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { convertToUnderscores, getPlayersList, getRandomValues, sendOnlyToPlayer, sleep } from './utilities';
import { colors, names, ROUND_TIME_SECONDS, suggestions } from './constants';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app: Express = express();
app.use(cors());
const server = http.createServer(app);
const port = process.env.PORT;

type ScoreObjectType = {
  [key: string]: number
}

type hasGuessedTheWord = {
  [key: string]: boolean
}

type GameStateObjectType = {
  isPlaying: boolean // Tells whether the game has begun or not
  score: ScoreObjectType // Stores the score of each player in a key value pair
  word?: string // Stores the word the player has selected
  hasGuessedTheWord: hasGuessedTheWord // Stores a boolean for each player and tells if the players has guessed the word or not.
  stopTimer: boolean // stopTimer tells whether to stop the current running timer or not
  numOfRounds: number // Number of rounds chosen for the game
  playerTurn: string | undefined // Player who is playing at the current moment
  drawing: Array<Array<any>> // This will save all the events which are related to drawing on the canvas
}

type GameStateType = Map<string, GameStateObjectType>;

type PlayerStateType = {
  playerId: string | undefined
  roomId: string | undefined
  name: string | undefined
  colors: string[] | undefined
}

type PlayerStateMapType = Map<string, PlayerStateType>;

type RoomStateType = {
  playersId: string[]
}

export const playerStateMap: PlayerStateMapType = new Map();

// Different than the game state in the sense, a single room can
// have multiple games played
export const roomStateMap: Map<string, RoomStateType> = new Map();

// Maps playerId -> socketId
export const currentActiveSocketId: Map<string, string> = new Map();

// roomId -> GameStateObject
const gameState: GameStateType = new Map();
const safeAssign: <T>(target: T, ...sources: Partial<T>[]) => T = Object.assign

const initializeGameState = (playerId: string, roomId: string) => {
  const gameStateObj = gameState.get(roomId);

  const playersList = getPlayersList(roomId);
  const scoreObj: ScoreObjectType = {};
  playersList.forEach(({ playerId }) => {
    scoreObj[playerId] = 0;
  })

  if (!gameStateObj) {
    const newgameStateObj: GameStateObjectType = {
      isPlaying: false,
      score: scoreObj,
      hasGuessedTheWord: { [playerId]: false },
      stopTimer: false,
      numOfRounds: 3,
      playerTurn: undefined,
      drawing: []
    };

    gameState.set(roomId, newgameStateObj);
    return;
  } else {
    console.error("Game State Object already exists!");
    return;
  }
}

// Updates the key, or add the key if not already there
const updateValuesInGameState = (newObj: Partial<GameStateObjectType>, roomId: string) => {
  const gameStateObj = gameState.get(roomId);

  if (!gameStateObj) {
    console.error("Game State Object doesn't exist!");
    return;
  }

  safeAssign(gameStateObj, newObj);

  return;
}

// Handled the gamestate when the player's turn is changed
const handlePlayerTurnEnd = (roomId: string) => {
  const gameStateObj = gameState.get(roomId);

  if (!gameStateObj) {
    console.error("Game State Object doesn't exist");
    return;
  }

  // Set all the values to false in gameStateObj.hasGuessed
  Object.keys(gameStateObj.hasGuessedTheWord).map(key => {
    gameStateObj.hasGuessedTheWord[key] = false;
  })

  gameStateObj.word = undefined;
  gameStateObj.drawing = [];

  // Clear the canvas
  io.in(roomId).emit('clear-canvas', {});
}

export const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"]
  },
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
  const gameStateObj = gameState.get(roomName);

  if (!gameStateObj) {
    console.error("GAME STATE NOT INITIALIZED YET!!");
    return;
  }

  for (let currentRound = 1; currentRound <= gameStateObj.numOfRounds; ++currentRound) {
    console.log("ROUND BEGAN", currentRound);
    // Limited to max 8 iterations so as not to create a lot of garbage memory
    for (let i = 0; i < 8; ++i) {
      // const room = io?.sockets?.adapter?.rooms?.get(roomName) ?? "";
      const room = roomStateMap.get(roomName)?.playersId;
      if (!room) {
        console.error("Room doesn't exist");
        return;
      }

      let playerId = "";

      for (const playerIdString of room) {
        if (!visitedPlayers.has(playerIdString)) {
          playerId = playerIdString;
          break;
        }
      }

      const socketId = currentActiveSocketId.get(playerId);
      if (!socketId) return;

      if (playerId !== "") {
        // Assign a player turn
        if (i === 0 && currentRound === 1) {
          updateValuesInGameState({ playerTurn: playerId }, roomName);
          io.in(roomName).emit("start", {
            playerTurn: playerId,
            currentRound: currentRound
          });
        } else {
          updateValuesInGameState({ playerTurn: playerId }, roomName);
          io.in(roomName).emit("change-player-turn", {
            playerTurn: playerId,
            currentRound: currentRound
          })
        }

        // Start of player's turn in a round
        const randomSuggestions = getRandomValues(3, suggestions);
        updateValuesInGameState({ word: randomSuggestions[0] }, roomName); // Sets a default word in case no word is selected
        sendOnlyToPlayer(playerId, "random-suggestions", { randomSuggestions: randomSuggestions });

        // This controls the timer on the frontend while selecting
        // any options for drawing
        for (let i = 15; i >= 0; --i) {
          if (gameStateObj.stopTimer) {
            updateValuesInGameState({ stopTimer: false }, roomName);
            io.in(roomName).emit('select-word-timer', { count: 0 });
            io.in(roomName).emit('drawing-page-timer', { count: 0, message: "Waiting for player to choose a word" });
            break;
          }

          io.in(roomName).emit('select-word-timer', { count: i });
          io.in(roomName).emit('drawing-page-timer', { count: i, message: "Waiting for player to choose a word" });
          await sleep(1000);
        }

        // Player turn to draw now
        for (let i = ROUND_TIME_SECONDS; i >= 0; --i) {
          if (gameStateObj.stopTimer) {
            updateValuesInGameState({ stopTimer: false }, roomName);
            console.log(socketId);
            io.in(roomName).except(socketId).emit('drawing-page-timer', { count: 0, message: "Player is drawing, guess what it is " + convertToUnderscores(gameStateObj.word) });
            sendOnlyToPlayer(playerId, 'drawing-page-timer', { count: 0, message: "Your turn to draw " + gameStateObj.word });
            break;
          }

          io.in(roomName).except(socketId).emit('drawing-page-timer', { count: i, message: "Player is drawing, guess what it is " + convertToUnderscores(gameStateObj.word) });
          sendOnlyToPlayer(playerId, 'drawing-page-timer', { count: i, message: "Your turn to draw " + gameStateObj.word });
          await sleep(1000);
        }

        visitedPlayers.add(playerId);

        // End of player's turn in a round
        handlePlayerTurnEnd(roomName);
      } else {
        // This means that this round is now over
        break;
      }
    }

    visitedPlayers.clear();
  }

  io.in(roomName).emit("game-end", { score: gameStateObj.score });
  return;
}

const matchStringAndUpdateScore = (roomId: string, message: string, socketId: string) => {
  const gameStateObj = gameState.get(roomId);

  if (!gameStateObj || !gameStateObj.word || !gameStateObj.playerTurn) {
    // Word hasn't been selected or game doesn't exist
    return;
  }

  if (message.toLowerCase() !== gameStateObj.word.toLowerCase() || gameStateObj.hasGuessedTheWord[socketId]) {
    return;
  }

  // Note: We haven't added the current player who have guessed into the hasGuessedTheWord Object
  let numOfPlayersWhoGuessed = 0;
  Object.values(gameStateObj.hasGuessedTheWord).forEach(hasGuessed => { if (hasGuessed) numOfPlayersWhoGuessed++ });

  // String has matched, we should update the score
  // and the message should have way to show that the word has matched
  let scoreToAddToGuesser = 50;
  let scoreToAddToDrawer = 0;
  if (numOfPlayersWhoGuessed === 0) {
    scoreToAddToGuesser = 150;
    scoreToAddToDrawer = 100;
  } else if (numOfPlayersWhoGuessed === 1) {
    scoreToAddToGuesser = 125;
    scoreToAddToDrawer = 25;
  } else if (numOfPlayersWhoGuessed === 2) {
    scoreToAddToGuesser = 100;
    scoreToAddToDrawer = 25;
  } else if (numOfPlayersWhoGuessed === 3) {
    scoreToAddToGuesser = 75;
    scoreToAddToDrawer = 25;
  } else if (numOfPlayersWhoGuessed === 4) {
    scoreToAddToDrawer = 25;
  }

  const currScore = gameStateObj.score[socketId];
  if (currScore) {
    gameStateObj.score[socketId] = currScore + scoreToAddToGuesser;
  } else {
    gameStateObj.score[socketId] = scoreToAddToGuesser;
  }

  const playerDrawingId = gameStateObj.playerTurn;
  const drawerScore = gameStateObj.score[playerDrawingId]
  if (drawerScore) {
    gameStateObj.score[playerDrawingId] = drawerScore + scoreToAddToDrawer;
  } else {
    gameStateObj.score[playerDrawingId] = drawerScore + scoreToAddToDrawer;
  }

  gameStateObj.hasGuessedTheWord[socketId] = true;

  // Stops the loop currently running in case all the guesses were made correctly
  // let count = 0;
  // Object.values(gameStateObj.hasGuessedTheWord).map(hasGuessed => {
  //   if (hasGuessed) count ++;
  // })
  if (numOfPlayersWhoGuessed >= getPlayersList(roomId).length - 2) {
    gameStateObj.stopTimer = true;
  }

  console.log("gameStateObj", gameStateObj.score);
  io.in(roomId).emit("score-updation", gameStateObj.score);
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  
  // Create Player State Object
  let playerStateObj: PlayerStateType = {
    playerId: undefined,
    roomId: undefined,
    name: undefined,
    colors: getRandomValues(1, colors)[0]
  }

  socket.on("player-id", ({ playerId }) => {
    playerStateObj.playerId = playerId;    

    const isPlayerObj = playerStateMap.get(playerId);
    if (!isPlayerObj) {
      playerStateMap.set(playerId, playerStateObj);
    } else {
      playerStateObj = isPlayerObj;
    }
    
    if (!playerStateObj.playerId) return;
    currentActiveSocketId.set(playerStateObj.playerId, socket.id);
  })

  socket.on("send-message", ({ roomId, msg }) => {
    // const socketID = socket.id;
    if (!playerStateObj.playerId) return;
    matchStringAndUpdateScore(roomId, msg, playerStateObj.playerId);

    if (msg.toLowerCase() === gameState.get(roomId)?.word?.toLowerCase()) {
      const message = playerStateObj.name + " has guessed the correct word ✅";
      io.to(roomId).emit("recieve-message", { senderID: playerStateObj.playerId, msg: message });
    } else {
      msg = playerStateObj.name + ": " + msg;
      io.to(roomId).emit("recieve-message", { senderID: playerStateObj.playerId, msg: msg });
    }
  })

  socket.on("create-new-room", () => {
    // We are using the socket id for the admin/creator
    // of the room to create room, users will be able
    // to join the room if they have socket.id of that user
    const roomId = uuidv4();
    if (!playerStateObj.playerId) return;
    const playersId: string[] = [playerStateObj.playerId];
    roomStateMap.set(roomId, { playersId });
    socket.join(roomId);
    socket.emit("room-id", { roomId: roomId });
    playerStateObj.roomId = roomId;
    if (!playerStateObj.name) {
      playerStateObj.name = getRandomValues(1, names)[0];
    }

    // Todo: Add a listener for players-event which is common for
    // the app and isn't binded to any component, so that we
    // can update the number of players any time, and do not need
    // to use such hacks
    setTimeout(() => {
      const players = getPlayersList(roomId);
      io.in(roomId).emit("players-event", players);
    }, 200);
  })

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    const roomStateObj = roomStateMap.get(roomId);
    if (!roomStateObj || !playerStateObj.playerId) return;
    roomStateObj.playersId.push(playerStateObj.playerId);
    playerStateObj.roomId = roomId;

    if (!playerStateObj.name) {
      playerStateObj.name = getRandomValues(1, names)[0];
    }

    const players = getPlayersList(roomId);
    io.in(roomId).emit("players-event", players);
  })

  socket.on("save-name", ({ playerName }) => {
    if (playerName)
      playerStateObj.name = playerName;
  })

  socket.on("start", ({ roomId, numOfRounds }) => {
    if (!playerStateObj.playerId) return;
    initializeGameState(playerStateObj.playerId, roomId);
    updateValuesInGameState({ isPlaying: true, numOfRounds: numOfRounds }, roomId);
    startGame(roomId);
  })

  socket.on("send_coordinates", ({ roomId, pos, color, lineWidth }) => {
    // Sends the message to all the clients
    // except the one it recieved it from
    const gameStateObj = gameState.get(roomId);
    gameStateObj?.drawing.push(["recieve_message", { pos, color, lineWidth }]);
    socket.to(roomId).emit("recieve_message", { pos, color, lineWidth });
  })

  socket.on("mouse-down", ({ roomId }) => {
    // data here is just {}
    const gameStateObj = gameState.get(roomId);
    gameStateObj?.drawing.push(["mouse-down", {}]);
    socket.to(roomId).emit("mouse-down", {});
  })

  socket.on("mouse-up", ({ roomId }) => {
    const gameStateObj = gameState.get(roomId);
    gameStateObj?.drawing.push(["mouse-up", {}]);
    socket.to(roomId).emit("mouse-up", {});
  })

  socket.on("color-fill", ({ posX, posY, colorToFill, roomId }) => {
    const gameStateObj = gameState.get(roomId);
    gameStateObj?.drawing.push(["color-fill", { posX, posY, colorToFill }]);
    socket.to(roomId).emit("color-fill", { posX, posY, colorToFill });
  })

  socket.on("word-selected-to-draw", ({ roomId, word }: { roomId: string, word: string }) => {
    console.log('word-selected-to-draw', word);
    updateValuesInGameState({ word: word, stopTimer: true }, roomId);
  })

  socket.on("request-drawing", ({ roomId }) => {
    // TODO: Don't allow another request-drawing for same socket id
    // in case one is already running
    // Also make sure to send a clear canvas event in the beginning in
    // it doesn't run
    const gameStateObj = gameState.get(roomId);
    gameStateObj?.drawing.forEach(list => {
      if (!playerStateObj.playerId) return;
      sendOnlyToPlayer(playerStateObj.playerId, list[0], list[1]);
    })
  })

  socket.on("disconnect", () => {
    const roomId = playerStateObj.roomId;
    if (roomId) {
      const gameStateObj = gameState.get(roomId);
      if (gameStateObj) {
        if (playerStateObj.playerId === gameStateObj.playerTurn) {
          gameStateObj.stopTimer = true;
        }
        if (!playerStateObj.playerId) return;
        delete gameStateObj.score[playerStateObj.playerId];
        delete gameStateObj.hasGuessedTheWord[playerStateObj.playerId];
        io.in(roomId).emit("score-updation", gameStateObj.score);
      }

      const roomStateObj = roomStateMap.get(roomId);
      if (!roomStateObj) return;
      roomStateObj.playersId = roomStateObj.playersId.filter(playerId => playerId !== playerStateObj.playerId);
      if (roomStateObj.playersId.length === 0) {
        gameState.delete(roomId);
        roomStateMap.delete(roomId);
      }

      const players = getPlayersList(roomId);
      io.in(roomId).emit("players-event", players);
    }
    if (!playerStateObj.playerId) return;
    playerStateMap.delete(playerStateObj.playerId);
  })
});

server.listen(port, () => {
  console.log(`listening on Port: ${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('unCaughtException', err);
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
})

app.get("/ping", (req, res) => {
  res.send("pong");
})