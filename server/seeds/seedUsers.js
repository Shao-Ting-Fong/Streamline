import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

// await User.deleteMany({});

const names = [
  // "Daisy",
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

const managers = [];

// const avatar = createAvatar(thumbs, {
//   seed: "name",
//   radius: 50,
// });

// const png = await avatar.png({
// });

// png.toFile("../public/avatar/avatar.png");

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

const workspace = await Workspace.findOne({});
const managersChannel = await Channel.findOne({
  workspaceId: workspace._id,
  title: "Managers",
});
const announcementChannel = await Channel.findOne({
  workspaceId: workspace._id,
  title: "Announcement",
});
const publicChannel = await Channel.findOne({
  workspaceId: workspace._id,
  title: "Public",
});

// names.forEach(async (name, idx) => {
//   const username = name.toLowerCase();
//   const hashPassword = await bcrypt.hash(username, 10);

//   const avatar = await createAvatar(thumbs, {
//     seed: name,
//     radius: 50,
//   });

//   const png = await avatar.png();

//   const avatarURL = `/avatar/${nanoid()}.png`;
//   await png.toFile(`../public${avatarURL}`);

//   const newUser = new User({
//     username,
//     email: `${username}@gmail.com`,
//     password: hashPassword,
//     avatarURL,
//     provider: "native",
//     workspaces: [workspace._id],
//   });

//   await newUser.save();
// });

const foundUsers = await User.find({
  username: { $nin: ["Tom", "Irene", "linhuhu"] },
}).select("_id");

const userIds = foundUsers.map((ele) => ele._id);

console.log(userIds);

for (let channel of [announcementChannel, publicChannel]) {
  await channel.updateOne({ $push: { members: { $each: userIds } } });
  await channel.save();
}

// await managersChannel.updateOne({ $push: { members: { $each: managers } } });
// await managersChannel.save();
