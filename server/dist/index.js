"use strict";
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
// We want some form of data
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("send-message", ({ roomID, msg }) => {
        const socketID = socket.id;
        io.to(roomID).emit("recieve-message", { senderID: socketID, msg: msg });
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
        const clients = io.sockets.adapter.rooms.get(uuid);
        if (clients)
            io.in(uuid).emit("players-event", [...clients]);
        else
            throw console.error("No Clients in the room:", uuid);
    });
    socket.on("start", (uuid) => {
        io.to(uuid).emit("start", {});
    });
    socket.on("send_coordinates", ({ roomID, pos }) => {
        // Sends the message to all the clients
        // except the one it recieved it from
        io.to(roomID).emit("recieve_message", pos);
    });
    socket.on("mouse-down", ({ roomID }) => {
        // data here is just {}
        io.to(roomID).emit("mouse-down", {});
    });
    socket.on("mouse-up", ({ roomID }) => {
        // data here is just {}
        io.to(roomID).emit("mouse-up", {});
    });
});
server.listen(port, () => {
    console.log(`listening on Port: ${port}`);
});
