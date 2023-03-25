"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./utils/user");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const { Server } = require('socket.io');
app.use((0, cors_1.default)());
const port = process.env.PORT || 8000;
const server = http_1.default.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://bunnychat.vercel.app',
        methods: ['GET', 'POST'],
    },
});
app.get('/', (req, res) => {
    res.json({ message: 'Socket is running ⭐' });
});
app.get('/ping', (req, res) => {
    res.json({ message: 'Pong ' + port + ' ' + process.env.PORT });
});
io.on('connection', (socket) => {
    console.log('A User Connected');
    socket.on('disconnect', () => {
        console.log('*A User Disconnect*');
        const user = (0, user_1.removeUser)(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                user: '*',
                text: `${user.name} has left`,
            });
            io.to(user.room).emit('room', {
                room: user.room,
                users: (0, user_1.getUsersInRoom)(user.room),
            });
        }
    });
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = (0, user_1.addUser)({
            id: socket.id,
            name,
            room,
        });
        if (error)
            return callback(error);
        if (user) {
            socket.emit('message', {
                user: '*',
                text: `${user.name}, Welcome to room ${user.room}`,
            });
            socket.broadcast.to(user.room).emit('message', {
                user: '*',
                text: `${user.name} has joined`,
            });
            socket.join(user.room);
            io.to(user.room).emit('room', {
                room: user.room,
                users: (0, user_1.getUsersInRoom)(user.room),
            });
            callback();
        }
    });
    socket.on('sendMessage', (message, callback) => {
        const user = (0, user_1.getUser)(socket.id);
        io.to(user.room).emit('message', {
            user: user.name,
            text: message,
        });
        io.to(user.room).emit('room', {
            room: user.room,
            users: (0, user_1.getUsersInRoom)(user.room),
        });
        callback();
    });
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map