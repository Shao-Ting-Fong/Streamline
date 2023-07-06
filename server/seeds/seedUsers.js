import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
import bcrypt from "bcrypt";
import path from "path";
import dotenv from "dotenv";
import { createAvatar } from "@dicebear/core";
import * as thumbs from "@dicebear/thumbs";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, "/../.env") });
// import Workspace from "../dist/models/workspace.js";
// import Channel from "../dist/models/channel.js";
// import User from "../dist/models/user.js";cd

const names = [
  "Irene",
  "Tom",
  "linhuhu",
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

// const dbUrl = process.env.DB_URL;
const dbUrl = "mongodb://127.0.0.1:27017/slackalendar";
console.log(dbUrl);
try {
  const result = await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // console.log(result);
  console.log("CONNECTION OPEN!!!");
} catch (error) {
  console.log("OH NO ERROR!!!!");
  console.log(error);
}

// const seedDB = async () => {
await Workspace.deleteMany({});
await User.deleteMany({});

for (let name of names) {
  const hashPassword = await bcrypt.hash(name.toLowerCase(), 10);

  // const avatar = await createAvatar(thumbs, {
  //   seed: name,
  //   radius: 50,
  // });

  // const png = await avatar.png();

  const avatarURL = `/uploads/avatar/${name}.png`;
  // await png.toFile(`../public${avatarURL}`);

  const newUser = new User({
    username: name,
    email: `${name}@gmail.com`,
    password: hashPassword,
    avatarURL,
    provider: "native",
    workspaces: [],
  });

  await newUser.save();
}

console.log("Before create workspace.");

const owner = await User.findOne({ username: "Tom" });

const workspace = new Workspace({
  title: "Appworks School Backend Batch #20",
  ownerId: owner._id,
  avatarURL: "/uploads/workspaces/company.png",
});

await workspace.save();

User.updateMany({}, { workspaces: [workspace._id] }).then((res) => {
  console.log(res);
});

// seedDB().then(() => {
//   mongoose.connection.close();
// });
