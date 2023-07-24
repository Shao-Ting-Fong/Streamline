import { Redis } from "ioredis";
import { sendingMessages } from "./messages.js";

export const publisher = new Redis({
  port: 6379, // Redis port
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});

export const subscriber = new Redis({
  port: 6379, // Redis port
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});

subscriber.psubscribe("message.*", (err, count) => {
  if (err) console.error(err.message);
  console.log(`Subscribed to ${count} channels.`);
});

subscriber.on("pmessage", (pattern, channel, message) => {
  const messageJson = JSON.parse(message);
  const { event } = messageJson;

  if (event === "videoChat") {
    const { event, ...messageInput } = messageJson;
    sendingMessages(messageInput);
    return;
  }
});
