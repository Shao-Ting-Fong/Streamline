import { Request, Response } from "express";
import { ExpressError } from "../utils/errorHandler.js";
import { User, Channel, Workspace } from "../models/index.js";
import { Types } from "mongoose";
import { publisher } from "../models/redis.js";

export const getWorkspacesByUserId = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const foundUser = await User.findById(userId).populate({
    path: "workspaces",
    model: "Workspace",
  });
  res.status(200).json(foundUser?.workspaces);
};

export const getWorkspaceMembers = async (req: Request, res: Response) => {
  const { wid } = req.params;

  const foundUsers = await User.find({ workspaces: wid }).select("_id username avatarURL");
  res.status(200).json(foundUsers);
};

export const joinWorkspaceByUrl = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { wid } = req.params as { wid: unknown } as { wid: Types.ObjectId };
  const foundUser = await User.findById(userId);
  const foundWorkspace = await Workspace.findById(wid);
  if (!foundUser) throw new ExpressError("User not found", 404);
  if (!foundWorkspace) throw new ExpressError("Workspace does not exist.", 404);
  if (foundUser.workspaces?.includes(wid)) {
    throw new ExpressError("User has already joined the workspace.", 400);
  }

  await foundUser?.updateOne(
    {
      $push: { workspaces: wid },
    },
    { runValidators: true }
  );

  await foundUser.save();

  await Channel.updateMany(
    { workspaceId: wid, category: "public" },
    {
      $push: { members: foundUser._id },
    },
    { runValidators: true }
  );

  publisher.publish("message.newMember", JSON.stringify({ event: "newMember" }));

  res.status(200).json({ workspaceId: wid });
};

export const createWorkspace = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { workspaceName } = req.body;
  // @ts-ignore
  const avatarURL = req.file?.key;

  const newWorkspace = new Workspace({
    title: workspaceName,
    ownerId: userId,
    avatarURL,
  });

  await newWorkspace.save();

  await User.findByIdAndUpdate(
    userId,
    {
      $push: { workspaces: newWorkspace._id },
    },
    { runValidators: true }
  );

  const defaultChannels = [
    {
      workspaceId: newWorkspace._id,
      title: "Announcement",
      members: [userId],
      category: "public",
      messages: [],
    },
    {
      workspaceId: newWorkspace._id,
      title: "Public",
      members: [userId],
      category: "public",
      messages: [],
    },
  ];

  await Channel.insertMany(defaultChannels);

  res.status(200).json({ workspaceId: newWorkspace._id });
};
