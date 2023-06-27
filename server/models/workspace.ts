// import { Schema, Types, model } from "mongoose";

// interface IWorkspaceManager {
//   userIds: Types.ObjectId[];
//   role: string;
//   power: Number;
// }

// interface IWorkspace {
//   _id: Types.ObjectId;
//   title: string;
//   ownerId: Types.ObjectId;
//   avatarURL: string;
//   managers?: Types.DocumentArray<IWorkspaceManager>;
// }

// const WorkspaceManagerSchema = new Schema<IWorkspaceManager>({
//   userIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
//   role: { type: String, default: "staff", required: true },
//   power: { type: Number, default: 3, required: true },
// });

// const WorkspaceSchema = new Schema<IWorkspace>({
//   title: { type: String, required: true },
//   ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   avatarURL: String,
//   managers: [WorkspaceManagerSchema],
// });

// export default model("Workspace", WorkspaceSchema);
