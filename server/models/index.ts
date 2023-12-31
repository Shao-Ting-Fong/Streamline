import { Schema, Types, model } from "mongoose";

interface IWorkspace {
  _id: Types.ObjectId;
  title: string;
  ownerId: Types.ObjectId;
  avatarURL: string;
}

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
  content: string;
  type: "text" | "image" | "system";
}

interface IChannel {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  title: string;
  category: "public" | "private" | "direct";
  members: Types.ObjectId[];
  messages: Types.DocumentArray<IMessage>;
}

const messageSchema = new Schema<IMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "system"], required: true },
  },
  { timestamps: true }
);

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
    enum: ["public", "private", "direct"],
    required: true,
  },
  messages: [messageSchema],
});

export const Workspace = model("Workspace", WorkspaceSchema);

export const Channel = model("Channel", channelSchema);

export const User = model("User", UserSchema);
