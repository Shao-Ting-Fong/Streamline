import { Request, Response } from "express";
import ExpressError from "../utils/ExpressError.js";
import { User } from "../models/index.js";
// import User from "../models/user.js";
import verifyJWT from "../utils/verifyJWT.js";

export const getWorkspacesById = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ExpressError("You need to sign in first.", 400);
    }
    const { userId } = await verifyJWT(token);
    const foundUser = await User.findById(userId).populate("workspaces");
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

// export const getWorkspaceByChannelId = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const foundChannels = await Channel.findById();
//     res.status(200).json(foundChannels);
//   } catch (err) {
//     if (err instanceof ExpressError) {
//       res.status(err.statusCode).json({ errors: err.message });
//       return;
//     } else if (err instanceof Error) {
//       console.log(err);
//       res.status(400).json({ errors: err.message });
//       return;
//     }
//     res.status(500).json({ errors: "Get channels failed" });
//   }
// };
