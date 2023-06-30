import { useEffect, useState } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import { socket } from "../socket";
import Cookies from "universal-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChatBody, VideoChat } from "./";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const cookies = new Cookies();

const Conversation = () => {
  const { wid, cid } = useParams();
  const token = cookies.get("jwtToken");
  const [currChannel, setCurrChannel] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [messages, updateMessages] = useState([]);
  const [isStreaming, setStreaming] = useState(false);

  useEffect(() => {
    socket.on("message", (data) => {
      // console data
      updateMessages((prev) => [...prev, data.msg]);
    });
    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    const getChannelById = async (wid, cid) => {
      const { data } = await axios.get(
        `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}`
      );
      setCurrChannel(data);
      updateMessages(
        data.messages.map((msg) => ({
          username: msg.from.username,
          time: msg.createdAt,
          text: msg.content,
        }))
      );
    };
    socket.emit("leaveRoom", { roomId: `roomId:${currChannel._id}` });
    getChannelById(wid, cid);
    socket.emit("joinRoom", { roomId: `roomId:${cid}` });
  }, [cid]);

  const sendMessage = async (evt) => {
    evt.preventDefault();
    const { data } = await axios.post(
      `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`,
      {
        from: token,
        to: currChannel._id,
        msg: newMsg,
      }
    );
    updateMessages([...messages, data.msg]);
    evt.target.value = "";
  };

  return (
    <>
      <div className="h-screen">
        {isStreaming && (
          <div className="h-1/2 w-full resize-y">
            <VideoChat />
          </div>
        )}
        <div
          className={`${
            isStreaming ? "h-1/2" : "h-full"
          } w-auto flex flex-col`}>
          <div
            className="h-[62px] w-full bg-[#F8FAFF] flex items-center pl-3 pr-6"
            style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
            <h3 className="text-lg">{currChannel.title}</h3>
            <button
              className="ml-auto"
              onClick={
                () => setStreaming((prev) => !prev)
                // () => window.open(`${API_ROUTE}/video/${cid}`, "_blank")
              }>
              <VideocamIcon color={isStreaming ? "primary" : ""} />
            </button>
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
                onChange={(e) => setNewMsg(e.target.value)}
              />
              <button className="ms-3">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversation;
