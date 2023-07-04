import path from "path";
import { nanoid } from "nanoid";
import { S3Client } from "@aws-sdk/client-s3";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";

import { Request } from "express";

const MAX_FILE_SIZE = 5 * 1000 * 1000;

const s3Config = new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY ?? "",
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.BUCKET_REGION,
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadToBuffer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const messagesMulterS3Config = multerS3({
  s3: s3Config,
  bucket: process.env.BUCKET_NAME ?? "",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, "uploads/messages/" + nanoid() + path.extname(file.originalname));
  },
});

const avatarsMulterS3Config = multerS3({
  s3: s3Config,
  bucket: process.env.BUCKET_NAME ?? "",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, "uploads/avatars/" + nanoid() + path.extname(file.originalname));
  },
});

export const uploadMessagesToS3 = multer({
  storage: messagesMulterS3Config,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadAvatarsToS3 = multer({
  storage: avatarsMulterS3Config,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
