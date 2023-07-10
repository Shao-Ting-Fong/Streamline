import { useEffect, useRef, useState } from "react";
import { BiSolidVideo } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosAddCircle, IoMdSend, IoIosCloseCircle } from "react-icons/io";
import Cookies from "universal-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChatBody, VideoChat } from "./";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const cookies = new Cookies();

const Conversation = ({ currChannel, showMembers, setShowMembers, userProfile, members }) => {
  const { wid, cid } = useParams();
  const token = cookies.get("jwtToken");
  const [newMsg, setNewMsg] = useState("");
  const [paging, setPaging] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [messages, updateMessages] = useState([]);
  const [isStreaming, setStreaming] = useState(false);
  const [fileDataURL, setFileDataURL] = useState(null);
  const imageRef = useRef();

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

    setHasMore(true);
    setPaging(1);
    getChannelMessagesById(wid, cid);
  }, [cid]);

  const handlePreview = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        setFileDataURL(e.target.result);
      };
    }
  };

  const cancelUpload = (e) => {
    imageRef.current.value = null;
    setFileDataURL(null);
  };

  const sendMessage = async (evt) => {
    evt.preventDefault();

    const formData = new FormData();
    const message = evt.target.message.value;
    const file = evt.target.file.files[0];

    if (message || file) {
      formData.append("message", evt.target.message.value);
      formData.append("file", evt.target.file.files[0]);
      formData.append("from", token);
      formData.append("to", JSON.stringify({ workspace: wid, type: "team", id: currChannel._id }));
      const { data } = await axios.post(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`, formData);
      // console.log("Send Message", data);
      // updateMessages((prev) => [...prev, data.msg]);
      setNewMsg("");
      evt.target.reset();
      setFileDataURL(null);
    } else {
      console.log("Don't send empty message!");
    }
  };

  const channelTitle =
    members &&
    members
      .filter((member) => member.username !== userProfile.username)
      .map((member) => member.username)
      .join();

  return (
    <>
      <div className="h-screen">
        <div className={`w-full ${isStreaming ? "h-1/2" : "h-0 translate-y-0"} ease-in-out duration-500`}>
          {isStreaming && <VideoChat setStreaming={setStreaming} userProfile={userProfile} />}
        </div>

        <div className={`${isStreaming ? "h-1/2" : "h-full"} w-auto flex flex-col`}>
          <div
            className="h-[50px] shrink-0 w-full bg-dark-gray-background border-b border-dark-gray-navbar flex items-center pl-4 pr-6"
            style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
            <h3 className="text-lg text-white">
              {currChannel.category === "direct" ? channelTitle : currChannel.title}
            </h3>
            <div className="ml-auto">
              <button onClick={() => setStreaming((prev) => !prev)}>
                <BiSolidVideo
                  className={`text-2xl inline-block align-bottom ${
                    isStreaming ? "fill-light-color-azure" : "fill-light-color-blue-background"
                  }`}
                />
              </button>
              <button className="ml-4" onClick={() => setShowMembers((prev) => !prev)}>
                <BsFillPeopleFill
                  className={`text-2xl inline-block align-bottom ${
                    showMembers ? "fill-light-color-azure" : "fill-light-color-blue-background"
                  }`}
                />
              </button>
            </div>
          </div>
          <ChatBody
            messages={messages}
            updateMessages={updateMessages}
            paging={paging}
            setPaging={setPaging}
            hasMore={hasMore}
            setHasMore={setHasMore}
          />
          <form method="post" encType="multipart/form-data" onSubmit={sendMessage}>
            <div
              className={`h-[210px] w-full bg-dark-gray-background border-t border-dark-gray-navbar flex items-center px-3 shrink-0 ${
                !fileDataURL && "hidden"
              }`}>
              <div className="rounded-lg relative p-2">
                <label htmlFor="reset">
                  <IoIosCloseCircle
                    className="absolute right-0 top-0 text-xl translate-x-1/2 -translate-y-1/2 cursor-pointer fill-light-color-blue-background hover:fill-white"
                    onClick={cancelUpload}
                  />
                </label>

                <img src={fileDataURL} alt="File Preview" className="h-40 " />
              </div>
            </div>
            <div
              className="h-[62px] w-full bg-dark-gray-background flex items-center shrink-0"
              style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
              <div className="w-full h-full flex items-center mx-3">
                <input
                  className="hidden"
                  type="file"
                  id="fileInput"
                  name="file"
                  accept="image/*"
                  ref={imageRef}
                  onChange={handlePreview}
                />
                <label htmlFor="fileInput">
                  <IoIosAddCircle className="text-2xl inline-block align-bottom fill-light-color-blue-background hover:fill-white" />
                </label>

                <input
                  className="bg-light-color-blue-background w-full h-1/2 ml-3 ps-5 rounded-full focus:outline-none"
                  name="message"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button className="ml-3">
                  <IoMdSend className="text-2xl inline-block align-bottom fill-light-color-blue-background hover:fill-white" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Conversation;
