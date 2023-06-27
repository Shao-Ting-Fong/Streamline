import { Router } from "express";
import { getWorkspacesById } from "../../controllers/workspaceController.js";

const router = Router();

router.get("/", getWorkspacesById);

export default router;
