import http from "http";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import { Server } from "socket.io";
import express, { Request, Response, NextFunction } from "express";

import videoRouter from "./routes/videoRoutes.js";
import authRouter from "./routes/authRoutes.js";
import chatRouter from "./routes/chat/chatRoutes.js";
import videoChat from "./socket/videoChat.js";
import chatroom from "./socket/chatroom.js";

const dbUrl =
  process.env.NODE_ENV === "production" ? process.env.DB_URL ?? "" : "mongodb://127.0.0.1:27017/slackalendar";

try {
  await mongoose.connect(dbUrl);
  console.log("CONNECTION OPEN!!!");
} catch (error) {
  console.log("OH NO ERROR!!!!");
  console.log(error);
}

const app = express();
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.resolve();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
// const videoConnection = io.of("/mediasoup");
// const chatConnection = io.of("/chatroom");

videoChat.init(io);
chatroom.init(io);

app.set("view engine", "ejs");
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.io = io;
  next();
});

app.use("/video", videoRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

httpServer.listen(3000, () => {
  console.log("listening on port: 3000");
});
