import { TeamChannelList, TeamChannelPreview, DirectMessagePreview, CompanyHeader } from "./";

import { useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const ChannelListContainer = ({ channelUnread, setChannelUnread, userProfile }) => {
  const navigate = useNavigate();
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const { wid } = useParams();
  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [workspaceTitle, setWorkspaceTitle] = useState("");

  useEffect(() => {
    const getChannels = async (workspaceId) => {
      try {
        const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${workspaceId}/channel`, {
          headers: {
            Authorization: authString,
          },
        });

        setWorkspaceTitle(data[0]?.workspaceId?.title);
        setTeamChannels(data.filter((ele) => ele.category !== "direct"));
        setDirectMessages(data.filter((ele) => ele.category === "direct"));
      } catch (error) {
        const errorMessage = error.response ? error.response.data.errors : error.message;
        toast.error(errorMessage);
        if (error.response.status === 403) navigate(-1);
      }
    };

    getChannels(wid);
  }, [wid, channelUnread]);

  return (
    <>
      <div className="channel-list__container scrollbar">
        <div className="channel-list__list__wrapper scrollbar">
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
