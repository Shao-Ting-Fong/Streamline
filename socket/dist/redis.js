import { Redis } from "ioredis";
import "dotenv/config";
export const publisher = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
});
export const subscriber = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
});
