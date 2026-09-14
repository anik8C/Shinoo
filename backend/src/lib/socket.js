import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { socketAuthMiddleware } from '../middlewares/socketAuthMiddleware.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

export function getReceiverSocketIds(receiverId) {
    return userSocketMap.get(receiverId);
}

// this is for storing online users
const userSocketMap = new Map();   // {userId:socketId}

io.on("connection", (socket) => {

    //  console.log("CONNECTED:", socket.id);

    // socket.on("disconnect", (reason) => {
    //     console.log(
    //         "DISCONNECTED:",
    //         socket.id,
    //         reason
    //     );
    // });

    console.log(`A user connected: ${socket.user.fullName} (ID: ${socket.userId})`);

    const sockets = userSocketMap.get(socket.userId) ?? new Set();

    sockets.add(socket.id);
    userSocketMap.set(socket.userId, sockets);


    // io.emit() is used to send a message to all connected clients.
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        console.log("A user disconnected: ", socket.user.fullName);
        const sockets = userSocketMap.get(socket.userId);
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                userSocketMap.delete(socket.userId);
            }
        }

        io.emit(
            "getOnlineUsers",
            Array.from(userSocketMap.keys())
        );
    });
});

export { io, app, server };