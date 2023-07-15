import { Request, Response } from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import signJWT, { EXPIRE_TIME } from "../utils/signJWT.js";
import { nanoid } from "nanoid";
import { ExpressError } from "../utils/errorHandler.js";
import { User } from "../models/index.js";
import { uploadImageToS3 } from "../models/s3bucket.js";

const saltRounds = 10;

export const signup = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const foundUser = await User.find({ $or: [{ username }, { email }] });
  if (foundUser.length > 0) throw new ExpressError("Username or email has been taken.", 401);
  const hashPassword = await bcrypt.hash(password, saltRounds);

  const response = await axios.get(`https://api.dicebear.com/6.x/thumbs/png?seed=${username}&radius=50`, {
    responseType: "stream",
  });
  const avatarURL = `uploads/avatar/${nanoid()}.png`;

  await uploadImageToS3(response, avatarURL);

  const newUser = new User({
    ...req.body,
    password: hashPassword,
    avatarURL,
    provider: "native",
  });

  await newUser.save();
  const token = await signJWT(newUser._id);
  res.status(200).json({
    data: {
      access_token: token,
      access_expired: EXPIRE_TIME,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarURL: newUser.avatarURL,
        provider: newUser.provider,
        workspaces: newUser.workspaces,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (!foundUser) {
    throw new ExpressError("Invalid username or password", 401);
  }
  const isValidPassword = await bcrypt.compare(password, foundUser.password);
  if (!isValidPassword) {
    throw new ExpressError("Invalid username or password", 401);
  }

  const token = await signJWT(foundUser._id);
  res.status(200).json({
    data: {
      access_token: token,
      access_expired: EXPIRE_TIME,
      user: {
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        avatarURL: foundUser.avatarURL,
        provider: foundUser.provider,
        workspaces: foundUser.workspaces,
      },
    },
  });
};

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const foundUser = await User.findById(userId).select("_id username email avatarURL workspaces");
  if (!foundUser) {
    throw new ExpressError("User not found", 404);
  }

  res.status(200).json(foundUser);
};
