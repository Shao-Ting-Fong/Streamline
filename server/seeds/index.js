import mongoose from "mongoose";
import { Workspace, Channel, User } from "../dist/models/index.js";
// import Workspace from "../dist/models/workspace.js";
// import Channel from "../dist/models/channel.js";
// import User from "../dist/models/user.js";

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

const owner = await User.findOne({ username: "Tom" });
const staff = await User.findOne({ username: "Irene" });
const member = await User.findOne({ username: "linhuhu" });
const workspace = Workspace({
  title: "Test Org.",
  ownerId: owner._id,
  avatarURL: "/img/company.png",
  members: [
    { userId: [owner._id], role: "owner", power: 99 },
    { userIds: [staff._id], role: "staff", power: 3 },
    { userIds: [member._id] },
  ],
});

await workspace.save();

await User.updateMany({}, { workspaces: [workspace._id] });

const seedChannels = [
  {
    workspaceId: workspace._id,
    title: "Announcement",
    members: [
      { userId: owner._id, role: "owner", power: 99 },
      { userId: staff._id, role: "staff", power: 3 },
      { userId: member._id, role: "member", power: 1 },
    ],
    category: "public",
    messages: [],
  },
  {
    workspaceId: workspace._id,
    title: "Public",
    members: [
      { userId: owner._id, role: "owner", power: 99 },
      { userId: staff._id, role: "staff", power: 3 },
      { userId: member._id, role: "member", power: 1 },
    ],
    category: "public",
    messages: [],
  },
  {
    workspaceId: workspace._id,
    title: "Managers",
    members: [
      { userId: owner._id, role: "owner", power: 99 },
      { userId: staff._id, role: "staff", power: 3 },
    ],
    category: "private",
    messages: [],
  },
];

Channel.insertMany(seedChannels).then((res) => {
  console.log(res);
});
// };

// seedDB().then(() => {
//   mongoose.connection.close();
// });
