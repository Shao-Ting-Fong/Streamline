import { useEffect, useState } from "react";
import { BiSolidVideo } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosAddCircle, IoMdSend, IoIosCloseCircle } from "react-icons/io";
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
  showMembers,
  setShowMembers,
  userProfile,
}) => {
  const { wid, cid } = useParams();
  const token = cookies.get("jwtToken");
  const [newMsg, setNewMsg] = useState("");
  const [isStreaming, setStreaming] = useState(false);
  // const [uploadFile, setUploadFile] = useState(false);
  const [fileDataURL, setFileDataURL] = useState(null);

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("message", data);
      updateMessages((prev) => [...prev, data.message]);
    });
    return () => {
      socket.off("message");
    };
  }, []);

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
    console.log(e.target);
    // setFileDataURL(null);
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
      formData.append(
        "to",
        JSON.stringify({ workspace: wid, type: "team", id: currChannel._id })
      );
      const { data } = await axios.post(
        `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`,
        formData
      );
      // console.log("Send Message", data);
      // updateMessages((prev) => [...prev, data.msg]);
      setNewMsg("");
      setFileDataURL(null);
    } else {
      console.log("Don't send empty message!");
    }
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
                <BiSolidVideo
                  className={`text-2xl inline-block align-bottom ${
                    isStreaming ? "fill-[#005fff]" : ""
                  }`}
                />
              </button>
              <button
                className="ml-4"
                onClick={() => setShowMembers((prev) => !prev)}>
                <BsFillPeopleFill
                  className={`text-2xl inline-block align-bottom ${
                    showMembers ? "fill-[#005fff]" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          <ChatBody messages={messages} />
          <form
            method="post"
            encType="multipart/form-data"
            onSubmit={sendMessage}>
            <div
              className={`h-[200px] w-full bg-[#F8FAFF] border-t flex items-center px-3 shrink-0 ${
                !fileDataURL && "hidden"
              }`}>
              <div className="border rounded-lg relative p-2">
                <label htmlFor="reset">
                  <IoIosCloseCircle
                    className="absolute right-0 top-0 text-xl translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={cancelUpload}
                  />
                </label>

                <img src={fileDataURL} alt="File Preview" className="h-40 " />
              </div>
            </div>
            <div
              className="h-[62px] w-full bg-[#F8FAFF] flex items-center shrink-0"
              style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
              <div className="w-full h-full flex items-center mx-3">
                <input
                  className="hidden"
                  type="file"
                  id="fileInput"
                  name="file"
                  accept="image/*"
                  // value={uploadFile}
                  onChange={handlePreview}
                />
                <label htmlFor="fileInput">
                  <IoIosAddCircle className="text-2xl inline-block align-bottom hover:fill-[#005fff]" />
                </label>

                <input
                  className="bg-gray-200 w-full h-1/2 ml-3 ps-5 rounded-full focus:outline-none"
                  name="message"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button className="ml-3">
                  <IoMdSend className="text-2xl inline-block align-bottom hover:fill-[#005fff]" />
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
