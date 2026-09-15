const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Players 2 Matchmaking Logic
    if (waitingPlayer) {
        const roomId = `room_${waitingPlayer.id}_${socket.id}`;
        socket.join(roomId);
        waitingPlayer.join(roomId);

        // Send role and roomId to players
        waitingPlayer.emit('gameStart', { color: 'red', roomId });
        socket.emit('gameStart', { color: 'white', roomId });

        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        socket.emit('waiting', 'Waiting for an opponent...');
    }

    // Pass moves between players
    socket.on('makeMove', (data) => {
        socket.to(data.roomId).emit('moveMade', data);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});