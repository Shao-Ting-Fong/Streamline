import { TeamChannelList, TeamChannelPreview, DirectMessagePreview } from "./";
import { useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { Outlet, useParams } from "react-router-dom";

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
  userProfile,
  channelUnread,
  setChannelUnread,
}) => {
  const { wid, cid } = useParams();
  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  // const [hasUnread, setUnread] = useState({});

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
  }, []);

  return (
    <>
      <div className="channel-list__container">
        <div className="channel-list__list__wrapper">
          <CompanyHeader />
          {/* <ChannelSearch /> */}
          <TeamChannelList type="team" />
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
            <TeamChannelList type="messaging" />
            {directMessages.map((member) => (
              <DirectMessagePreview key={member._id} member={member} />
            ))}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};
export default ChannelListContainer;
