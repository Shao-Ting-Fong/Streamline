import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { signup, login, getUserProfile } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";
import { handleResult } from "../middleware/validator.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.post(
  "/signup",
  body("email").isEmail().normalizeEmail(),
  body("username").exists().trim().notEmpty(),
  body("password").exists().notEmpty(),
  handleResult,
  catchAsync(signup)
);
router.post(
  "/login",
  body("username").exists().trim().notEmpty(),
  body("password").exists().notEmpty(),
  handleResult,
  catchAsync(login)
);
router.get("/profile", authenticate, catchAsync(getUserProfile));

export default router;
