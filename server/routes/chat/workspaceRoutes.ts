import { Router } from "express";
import {
  getWorkspacesByUserId,
  getWorkspaceMembers,
  joinWorkspaceByUrl,
} from "../../controllers/workspaceController.js";

const router = Router();

router.get("/", getWorkspacesByUserId);

router.get("/:wid/members", getWorkspaceMembers);

router.get("/:wid/invite", joinWorkspaceByUrl);

export default router;
