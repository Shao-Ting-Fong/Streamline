import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, "/../.env") });
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

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/slackalendar";
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
await User.deleteMany({ username: { $nin: ["Tom", "Irene", "linhuhu"] } });

const owner = await User.findOne({ username: "Tom" });

const workspace = Workspace({
  title: "Test Org.",
  ownerId: owner._id,
  avatarURL: "/img/company.png",
});

await workspace.save();

console.log("Before for-each loop");
names.forEach(async (name) => {
  console.log("Inside for-each loop", name);
  const hashPassword = await bcrypt.hash(name.toLowerCase(), 10);

  const avatar = await createAvatar(thumbs, {
    seed: name,
    radius: 50,
  });

  const png = await avatar.png();

  const avatarURL = `/avatar/${name}.png`;
  await png.toFile(`../public${avatarURL}`);

  const newUser = new User({
    username: name,
    email: `${name}@gmail.com`,
    password: hashPassword,
    avatarURL,
    provider: "native",
    workspaces: [],
  });

  await newUser.save();
});

await User.updateMany({}, { workspaces: [workspace._id] });

// seedDB().then(() => {
//   mongoose.connection.close();
// });
