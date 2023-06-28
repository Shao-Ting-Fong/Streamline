import { Router, Request, Response } from "express";
import {
  signup,
  login,
  getUserProfile,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getUserProfile);

export default router;
