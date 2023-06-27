import { Schema, Types, model } from "mongoose";

interface IWorkspaceManager {
  userIds: Types.ObjectId[];
  role: string;
  power: Number;
}

interface IWorkspace {
  _id: Types.ObjectId;
  title: string;
  ownerId: Types.ObjectId;
  avatarURL: string;
  managers?: Types.DocumentArray<IWorkspaceManager>;
}

const WorkspaceManagerSchema = new Schema<IWorkspaceManager>({
  userIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
  role: { type: String, default: "staff", required: true },
  power: { type: Number, default: 3, required: true },
});

const WorkspaceSchema = new Schema<IWorkspace>({
  title: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  avatarURL: String,
  managers: [WorkspaceManagerSchema],
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

const UserSchema = new Schema<IUser>({
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
});

interface IMessage {
  _id: Types.ObjectId;
  from: Types.ObjectId; //userId
  to: Types.ObjectId; //roomId
  content: string;
}

interface IChannelMember {
  userId: Types.ObjectId;
  role: string;
  power: Number;
}

interface IChannel {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  title: string;
  category: "public" | "private" | "direct";
  members: Types.DocumentArray<IChannelMember>;
  messages: Types.DocumentArray<IMessage>;
}

const messageSchema = new Schema<IMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const channelMemberSchema = new Schema<IChannelMember>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "member", required: true },
  power: { type: Number, default: 1, required: true },
});

const channelSchema = new Schema<IChannel>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  title: { type: String, required: true },
  members: [channelMemberSchema],
  category: {
    type: String,
    enum: ["public", "private", "direct"],
    required: true,
  },
  messages: [messageSchema],
});

export const Workspace = model("Workspace", WorkspaceSchema);

export const Channel = model("Channel", channelSchema);

export const User = model("User", UserSchema);
