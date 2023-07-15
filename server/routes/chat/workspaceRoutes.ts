import { Router } from "express";
import { param, body } from "express-validator";
import {
  getWorkspacesByUserId,
  getWorkspaceMembers,
  joinWorkspaceByUrl,
  createWorkspace,
} from "../../controllers/workspaceController.js";
import { uploadWorkspaceImageToS3 } from "../../middleware/upload.js";
import catchAsync from "../../utils/catchAsync.js";
import authenticate from "../../middleware/authenticate.js";
import authorization from "../../middleware/authorization.js";
import mongoose from "mongoose";
import { handleResult } from "../../middleware/validator.js";

const router = Router();

router.get("/", authenticate, catchAsync(getWorkspacesByUserId));

router.get(
  "/:wid/members",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authenticate,
  authorization,
  catchAsync(getWorkspaceMembers)
);

router.get(
  "/:wid/invite",
  param("wid").custom((value) => mongoose.isValidObjectId(value)),
  handleResult,
  authenticate,
  authorization,
  catchAsync(joinWorkspaceByUrl)
);

router.post(
  "/new",
  authenticate,
  uploadWorkspaceImageToS3.single("file"),
  body("workspaceName").exists().trim().notEmpty().isLength({ max: 30 }),
  catchAsync(createWorkspace)
);

export default router;
