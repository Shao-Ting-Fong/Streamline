import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, "/../.env") });
// import Workspace from "../dist/models/workspace.js";
// import Channel from "../dist/models/channel.js";
// import User from "../dist/models/user.js";

// const dbUrl = process.env.DB_URL;
const dbUrl = "mongodb://127.0.0.1:27017/slackalendar";
console.log(dbUrl);
try {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("CONNECTION OPEN!!!");
} catch (error) {
  console.log("OH NO ERROR!!!!");
  console.log(err);
}

// const seedDB = async () => {
await Workspace.deleteMany({});
await Channel.deleteMany({});

const owner = await User.findOne({ username: "Tom" });
const staff = await User.findOne({ username: "Irene" });
const member = await User.findOne({ username: "linhuhu" });
const workspace = Workspace({
  title: "Appworks School Backend Batch #20",
  ownerId: owner._id,
  avatarURL: "/uploads/workspaces/company.png",
});

await workspace.save();

await User.updateMany({}, { workspaces: [workspace._id] });

const otherUsers = await User.find({
  username: { $nin: ["Tom", "Irene", "linhuhu"] },
});

console.log(otherUsers);

console.log("Before mapping.");

const otherUserIds = otherUsers.map((ele) => ele._id);

console.log(otherUserIds);

const seedChannels = [
  {
    workspaceId: workspace._id,
    title: "Announcement",
    members: [owner._id, staff._id, member._id, ...otherUserIds],
    category: "team",
    messages: [],
  },
  {
    workspaceId: workspace._id,
    title: "Public",
    members: [owner._id, staff._id, member._id, ...otherUserIds],
    category: "team",
    messages: [],
  },
  {
    workspaceId: workspace._id,
    title: "Managers",
    members: [owner._id, staff._id, member._id],
    category: "team",
    messages: [],
  },
];

Channel.insertMany(seedChannels).then((res) => {
  console.log(res);
});

// seedDB().then(() => {
//   mongoose.connection.close();
// });
