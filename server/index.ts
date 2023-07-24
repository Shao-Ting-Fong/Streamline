import http from "http";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import { Server } from "socket.io";
import express, { Request, Response } from "express";
import { errorHandler } from "./utils/errorHandler.js";

import videoRouter from "./routes/videoRoutes.js";
import authRouter from "./routes/authRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import videoChat from "./utils/videoChat.js";
import authenticate from "./middleware/authenticate.js";

const dbUrl =
  process.env.NODE_ENV === "production" ? process.env.DB_URL ?? "" : "mongodb://127.0.0.1:27017/slackalendar";

try {
  await mongoose.connect(dbUrl);
  console.log(dbUrl);
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

// videoChat(io);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use("/video", videoRouter);
app.use("/auth", authRouter);

app.use("/chat", authenticate, chatRouter);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.use(errorHandler);

httpServer.listen(3000, () => {
  console.log("listening on port: 3000");
});
