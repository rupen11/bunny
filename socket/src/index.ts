import {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser,
    UserPayloadData,
} from "./utils/user";
import cors from "cors";
import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const { Server } = require("socket.io");
app.use(cors());

const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

type User = {
    error?: string;
    user?: UserPayloadData;
};

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Socket is running ⭐" });
});

app.get("/ping", (req: Request, res: Response) => {
    res.json({ message: "Pong " + port + " " + process.env.PORT });
});

io.on("connection", (socket: any) => {
    console.log("A User Connected");

    socket.on("disconnect", () => {
        console.log("*A User Disconnect*");

        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", {
                user: "*",
                text: `${user.name} has left`,
            });

            io.to(user.room).emit("room", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });

    socket.on("join", ({ name, room }: any, callback: any) => {
        const { error, user }: User = addUser({
            id: socket.id,
            name,
            room,
        });

        if (error) return callback(error);

        if (user) {
            socket.emit("message", {
                user: "*",
                text: `${user.name}, Welcome to room ${user.room}`,
            });

            socket.broadcast.to(user.room).emit("message", {
                user: "*",
                text: `${user.name} has joined`,
            });

            socket.join(user.room);

            io.to(user.room).emit("room", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });

            callback();
        }
    });

    socket.on("sendMessage", (message: string, callback: any) => {
        const user: UserPayloadData = getUser(socket.id);

        io.to(user.room).emit("message", {
            user: user.name,
            text: message,
        });

        io.to(user.room).emit("room", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
