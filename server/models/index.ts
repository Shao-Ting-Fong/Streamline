import { Schema, Types, model } from "mongoose";

// interface IWorkspaceMember {
//   userIds: Types.ObjectId[];
//   role: string;
//   power: Number;
// }

interface IWorkspace {
  _id: Types.ObjectId;
  title: string;
  ownerId: Types.ObjectId;
  avatarURL: string;
}

// const WorkspaceMembersSchema = new Schema<IWorkspaceMember>({
//   userIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
//   role: { type: String, default: "member", required: true },
//   power: { type: Number, default: 1, required: true },
// });

const WorkspaceSchema = new Schema<IWorkspace>({
  title: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  avatarURL: String,
});

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatarURL: string;
  provider: string;
  workspaces?: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatarURL: { type: String, required: true },
    provider: { type: String, required: true },
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
  },
  { timestamps: true }
);

interface IMessage {
  _id: Types.ObjectId;
  from: Types.ObjectId; //userId
  // to: Types.ObjectId; //roomId
  content: string;
  type: "text" | "image" | "file";
}

// interface IChannelMember {
//   userId: Types.ObjectId;
//   role: string;
//   power: Number;
// }

interface IChannel {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  title: string;
  category: "team" | "direct";
  members: Types.ObjectId[];
  messages: Types.DocumentArray<IMessage>;
}

const messageSchema = new Schema<IMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file"], required: true },
  },
  { timestamps: true }
);

// const channelMemberSchema = new Schema<IChannelMember>({
//   userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   role: { type: String, default: "member", required: true },
//   power: { type: Number, default: 1, required: true },
// });

const channelSchema = new Schema<IChannel>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  title: { type: String, required: true },
  members: { type: [Schema.Types.ObjectId], ref: "User", required: true },
  category: {
    type: String,
    enum: ["team", "direct"],
    required: true,
  },
  messages: [messageSchema],
});

export const Workspace = model("Workspace", WorkspaceSchema);

export const Channel = model("Channel", channelSchema);

export const User = model("User", UserSchema);
