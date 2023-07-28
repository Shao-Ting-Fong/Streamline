import { useEffect, useState } from "react";
import { Conversation, MemberList } from "./";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { socket } from "../socket";
import axios from "axios";
import { toast } from "react-toastify";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const cookies = new Cookies();

const ChannelContainer = ({ userProfile }) => {
  const { wid, cid } = useParams();
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const [currChannel, setCurrChannel] = useState({});
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const getChannelInfoById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/info`, {
        headers: {
          Authorization: authString,
        },
      });
      setCurrChannel(data);
    };

    try {
      socket.emit("leaveRoom", { roomId: currChannel._id });
      getChannelInfoById(wid, cid);
      socket.emit("joinRoom", { roomId: cid });
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }
  }, [wid, cid, authToken]);

  useEffect(() => {
    const getChannelMembersById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/members`, {
        headers: {
          Authorization: authString,
        },
      });

      setMembers(data);
    };

    try {
      getChannelMembersById(wid, cid);
      socket.on("onlineState", ({ userId, state }) => {
        setMembers((prevMembers) => {
          const idxOfMember = prevMembers.findIndex((member) => member._id === userId);
          if (idxOfMember !== -1) {
            prevMembers[idxOfMember].online = state;
          }
          return [...prevMembers];
        });
      });

      socket.on("newMember", () => {
        getChannelMembersById(wid, cid);
      });
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }

    return () => {
      socket.off("newMember");
      socket.off("onlineState");
    };
  }, [cid, authToken]);

  return (
    <>
      <div className="h-full w-full flex">
        <div className={`h-full ${showMembers ? "w-3/4" : "w-full"}`}>
          <Conversation
            currChannel={currChannel}
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
