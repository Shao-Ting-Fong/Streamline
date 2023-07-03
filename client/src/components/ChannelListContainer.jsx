import { TeamChannelList, TeamChannelPreview, DirectMessagePreview } from "./";
import { useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { Outlet, useOutletContext, useParams } from "react-router-dom";

import { useState } from "react";
import { socket } from "../socket";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const authToken = cookies.get("jwtToken");

const CompanyHeader = () => (
  <div className="channel-list__header">
    <p className="channel-list__header__text">Test Org.</p>
  </div>
);

const ChannelListContainer = ({
  channelUnread,
  setChannelUnread,
  userProfile,
}) => {
  const { wid } = useParams();
  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

  useEffect(() => {
    const authString = `Bearer ${authToken}`;
    const getChannels = async (workspaceId) => {
      const { data } = await axios.get(
        `${API_ROUTE}/chat/workspace/${workspaceId}/channel`,
        {
          headers: {
            Authorization: authString,
          },
        }
      );
      setTeamChannels(data.filter((ele) => ele.category !== "direct"));
      setDirectMessages(data.filter((ele) => ele.category === "direct"));
    };
    getChannels(wid);
  }, [teamChannels]);

  return (
    <>
      <div className="channel-list__container">
        <div className="channel-list__list__wrapper">
          <CompanyHeader />
          {/* <ChannelSearch /> */}
          <TeamChannelList
            type="team"
            userProfile={userProfile}
            setTeamChannels={setTeamChannels}
          />
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
