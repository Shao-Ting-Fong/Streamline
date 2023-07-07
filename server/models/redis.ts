import { Redis } from "ioredis";

export const redis = new Redis({
  port: 6379, // Redis port
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});
