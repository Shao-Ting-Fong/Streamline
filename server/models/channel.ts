// import { Schema, Types, model } from "mongoose";

// interface IMessage {
//   _id: Types.ObjectId;
//   from: Types.ObjectId; //userId
//   to: Types.ObjectId; //roomId
//   content: string;
// }

// interface IChannelMember {
//   userId: Types.ObjectId;
//   role: string;
//   power: Number;
// }

// interface IChannel {
//   _id: Types.ObjectId;
//   workspaceId: Types.ObjectId;
//   title: string;
//   category: "public" | "private" | "direct";
//   members: Types.DocumentArray<IChannelMember>;
//   messages: Types.DocumentArray<IMessage>;
// }

// const messageSchema = new Schema<IMessage>(
//   {
//     from: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     to: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
//     content: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const channelMemberSchema = new Schema<IChannelMember>({
//   userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   role: { type: String, default: "member", required: true },
//   power: { type: Number, default: 1, required: true },
// });

// const channelSchema = new Schema<IChannel>({
//   workspaceId: {
//     type: Schema.Types.ObjectId,
//     ref: "Workspace",
//     required: true,
//   },
//   title: { type: String, required: true },
//   members: [channelMemberSchema],
//   category: {
//     type: String,
//     enum: ["public", "private", "direct"],
//     required: true,
//   },
//   messages: [messageSchema],
// });

// export default model("Channel", channelSchema);
