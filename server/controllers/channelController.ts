import { Request, Response } from "express";
import ExpressError from "../utils/ExpressError.js";
import { Channel } from "../models/index.js";
import verifyJWT from "../utils/verifyJWT.js";
import { sendingMessages } from "../models/messages.js";
import { RequestWithWid } from "../routes/chat/chatRoutes.js";

export const getUserChannels = async (req: RequestWithWid, res: Response) => {
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
    })
      .populate("members", "username avatarURL")
      .populate("workspaceId", "title");
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
      .populate("messages.from", "username avatarURL")
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

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { from, message } = req.body;
    const to = JSON.parse(req.body.to);
    // @ts-ignore
    const location = req.file?.location;
    const { io } = res.locals;

    const channelId = await sendingMessages(io, from, to, message, location);

    res.status(200).json({ to: channelId });
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

export const createNewChannel = async (req: RequestWithWid, res: Response) => {
  try {
    const { channelName, ...member } = req.body;
    if (!member) {
      throw new ExpressError("At least one member is required!", 400);
    }
    const newChannel = new Channel({
      workspaceId: req.wid,
      title: channelName,
      category: "team",
      members: Object.keys(member),
      messages: [],
    });
    await newChannel.save();
    res.status(200).json(newChannel);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Create new channel failed" });
  }
};
