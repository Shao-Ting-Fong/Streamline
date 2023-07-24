import { Request, Response } from "express";
import { publisher } from "../models/redis.js";
import { ExpressError } from "../utils/errorHandler.js";
import { Channel } from "../models/index.js";
import { sendingMessages } from "../models/messages.js";

const MSG_LIMIT = 15;

export const getUserChannels = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { wid } = req.params;

  const foundChannels = await Channel.find({
    workspaceId: wid,
    members: userId,
  })
    .populate("members", "username avatarURL")
    .populate("workspaceId", "title");
  res.status(200).json(foundChannels);
};

export const getChannelInfoById = async (req: Request, res: Response) => {
  const { cid } = req.params;

  const foundChannels = await Channel.findById(cid).select("_id workspaceId title category");
  if (!foundChannels) throw new ExpressError("Channel not found", 404);
  res.status(200).json(foundChannels);
};

export const getChannelMembersById = async (req: Request, res: Response) => {
  const { cid } = req.params;

  const foundChannels = await Channel.findById(cid)
    .select("_id members")
    .populate("members", "username avatarURL")
    .exec();

  if (!foundChannels) throw new ExpressError("Channel not found", 404);
  const membersState = await Promise.all(
    foundChannels.members.map(async (member) => {
      // @ts-ignore
      const { _id, username, avatarURL } = member;
      const onlineState = (await publisher.get(`online:${member._id}`)) ?? "0";
      return { _id, username, avatarURL, online: onlineState };
    })
  );
  res.status(200).json(membersState);
};

export const getChannelMessagesById = async (req: Request, res: Response) => {
  const { cid } = req.params;
  const paging = Number(req.query.paging) || 0;

  const foundChannels = await Channel.findById(cid)
    .select({ _id: 1, messages: { $slice: [paging * MSG_LIMIT, MSG_LIMIT + 1] } })
    .populate("messages.from", "username avatarURL");
  if (!foundChannels) throw new ExpressError("Channel not found", 404);
  res.status(200).json({
    _id: foundChannels._id,
    ...(foundChannels.messages.length > MSG_LIMIT
      ? { messages: foundChannels.messages.slice(0, -1), nextPaging: paging + 1 }
      : { messages: foundChannels.messages }),
  });
};

export const getWorkspaceByChannelId = async (req: Request, res: Response) => {
  const { cid } = req.params;
  const foundChannels = await Channel.findById(cid);
  res.status(200).json(foundChannels);
};

export const addMessage = async (req: Request, res: Response) => {
  const { from, message } = req.body;
  const to = JSON.parse(req.body.to);
  // @ts-ignore
  const location = req.file?.location;

  if (!message && !location) throw new ExpressError("Invalid message.", 400);

  const channelId = await sendingMessages({ from, to, message, location });

  res.status(200).json({ to: channelId });
};

export const createNewChannel = async (req: Request, res: Response) => {
  const { channelName, isPrivate, ...member } = req.body;
  const { wid } = req.params;

  if (!member) {
    throw new ExpressError("At least one member is required!", 400);
  }
  const newChannel = new Channel({
    workspaceId: wid,
    title: channelName,
    category: isPrivate === "true" ? "private" : "public",
    members: Object.keys(member),
    messages: [],
  });
  await newChannel.save();
  res.status(200).json(newChannel);
};
