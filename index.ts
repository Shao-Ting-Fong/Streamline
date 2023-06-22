import http from "http";
import path from "path";
import "dotenv/config";
import { Server } from "socket.io";
import express, { Request, Response, NextFunction } from "express";

import videoRouter from "./routes/videoRoutes.js";
import videoChat from "./socket/videoChat.js";

const app = express();
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.resolve();

const httpServer = http.createServer(app);
const io = new Server(httpServer);
const connections = io.of("/mediasoup");

videoChat.init(connections);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.io = io;
  next();
});

app.use("/video", videoRouter);

httpServer.listen(3000, () => {
  console.log("listening on port: 3000");
});
