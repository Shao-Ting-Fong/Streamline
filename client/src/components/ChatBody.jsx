import { useEffect, useRef, useState } from "react";
import { ImagePreview } from "./";
import InfiniteScroll from "react-infinite-scroll-component";
import Avatar from "@mui/material/Avatar";
import dayjs from "dayjs";
import axios from "axios";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import toastConfig from "../utils/toastConfig";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const ChatBody = ({ messages, updateMessages, paging, setPaging, hasMore, setHasMore, userProfile }) => {
  const { wid, cid } = useParams();
  const [isPreview, setIsPreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const messagesEndRef = useRef(null);

  const handlePreview = (imgUrl) => {
    setIsPreview(true);
    setImagePreviewUrl(imgUrl);
  };

  const fetchChannelMessages = async (wid, cid) => {
    try {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`, {
        params: { paging },
      });
      updateMessages((prev) => [
        ...prev,
        ...data.messages.map((msg) => ({
          username: msg.from.username,
          avatarURL: msg.from.avatarURL,
          time: msg.createdAt,
          text: msg.content,
          type: msg.type,
        })),
      ]);

      if (data.nextPaging) {
        setPaging(data.nextPaging);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage, toastConfig);
    }
  };

  useEffect(() => {
    socket.on("message", (data) => {
      if (data.message.username !== userProfile.username || data.message.type !== "text") {
        updateMessages((prev) => [data.message, ...prev]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
    return () => {
      socket.off("message");
    };
  }, [userProfile]);
  return (
    <>
      <div
        id="message-container"
        className="w-full h-full flex-grow flex flex-col-reverse px-3 overflow-y-scroll bg-dark-gray-background scrollbar-chatbody">
        <div ref={messagesEndRef} />
        <InfiniteScroll
          dataLength={messages.length}
          next={() => {
            fetchChannelMessages(wid, cid);
          }}
          style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={hasMore}
          scrollableTarget="message-container">
          {messages.length > 0 &&
            messages.map((msg, idx) => (
              <div className="w-full flex items-start" key={idx}>
                <Avatar src={IMG_ROUTE + msg.avatarURL} />
                <div className="w-full px-4 py-2 mx-3 mb-3 bg-light-color-blue-background rounded-md" key={idx}>
                  <p className="text-md font-bold opacity-70 mb-2">
                    {msg.username}{" "}
                    <span className="text-secondary text-sm font-normal">{dayjs(msg.time).format("HH:mm a")}</span>
                  </p>
                  {["text", "system"].includes(msg.type) && <p className="break-all">{msg.text}</p>}
                  {msg.type === "image" && (
                    <img
                      src={msg.text}
                      alt=""
                      className="h-[200px] mt-2 cursor-pointer"
                      onClick={() => handlePreview(msg.text)}
                    />
                  )}
                </div>
              </div>
            ))}
        </InfiniteScroll>
      </div>
      {isPreview && (
        <ImagePreview
          imagePreviewUrl={imagePreviewUrl}
          setImagePreviewUrl={setImagePreviewUrl}
          setIsPreview={setIsPreview}
        />
      )}
    </>
  );
};

export default ChatBody;
