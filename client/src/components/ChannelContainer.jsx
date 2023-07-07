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
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const getChannelInfoById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/info`);
      setCurrChannel(data);
    };
    socket.emit("leaveRoom", { roomId: currChannel._id });
    getChannelInfoById(wid, cid);
    socket.emit("joinRoom", { roomId: cid });
  }, [cid]);

  useEffect(() => {
    const getChannelMessagesById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`);
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
    getChannelMessagesById(wid, cid);
  }, [cid]);

  useEffect(() => {
    const getChannelMembersById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/members`);

      setMembers(data);
    };
    getChannelMembersById(wid, cid);
    socket.on("onlineState", ({ userId, state }) => {
      console.log("Online state changed. userId:", userId);
      setMembers((prevMembers) => {
        const idxOfMember = prevMembers.findIndex((member) => member._id === userId);
        if (idxOfMember !== -1) {
          prevMembers[idxOfMember].online = state;
        }
        return [...prevMembers];
      });
    });

    return () => {
      socket.off("onlineState");
    };
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
            members={members}
          />
        </div>
        {showMembers && (
          <div className="h-full w-1/4">
            <MemberList members={members} userProfile={userProfile} />
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelContainer;
