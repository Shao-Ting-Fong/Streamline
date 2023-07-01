import { Link } from "react-router-dom";

import { AddChannel } from "../assets";

const TeamChannelList = ({ type }) => {
  return (
    <div className="team-channel-list">
      <div className="team-channel-list__header">
        <p className="team-channel-list__header__title">
          {type === "team" ? "Channels" : "Direct Messages"}
        </p>
        {type === "team" && (
          <Link to="new">
            <AddChannel type={type} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default TeamChannelList;
