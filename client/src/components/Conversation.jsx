import { useEffect, useRef, useState } from "react";
import { BiSolidVideo } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosAddCircle, IoMdSend, IoIosCloseCircle } from "react-icons/io";
import Cookies from "universal-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChatBody, VideoChat } from "./";
import Loading from "../assets/Loading";
import { toast } from "react-toastify";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const cookies = new Cookies();

const MAX_IMG_SIZE = 5 * 1000 * 1000;

const Conversation = ({ currChannel, showMembers, setShowMembers, userProfile, members }) => {
  const { wid, cid } = useParams();
  const token = cookies.get("jwtToken");
  const authString = `Bearer ${token}`;
  const [newMsg, setNewMsg] = useState("");
  const [paging, setPaging] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [messages, updateMessages] = useState([]);
  const [isStreaming, setStreaming] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileDataURL, setFileDataURL] = useState(null);
  const imageRef = useRef();

  useEffect(() => {
    const getChannelMessagesById = async (wid, cid) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`, {
        headers: { Authorization: authString },
      });
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
    try {
      setHasMore(true);
      setPaging(1);
      getChannelMessagesById(wid, cid);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }
  }, [cid, token]);

  const handleVideoButtonClicked = () => {
    setStreaming((prev) => !prev);
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > MAX_IMG_SIZE) {
        toast.error("Image size should be less than 5MB!");
        cancelUpload();
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        setFileDataURL(e.target.result);
      };
    }
  };

  const cancelUpload = () => {
    imageRef.current.value = null;
    setFileDataURL(null);
  };

  const sendMessage = async (evt) => {
    try {
      evt.preventDefault();
      setNewMsg("");

      const formData = new FormData();
      const message = evt.target.message.value.trim();
      const file = evt.target.file.files[0];

      if (!message && !file) {
        console.log("Don't send empty message!");
        return;
      }

      if (message) {
        updateMessages((prev) => [
          {
            username: userProfile.username,
            avatarURL: userProfile.avatarURL,
            time: Date.now(),
            text: message,
            type: "text",
          },
          ...prev,
        ]);
      }

      setIsDisabled(true);
      setIsLoading(true);

      formData.append("message", evt.target.message.value);
      formData.append("file", evt.target.file.files[0]);
      formData.append("from", token);
      formData.append("to", JSON.stringify({ workspace: wid, type: "team", id: currChannel._id }));
      await axios.post(`${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`, formData, {
        headers: { Authorization: authString },
      });

      evt.target.reset();
      setFileDataURL(null);
      setIsDisabled(false);
      setIsLoading(false);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
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
      <div className="h-screen max-w-full">
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
              <button onClick={handleVideoButtonClicked}>
                <BiSolidVideo
                  className={`text-2xl inline-block align-bottom ${
                    isStreaming ? "fill-light-color-azure" : "fill-light-color-blue-background"
                  } `}
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
            userProfile={userProfile}
          />
          <form method="post" encType="multipart/form-data" onSubmit={sendMessage}>
            <div
              className={`h-[210px] w-full bg-dark-gray-background border-t border-dark-gray-navbar flex items-center px-5 shrink-0 ${
                !fileDataURL && "hidden"
              }`}>
              <div className="rounded-lg relative">
                <label htmlFor="reset">
                  <IoIosCloseCircle
                    className="absolute -right-1 -top-1 text-xl translate-x-1/2 -translate-y-1/2 cursor-pointer fill-light-color-blue-background hover:fill-white"
                    onClick={cancelUpload}
                  />
                </label>

                <img src={fileDataURL} alt="File Preview" className="h-40 " />
                {isLoading && (
                  <div className="h-full w-full absolute top-0 left-0 z-10 bg-black opacity-50 flex justify-center items-center">
                    <Loading />
                  </div>
                )}
              </div>
            </div>
            <div
              className=" w-full bg-dark-gray-background flex items-center shrink-0"
              style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
              <div className="w-full h-[50px] flex items-center m-5 px-3 bg-gray-500 bg-opacity-40 rounded-md">
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
                  className="bg-transparent w-full h-1/2 ml-4 focus:outline-none text-white"
                  autoComplete="off"
                  name="message"
                  value={newMsg}
                  placeholder="Say Something..."
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button className="ml-3" disabled={isDisabled}>
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
