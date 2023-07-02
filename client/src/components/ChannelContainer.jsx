import { useEffect, useState } from "react";
import { Conversation, MemberList } from "./";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

import axios from "axios";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const ChannelContainer = ({ userProfile }) => {
  const { wid, cid } = useParams();
  const [currChannel, setCurrChannel] = useState({});
  const [messages, updateMessages] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const getChannelById = async (wid, cid) => {
      const { data } = await axios.get(
        `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}`
      );
      setCurrChannel(data);
      updateMessages(
        data.messages.map((msg) => ({
          username: msg.from.username,
          avatarURL: msg.from.avatarURL,
          time: msg.createdAt,
          text: msg.content,
          type: msg.type,
        }))
      );
    };
    socket.emit("leaveRoom", { roomId: `roomId:${currChannel._id}` });
    getChannelById(wid, cid);
    socket.emit("joinRoom", { roomId: `roomId:${cid}` });
  }, [cid]);

  return (
    <>
      <div className="h-full w-full flex">
        <div className={`h-full ${showMembers ? "w-3/4" : "w-full"}`}>
          <Conversation
            currChannel={currChannel}
            messages={messages}
            updateMessages={updateMessages}
            showMembers={showMembers}
            setShowMembers={setShowMembers}
            userProfile={userProfile}
          />
        </div>
        {showMembers && (
          <div className="h-full w-1/4 cursor-pointer">
            <MemberList currChannel={currChannel} userProfile={userProfile} />
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelContainer;
