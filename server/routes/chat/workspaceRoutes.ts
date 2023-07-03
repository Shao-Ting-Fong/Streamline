import { Router } from "express";
import {
  getWorkspacesByUserId,
  getWorkspaceMembers,
} from "../../controllers/workspaceController.js";

const router = Router();

router.get("/", getWorkspacesByUserId);

router.get("/:wid/members", getWorkspaceMembers);

export default router;
