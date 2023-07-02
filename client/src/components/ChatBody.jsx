import { useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";

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
        className="w-full h-full flex-grow p-3 overflow-y-scroll">
        {messages.length > 0 &&
          messages.map((msg, idx) => (
            <div className="w-full flex items-start" key={idx}>
              <Avatar imgUrl={msg.avatarURL} />
              <div
                className="w-full px-4 py-2 mx-3 mb-3 bg-light-color-purple rounded-md"
                key={idx}>
                <p className="text-md font-bold opacity-70 mb-2">
                  {msg.username}{" "}
                  <span className="text-secondary text-sm font-normal">
                    {msg.time}
                  </span>
                </p>
                {msg.type === "text" && <p>{msg.text}</p>}
                {msg.type === "image" && (
                  <img src={msg.text} alt="" className="h-[200px] mt-2" />
                )}
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default ChatBody;
