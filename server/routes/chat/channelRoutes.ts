import { Router } from "express";
import { param, body } from "express-validator";
import mongoose from "mongoose";
import {
  addMessage,
  getChannelInfoById,
  getUserChannels,
  getChannelMembersById,
  getChannelMessagesById,
  createNewChannel,
} from "../../controllers/channelController.js";
import { uploadMessagesToS3 } from "../../middleware/upload.js";
import catchAsync from "../../utils/catchAsync.js";
import { handleResult } from "../../middleware/validator.js";
import authorization from "../../middleware/authorization.js";

const router = Router();

router.get("/", catchAsync(getUserChannels));

router.post(
  "/new",
  body("channelName").exists().trim().notEmpty().isLength({ max: 30 }),
  body("isPrivate").exists().isIn(["true", "false"]),
  handleResult,
  catchAsync(createNewChannel)
);

router.get(
  "/:cid/info",
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelInfoById)
);

router.get(
  "/:cid/members",
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelMembersById)
);

router.get(
  "/:cid/msg",
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authorization,
  catchAsync(getChannelMessagesById)
);

router.post(
  "/:cid/msg",
  param("cid").custom((value) => mongoose.isValidObjectId(value)),
  uploadMessagesToS3.single("file"),
  body("from").exists().isJWT(),
  body("to").exists().isJSON(),
  handleResult,
  authorization,
  catchAsync(addMessage)
);

export default router;
