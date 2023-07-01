import { Request, Response } from "express";
import { Types } from "mongoose";
import { Socket, Server } from "socket.io";
import ExpressError from "../utils/ExpressError.js";
import { Channel, User } from "../models/index.js";
import verifyJWT from "../utils/verifyJWT.js";
import dayjs from "dayjs";

export const getUserChannels = async (req: Request, res: Response) => {
  try {
    // if(!req.wid) throw new ExpressError("Workspace Id is required", 400)
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ExpressError("You need to sign in first.", 400);
    }
    const { userId } = await verifyJWT(token);
    const foundChannels = await Channel.find({
      workspaceId: req.wid,
      members: userId,
    }).populate("members", "username avatarURL");
    res.status(200).json(foundChannels);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get channels failed" });
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;

    const foundChannels = await Channel.findById(cid)
      .populate("messages.from", "username")
      .populate("members", "username avatarURL");
    if (!foundChannels) throw new ExpressError("Channel not found", 404);
    res.status(200).json(foundChannels);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get channels failed" });
  }
};

export const addTeamMessage = async (req: Request, res: Response) => {
  try {
    const { from, to, msg } = req.body;
    const { io } = res.locals;

    const connections = io.of("/chatroom");
    const { userId } = await verifyJWT(from);
    const foundUser = await User.findById(userId);
    const CURR_TIME = dayjs();

    // Save messages to DB
    const foundChannel = await Channel.findByIdAndUpdate(
      to,
      {
        $push: {
          messages: {
            $each: [{ from: userId, content: msg }],
            $sort: { createdAt: 1 },
          },
        },
      },
      { new: true }
    );
    if (!foundChannel) throw new ExpressError("Channel not found", 404);
    await foundChannel.save();

    const replyMessage = {
      from: userId,
      to,
      msg: { username: foundUser?.username, time: CURR_TIME, text: msg },
    };

    // connections.on("connection", (socket: Socket) => {
    //   console.log("aaa");
    // ! Bug to Fix: Time recorded in DB may be slightly different.

    foundChannel.members.forEach((member) => {
      connections.to(`userId:${member}`).emit("notification", replyMessage);
    });

    connections.to(`roomId:${to}`).emit("message", replyMessage);
    // });
    res.status(200).json(replyMessage);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get channels failed" });
  }
};

export const getWorkspaceByChannelId = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const foundChannels = await Channel.findById(cid);
    res.status(200).json(foundChannels);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get channels failed" });
  }
};

interface MessageTo {
  workspace: Types.ObjectId;
  type: "team" | "direct";
  id: Types.ObjectId;
}

const findOrAddChannel = async (userId: string, to: MessageTo) => {
  const { workspace, type, id } = to;

  // Save messages to DB
  if (type === "team") {
    const foundChannel = await Channel.findById(id);
    return foundChannel;
  } else if (type === "direct") {
    const foundChannel = await Channel.findOne({
      $and: [
        { category: "direct" },
        { workspaceId: workspace },
        { members: userId },
        { members: id },
      ],
    });
    if (!foundChannel) {
      // create new channel
      const newChannel = new Channel({
        workspaceId: workspace,
        title: "???",
        category: "direct",
        members: [userId, id],
        messages: [],
      });

      await newChannel.save();
      return newChannel;
    }
    return foundChannel;
  }
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { from, to, msg } = req.body;
    const { io } = res.locals;

    const connections = io.of("/chatroom");
    const { userId } = await verifyJWT(from);
    const foundUser = await User.findById(userId);
    const CURR_TIME = dayjs();

    const foundChannel = await findOrAddChannel(userId, to);
    if (!foundChannel) throw new ExpressError("Channel not found", 404);

    await foundChannel.updateOne({
      $push: {
        messages: {
          $each: [{ from: userId, content: msg }],
          $sort: { createdAt: 1 },
        },
      },
    });

    await foundChannel.save();

    const replyMessage = {
      to: foundChannel._id,
      msg: {
        username: foundUser?.username,
        time: CURR_TIME,
        text: msg,
      },
    };

    // ! Bug to Fix: Time recorded in DB may be slightly different.

    foundChannel.members.forEach((member) => {
      connections.to(`userId:${member}`).emit("notification", replyMessage);
    });

    connections.to(`roomId:${foundChannel._id}`).emit("message", replyMessage);

    res.status(200).json(replyMessage);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get channels failed" });
  }
};
