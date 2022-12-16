"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const http = require('http');
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http.createServer(app);
const port = process.env.PORT;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `http://localhost:3000`,
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("send_coordinates", (data) => {
        console.log(data);
        // Sends the message to all the clients
        // except the one it recieved it from
        socket.broadcast.emit("recieve_message", data);
    });
    socket.on("mouse-down", (data) => {
        // data here is just {}
        socket.broadcast.emit("mouse-down", data);
    });
    socket.on("mouse-up", (data) => {
        // data here is just {}
        socket.broadcast.emit("mouse-up", data);
    });
});
server.listen(port, () => {
    console.log(`listening on Port: ${port}`);
});
