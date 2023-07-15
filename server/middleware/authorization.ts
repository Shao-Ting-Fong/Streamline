import { Request, Response, NextFunction } from "express";
import { ExpressError } from "../utils/errorHandler.js";
import { User, Channel } from "../models/index.js";
import { Types } from "mongoose";

async function authorization(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = res.locals;
    const { wid, cid } = req.params ?? "";

    if (wid) {
      const userWorkspaces = await User.findById(userId).select("workspaces");
      if (!userWorkspaces?.workspaces?.includes(wid as unknown as Types.ObjectId))
        throw new ExpressError("Permission denied.", 403);
    }

    if (cid) {
      const channelMembers = await Channel.findById(cid).select("members");
      if (!channelMembers?.members?.includes(userId)) throw new ExpressError("Permission denied.", 403);
    }

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export default authorization;
