import { Router, Request, Response } from "express";
import {
  addMessage,
  getChannelById,
  getUserChannels,
} from "../../controllers/channelController.js";

const router = Router();

router.get("/", getUserChannels);

router.get("/:cid", getChannelById);

router.post("/:cid/msg", addMessage);

export default router;
