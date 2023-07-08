import { Types } from "mongoose";
import { Channel } from "./index.js";

export interface MessageTo {
  workspace: Types.ObjectId;
  type: "public" | "private" | "direct" | undefined;
  id: Types.ObjectId;
}

export const findOrAddChannel = async (userId: string, to: MessageTo) => {
  const { workspace, type, id } = to;

  if (type === "direct") {
    const foundChannel = await Channel.findOne({
      $and: [{ category: "direct" }, { workspaceId: workspace }, { members: userId }, { members: id }],
    });
    if (!foundChannel) {
      // create new channel
      const newChannel = new Channel({
        workspaceId: workspace,
        title: "???",
        category: "direct",
        members: [userId, id],
        messages: [],
      });

      await newChannel.save();
      return newChannel;
    }
    return foundChannel;
  } else {
    const foundChannel = await Channel.findById(id);
    return foundChannel;
  }
};
