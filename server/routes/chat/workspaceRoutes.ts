import { Router } from "express";
import {
  getWorkspacesByUserId,
  getWorkspaceMembers,
  joinWorkspaceByUrl,
  createWorkspace,
} from "../../controllers/workspaceController.js";
import { uploadWorkspaceImageToS3 } from "../../middleware/upload.js";

const router = Router();

router.get("/", getWorkspacesByUserId);

router.get("/:wid/members", getWorkspaceMembers);

router.get("/:wid/invite", joinWorkspaceByUrl);

router.post("/new", uploadWorkspaceImageToS3.single("file"), createWorkspace);

export default router;
