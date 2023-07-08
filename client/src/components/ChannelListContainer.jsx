import { TeamChannelList, TeamChannelPreview, DirectMessagePreview } from "./";
import { BiSolidShareAlt, BiCheck } from "react-icons/bi";
import Tooltip from "@mui/material/Tooltip";
import { useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { Outlet, useParams } from "react-router-dom";

import { useState } from "react";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const CompanyHeader = ({ wid, workspaceTitle }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyInviteURL = () => {
    const inviteURL = `${API_ROUTE}/chat/workspace/${wid}/invite`;
    navigator.clipboard.writeText(inviteURL);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="h-[50px] border-b border-dark-gray-navbar flex items-center pl-4">
      <p className="text-xl font-bold text-white truncate">{workspaceTitle}</p>
      <Tooltip title={<h1 className="text-sm">{isCopied ? "Copied!" : "Invitation Link"}</h1>} placement="right" arrow>
        <div className="ml-auto mr-3">
          {isCopied ? (
            <BiCheck className=" inline-block align-bottom text-xl text-success-color" />
          ) : (
            <BiSolidShareAlt className="inline-block align-bottom text-xl text-white" onClick={copyInviteURL} />
          )}
        </div>
      </Tooltip>
    </div>
  );
};

const ChannelListContainer = ({ channelUnread, setChannelUnread, userProfile }) => {
  const authToken = cookies.get("jwtToken");
  const { wid } = useParams();
  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [workspaceTitle, setWorkspaceTitle] = useState("");

  useEffect(() => {
    const authString = `Bearer ${authToken}`;
    const getChannels = async (workspaceId) => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${workspaceId}/channel`, {
        headers: {
          Authorization: authString,
        },
      });

      setWorkspaceTitle(data[0]?.workspaceId?.title);
      setTeamChannels(data.filter((ele) => ele.category !== "direct"));
      setDirectMessages(data.filter((ele) => ele.category === "direct"));
    };
    getChannels(wid);
  }, [teamChannels]);

  return (
    <>
      <div className="channel-list__container">
        <div className="channel-list__list__wrapper">
          <CompanyHeader wid={wid} workspaceTitle={workspaceTitle} />
          <div className="mt-4">
            <TeamChannelList type="team" userProfile={userProfile} setTeamChannels={setTeamChannels} />
            <div className="mt-2">
              {teamChannels.map((channel) => (
                <TeamChannelPreview
                  key={channel._id}
                  channel={channel}
                  channelUnread={channelUnread}
                  setChannelUnread={setChannelUnread}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <TeamChannelList type="messaging" userProfile={userProfile} />
            <div className="mt-2">
              {directMessages.map((channel) => (
                <DirectMessagePreview
                  key={channel._id}
                  channel={channel}
                  channelUnread={channelUnread}
                  setChannelUnread={setChannelUnread}
                  userProfile={userProfile}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};
export default ChannelListContainer;
