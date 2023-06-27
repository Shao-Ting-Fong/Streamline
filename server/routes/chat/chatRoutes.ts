import { Router, Request, Response, NextFunction } from "express";
import channelRoutes from "./channelRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";

const router = Router();

const mergeParams = (req: Request, res: Response, next: NextFunction) => {
  req.wid = req.params.wid;
  next();
};

router.use("/workspace", workspaceRoutes);

router.use("/workspace/:wid/channel", mergeParams, channelRoutes);

export default router;
