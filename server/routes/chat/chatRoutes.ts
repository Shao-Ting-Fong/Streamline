import { Router, Request, Response, NextFunction } from "express";
import channelRoutes from "./channelRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import { getWorkspaceByChannelId } from "../../controllers/channelController.js";

export interface RequestWithWid extends Request {
  wid?: string;
}

const router = Router();

const mergeParams = (req: RequestWithWid, res: Response, next: NextFunction) => {
  req.wid = req.params.wid;
  next();
};

router.use("/workspace", workspaceRoutes);

router.use("/workspace/:wid/channel", mergeParams, channelRoutes);

router.get("/channel/:cid", getWorkspaceByChannelId);

export default router;
