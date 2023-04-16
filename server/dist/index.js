"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const port = process.env.PORT;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `*`,
        methods: ["GET", "POST"]
    }
});
app.get("/", (req, res) => {
    res.send("Server responding!");
});
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
// This function will be the starting point of the game and will control the game flow
// It will emit all the important stuff like what to do? Options to choose words
// Will tell to all the clients, whose turn it is, would enable and disable drawing
// for those clients respectively.
const startGame = (roomName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const visitedPlayers = new Set();
    // Limited to max 8 iterations so as not to create a lot of garbage memory
    for (let i = 0; i < 8; ++i) {
        const room = (_d = (_c = (_b = (_a = io === null || io === void 0 ? void 0 : io.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(roomName)) !== null && _d !== void 0 ? _d : "";
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
        if (playerSocketId !== "") {
            console.log("i: " + i);
            // Assign a player turn
            if (i === 0) {
                io.in(roomName).emit("start", {
                    playerTurn: playerSocketId,
                });
            }
            else {
                io.in(roomName).emit("change-player-turn", {
                    playerTurn: playerSocketId,
                });
            }
            visitedPlayers.add(playerSocketId);
            yield sleep(10000);
        }
        else {
            // This means that this round is now over
            break;
        }
    }
    console.log("Round Ended!!!");
    return;
});
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("send-message", ({ roomId, msg }) => {
        const socketID = socket.id;
        io.to(roomId).emit("recieve-message", { senderID: socketID, msg: msg });
    });
    socket.on("create-new-room", (data) => {
        // We are using the socket id for the admin/creator
        // of the room to create room, users will be able
        // to join the room if they have socket.id of that user
        socket.join(socket.id);
    });
    socket.on("join-room", (uuid) => {
        socket.join(uuid);
        // const clients = io.sockets.adapter.rooms.get(uuid);
        // const numClients = clients ? clients.size : 0;
        // We want to send the list of all the clients to the client
        // after it joins the room
        const players = io.sockets.adapter.rooms.get(uuid);
        if (players)
            io.in(uuid).emit("players-event", [...players]);
        else
            throw console.error("No Clients in the room:", uuid);
    });
    socket.on("start", (uuid) => {
        startGame(uuid);
    });
    socket.on("send_coordinates", ({ roomId, pos }) => {
        // Sends the message to all the clients
        // except the one it recieved it from
        io.to(roomId).emit("recieve_message", pos);
    });
    socket.on("mouse-down", ({ roomId }) => {
        // data here is just {}
        io.to(roomId).emit("mouse-down", {});
    });
    socket.on("mouse-up", ({ roomId }) => {
        // data here is just {}
        io.to(roomId).emit("mouse-up", {});
    });
});
server.listen(port, () => {
    console.log(`listening on Port: ${port}`);
});
