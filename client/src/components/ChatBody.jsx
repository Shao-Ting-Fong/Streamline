import { useEffect, useRef } from "react";

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
        className="w-full h-full flex-grow py-3 overflow-y-scroll">
        {messages.length > 0 &&
          messages.map((msg, idx) => {
            return (
              <div
                className="px-4 py-2 mx-3 mb-3 bg-[#e6e9ff] rounded-md"
                key={idx}>
                <p className="text-md font-bold opacity-70 mb-2">
                  {msg.username}{" "}
                  <span className="text-[#777] text-sm font-normal">
                    {msg.time}
                  </span>
                </p>
                <p>{msg.text}</p>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default ChatBody;
