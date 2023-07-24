import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import chatRoom from "./controllers/chatroom.js";
import videoChat from "./controllers/videoChat.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

chatRoom(io);
await videoChat(io);

server.listen(3002, () => {
  console.log("socket server listening on 3002");
});
