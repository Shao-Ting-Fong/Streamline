import { Router } from "express";
import {
  addMessage,
  getChannelInfoById,
  getUserChannels,
  getChannelMembersById,
  getChannelMessagesById,
  createNewChannel,
} from "../../controllers/channelController.js";
import { uploadMessagesToS3 } from "../../middleware/upload.js";

const router = Router();

router.get("/", getUserChannels);

router.post("/new", createNewChannel);

router.get("/:cid/info", getChannelInfoById);

router.get("/:cid/members", getChannelMembersById);

router.get("/:cid/msg", getChannelMessagesById);

router.post("/:cid/msg", uploadMessagesToS3.single("file"), addMessage);

export default router;
