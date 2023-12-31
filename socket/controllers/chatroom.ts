import { Socket, Server } from "socket.io";
import { publisher, subscriber } from "../models/redis.js";

const EXPIRE_TIME = 60 * 60 * 60;

const chatRoom = function (io: Server) {
  const connections = io.of("/chatroom");

  connections.on("connection", (socket: Socket) => {
    console.log("Chatroom socket connected");

    socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
      console.log(`socket: ${socket.id} has joined roomId:${roomId}`);
      socket.join(`roomId:${roomId}`);
    });

    socket.on("online", async ({ userId }: { userId: string }) => {
      console.log(`socket: ${socket.id} has joined userId:${userId}`);
      await publisher.set(`online:${userId}`, 1, "EX", EXPIRE_TIME);
      await publisher.set(socket.id, userId, "EX", EXPIRE_TIME);
      socket.join(`userId:${userId}`);
      console.log("Add onlineState", userId);
      connections.emit("onlineState", { userId, state: "1" });
    });

    socket.on("offline", async ({ userId }: { userId: string }) => {
      console.log(`socket: ${socket.id} has left userId:${userId}`);
      await publisher.del(`online:${userId}`);
      console.log("Remove onlineState", userId);
      connections.emit("onlineState", { userId, state: "0" });
    });

    socket.on("disconnect", async () => {
      const userId = await publisher.get(socket.id);
      console.log(`socket: ${socket.id} has left userId:${userId}`);
      await publisher.del(`online:${userId}`);
      await publisher.del(socket.id);
      console.log("Remove onlineState", userId);
      connections.emit("onlineState", { userId, state: "0" });
    });

    socket.on("leaveRoom", ({ roomId }: { roomId: string }) => {
      console.log(`socket: ${socket.id} has left roomId:${roomId}`);
      socket.leave(`roomId:${roomId}`);
    });
  });

  subscriber.psubscribe("message.*", (err, count) => {
    if (err) console.error(err.message);
    console.log(`Subscribed to ${count} channels.`);
  });

  subscriber.on("pmessage", (pattern, channel, message) => {
    const messageJson = JSON.parse(message);
    const { event } = messageJson;

    if (event === "notification") {
      const { userId, channelId } = messageJson;
      connections.to(`userId:${userId}`).emit("notification", { to: channelId });
      return;
    }

    if (event === "message") {
      const { channelId, response } = messageJson;
      connections.to(`roomId:${channelId}`).emit("message", response);
      return;
    }

    if (event === "newMember") {
      connections.emit("newMember");
      return;
    }

    console.log(`Unknown event. Received ${message} from ${channel}`);
  });
};

export default chatRoom;
