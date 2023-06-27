// import { Schema, Types, model } from "mongoose";

// export interface IUser {
//   _id: Types.ObjectId;
//   username: string;
//   email: string;
//   password: string;
//   avatarURL: string;
//   provider: string;
//   workspaces?: Types.ObjectId[];
// }

// const UserSchema = new Schema<IUser>({
//   username: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   avatarURL: { type: String, required: true },
//   provider: { type: String, required: true },
//   workspaces: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Workspace",
//     },
//   ],
// });

// export default model("User", UserSchema);
