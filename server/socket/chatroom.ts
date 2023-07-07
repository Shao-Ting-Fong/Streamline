import { Socket, Server } from "socket.io";
import formatMessage from "../utils/messages.js";
import verifyJWT from "../utils/verifyJWT.js";
import { User } from "../models/index.js";

const chatroom = function () {
  // @ts-ignore
  const _self = this as { init: Function };

  _self.init = async function (io: Server) {
    const connections = io.of("/chatroom");

    connections.on("connection", (socket: Socket) => {
      console.log("Chatroom socket connected");

      socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has joined ${roomId}`);
        socket.join(roomId);
      });

      socket.on("leaveRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has left ${roomId}`);
        socket.leave(roomId);
      });

      // socket.on("chatMessage", async ({ from, room, msg }: { from: string; room: string; msg: string }) => {
      //   console.log(from, room, msg);
      //   const { userId } = await verifyJWT(from);
      //   const foundUser = await User.findById(userId);
      //   if (!foundUser) throw new Error("User not found");

      //   await connections.emit("message", formatMessage(foundUser.username, msg));
      // });
    });
  };
};

// @ts-ignore
export default new chatroom();
