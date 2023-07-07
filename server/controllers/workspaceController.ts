import { Request, Response } from "express";
import ExpressError from "../utils/ExpressError.js";
import { User, Channel, Workspace } from "../models/index.js";
// import User from "../models/user.js";
import verifyJWT from "../utils/verifyJWT.js";
import { Types } from "mongoose";

export const getWorkspacesByUserId = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ExpressError("You need to sign in first.", 400);
    }
    const { userId } = await verifyJWT(token);
    const foundUser = await User.findById(userId).populate({
      path: "workspaces",
      model: "Workspace",
    });
    res.status(200).json(foundUser?.workspaces);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get workspace failed" });
  }
};

export const getWorkspaceMembers = async (req: Request, res: Response) => {
  try {
    const { wid } = req.params;

    const foundUsers = await User.find({ workspaces: wid }).select("_id username avatarURL");
    res.status(200).json(foundUsers);
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get workspace members failed" });
  }
};

export const joinWorkspaceByUrl = async (req: Request, res: Response) => {
  try {
    const { wid } = req.params as { wid: unknown } as { wid: Types.ObjectId };
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ExpressError("You need to sign in first.", 400);
    }
    const { userId } = await verifyJWT(token);
    const foundUser = await User.findById(userId);
    if (!foundUser) throw new ExpressError("User not found", 404);

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

    res.status(200).json({ workspaceId: wid });
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Get workspace failed" });
  }
};

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ExpressError("You need to sign in first.", 400);
    }
    const { userId } = await verifyJWT(token);
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
  } catch (err) {
    if (err instanceof ExpressError) {
      res.status(err.statusCode).json({ errors: err.message });
      return;
    } else if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Create workspace failed" });
  }
};
