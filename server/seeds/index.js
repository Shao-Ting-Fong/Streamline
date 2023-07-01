import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
// import Workspace from "../dist/models/workspace.js";
// import Channel from "../dist/models/channel.js";
// import User from "../dist/models/user.js";

const names = [
  "Daisy",
  "Deborah",
  "Isabel",
  "Stella",
  "Debra",
  "Beverly",
  "Vera",
  "Angela",
  "Lucy",
  "Lauren",
  "Janet",
  "Loretta",
  "Tracey",
  "Beatrice",
  "Sabrina",
  "Melody",
  "Chrysta",
  "Christina",
  "Vicki",
  "Molly",
  "Alison",
  "Miranda",
  "Stephanie",
  "Leona",
  "Katrina",
  "Wade",
  "Dave",
  "Seth",
  "Ivan",
  "Riley",
  "Gilbert",
  "Jorge",
  "Dan",
  "Brian",
  "Roberto",
  "Ramon",
  "Miles",
  "Liam",
  "Nathaniel",
  "Ethan",
  "Lewis",
  "Milton",
  "Claude",
  "Joshua",
  "Glen",
  "Harvey",
  "Blake",
  "Antonio",
];

const dbUrl = "mongodb://127.0.0.1:27017/slackalendar";

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
// await User.deleteMany({ username: { $nin: ["Tom", "Irene", "linhuhu"] } });

const owner = await User.findOne({ username: "Tom" });
const staff = await User.findOne({ username: "Irene" });
const member = await User.findOne({ username: "linhuhu" });
const workspace = Workspace({
  title: "Test Org.",
  ownerId: owner._id,
  avatarURL: "/img/company.png",
  members: [owner._id, staff._id, member._id],
});

await workspace.save();

// console.log("Before for-each loop");
// names.forEach(async (name) => {
//   console.log("Inside for-each loop", name);
//   const hashPassword = await bcrypt.hash(name.toLowerCase(), 10);

//   const avatar = await createAvatar(thumbs, {
//     seed: name,
//     radius: 50,
//   });

//   const png = await avatar.png();

//   const avatarURL = `/avatar/${name}.png`;
//   await png.toFile(`../public${avatarURL}`);

//   const newUser = new User({
//     username: name,
//     email: `${name}@gmail.com`,
//     password: hashPassword,
//     avatarURL,
//     provider: "native",
//     workspaces: [workspace._id],
//   });

//   await newUser.save();
// });

// console.log("After for-each loop");

await User.updateMany({}, { workspaces: [workspace._id] });

// console.log("Before finding other users.");

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
