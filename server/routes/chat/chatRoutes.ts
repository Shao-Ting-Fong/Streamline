import { Router, Request, Response, NextFunction } from "express";
import { param, body } from "express-validator";
import mongoose from "mongoose";
import workspaceRoutes from "./workspaceRoutes.js";
import {
  addMessage,
  getChannelInfoById,
  getUserChannels,
  getChannelMembersById,
  getChannelMessagesById,
  getWorkspaceByChannelId,
  createNewChannel,
} from "../../controllers/channelController.js";
import { uploadMessagesToS3 } from "../../middleware/upload.js";
import catchAsync from "../../utils/catchAsync.js";
import { handleResult } from "../../middleware/validator.js";
import authorization from "../../middleware/authorization.js";

const router = Router();

router.use("/workspace", workspaceRoutes);

router.get(
  "/workspace/:wid/channel",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  catchAsync(getUserChannels)
);

router.post(
  "/workspace/:wid/channel/new",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  body("channelName").exists().trim().notEmpty().isLength({ max: 30 }),
  body("isPrivate").exists().isIn(["true", "false"]),
  handleResult,
  catchAsync(createNewChannel)
);

router.get(
  "/workspace/:wid/channel/:cid/info",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelInfoById)
);

router.get(
  "/workspace/:wid/channel/:cid/members",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelMembersById)
);

router.get(
  "/workspace/:wid/channel/:cid/msg",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelMessagesById)
);

router.post(
  "/workspace/:wid/channel/:cid/msg",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  uploadMessagesToS3.single("file"),
  body("from").exists().isJWT(),
  body("to").exists().isJSON(),
  handleResult,
  authorization,
  catchAsync(addMessage)
);

router.get(
  "/channel/:cid",
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getWorkspaceByChannelId)
);

export default router;
