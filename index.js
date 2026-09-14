const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let onlinePlayers = 0;

io.on('connection', (socket) => {
    onlinePlayers++;
    console.log(`User connected: ${socket.id} | Total online: ${onlinePlayers}`);
    
    // සියලුම ප්ලේයර්ස්ලාට අලුත් ඔන්ලයින් ගණන යැවීම
    io.emit('online-players', onlinePlayers);

    // ප්ලේයර් කෙනෙක් මූව් එකක් කළහොත් ඒක අනිත් කෙනාට යැවීම
    socket.on('player-move', (moveData) => {
        socket.broadcast.emit('opponent-move', moveData);
    });

    socket.on('disconnect', () => {
        onlinePlayers--;
        console.log(`User disconnected: ${socket.id} | Total online: ${onlinePlayers}`);
        io.emit('online-players', onlinePlayers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`CheckerX Backend Server is running on port ${PORT}`);
});