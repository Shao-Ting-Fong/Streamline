import { Socket, Server } from "socket.io";
import { redis } from "../models/redis.js";

const chatroom = function () {
  // @ts-ignore
  const _self = this as { init: Function };

  _self.init = async function (io: Server) {
    const connections = io.of("/chatroom");

    connections.on("connection", (socket: Socket) => {
      console.log("Chatroom socket connected");

      socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has joined roomId:${roomId}`);
        socket.join(`roomId:${roomId}`);
      });

      socket.on("online", async ({ userId }: { userId: string }) => {
        console.log(`socket: ${socket.id} has joined userId:${userId}`);
        await redis.set(`online:${userId}`, 1, "EX", 3600);
        socket.join(`userId:${userId}`);
        console.log("Add onlineState", userId);
        connections.emit("onlineState", { userId, state: "1" });
      });

      socket.on("offline", async ({ userId }: { userId: string }) => {
        console.log(`socket: ${socket.id} has left userId:${userId}`);
        await redis.del(`online:${userId}`);
        console.log("Remove onlineState", userId);
        connections.emit("onlineState", { userId, state: "0" });
      });

      socket.on("leaveRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has left roomId:${roomId}`);
        socket.leave(`roomId:${roomId}`);
      });
    });
  };
};

// @ts-ignore
export default new chatroom();
