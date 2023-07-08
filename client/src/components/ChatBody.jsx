import { useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import dayjs from "dayjs";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const ChatBody = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <>
      <div
        id="message-container"
        className="w-full h-full flex-grow px-3 py-5 overflow-y-scroll bg-dark-gray-background scrollbar-chatbody">
        {messages.length > 0 &&
          messages.map((msg, idx) => (
            <div className="w-full flex items-start" key={idx}>
              <Avatar src={IMG_ROUTE + msg.avatarURL} />
              <div className="w-full px-4 py-2 mx-3 mb-3 bg-light-color-blue-background rounded-md" key={idx}>
                <p className="text-md font-bold opacity-70 mb-2">
                  {msg.username}{" "}
                  <span className="text-secondary text-sm font-normal">{dayjs(msg.time).format("HH:mm a")}</span>
                </p>
                {msg.type === "text" && <p className="break-all">{msg.text}</p>}
                {msg.type === "image" && <img src={msg.text} alt="" className="h-[200px] mt-2" />}
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default ChatBody;
