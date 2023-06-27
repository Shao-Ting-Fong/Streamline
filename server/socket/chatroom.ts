import { Socket, Server } from "socket.io";
import formatMessage from "../utils/messages.js";
import verifyJWT from "../utils/verifyJWT.js";
// import User from "../models/user.js";
import { User } from "../models/index.js";

const chatroom = function () {
  const _self = this;

  _self.init = async function (connections: Server) {
    connections.on("connection", (socket: Socket) => {
      console.log("Chatroom socket connected");

      socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has joined room:${roomId}`);
        socket.join(`roomId:${roomId}`);
      });

      socket.on("leaveRoom", ({ roomId }: { roomId: string }) => {
        console.log(`socket: ${socket.id} has left room:${roomId}`);
        socket.leave(`roomId:${roomId}`);
      });

      socket.on(
        "chatMessage",
        async ({
          from,
          room,
          msg,
        }: {
          from: string;
          room: string;
          msg: string;
        }) => {
          console.log(from, room, msg);
          const { userId } = await verifyJWT(from);
          const foundUser = await User.findById(userId);
          if (!foundUser) throw new Error("User not found");

          await connections.emit(
            "message",
            formatMessage(foundUser.username, msg)
          );
        }
      );

      // socket.on("disconnect", () => {
      //   const user = userLeave(socket.id);

      //   if (user) {
      //     // Inform all users, including the disconnected one
      //     connections
      //       .to(user.room)
      //       .emit(
      //         "message",
      //         formatMessage(botName, `${user.username} has left the chat!`)
      //       );
      //     connections.to(user.room).emit("roomInfo", {
      //       room: user.room,
      //       users: getRoomUsers(user.room),
      //     });
      //   }
      // });
    });
  };
};

export default new chatroom();
