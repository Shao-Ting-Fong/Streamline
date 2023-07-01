import { useEffect, useState } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SendIcon from "@mui/icons-material/Send";
import { socket } from "../socket";
import Cookies from "universal-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChatBody, VideoChat } from "./";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const cookies = new Cookies();

const Conversation = ({
  currChannel,
  messages,
  updateMessages,
  setShowMembers,
  userProfile,
}) => {
  const { wid, cid } = useParams();
  const token = cookies.get("jwtToken");
  const [newMsg, setNewMsg] = useState("");
  const [isStreaming, setStreaming] = useState(false);

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("message", data);
      // if (data.msg.username !== userProfile.username) {
      updateMessages((prev) => [...prev, data.msg]);
      // }
    });
    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = async (evt) => {
    evt.preventDefault();
    const { data } = await axios.post(
      `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`,
      {
        from: token,
        to: { workspace: wid, type: "team", id: currChannel._id },
        msg: newMsg,
      }
    );
    console.log("Send Message", data);
    // updateMessages((prev) => [...prev, data.msg]);
    setNewMsg("");
  };

  const channelTitle =
    Object.keys(currChannel).length > 0
      ? currChannel.members
          .filter((member) => member.username !== userProfile.username)
          .map((member) => member.username)
          .join()
      : "";

  return (
    <>
      <div className="h-screen">
        <div
          className={`w-full ${
            isStreaming ? "h-1/2" : "h-0 translate-y-0"
          } ease-in-out duration-500`}>
          {isStreaming && (
            <VideoChat isStreaming={isStreaming} setStreaming={setStreaming} />
          )}
        </div>

        <div
          className={`${
            isStreaming ? "h-1/2" : "h-full"
          } w-auto flex flex-col`}>
          <div
            className="h-[62px] shrink-0 w-full bg-[#F8FAFF] flex items-center pl-3 pr-6"
            style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
            <h3 className="text-lg">
              {currChannel.category === "team"
                ? currChannel.title
                : channelTitle}
            </h3>
            <div className="ml-auto">
              <button onClick={() => setStreaming((prev) => !prev)}>
                <VideocamIcon color={isStreaming ? "primary" : ""} />
              </button>
              <button
                className="ml-4"
                onClick={() => setShowMembers((prev) => !prev)}>
                <PeopleAltIcon />
              </button>
            </div>
          </div>
          <ChatBody messages={messages} />
          <div
            className="h-[80px] w-full bg-[#F8FAFF] flex items-center"
            style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
            <form
              className="w-full h-full flex items-center mx-3"
              onSubmit={sendMessage}>
              <input
                className="bg-gray-200 w-full h-1/2 ps-5 rounded-full focus:outline-none"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
              />
              <button className="ms-3 hover:text-primary">
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversation;
