import { useState } from "react";
import { AddChannel } from "../assets";
import { CreateChannel } from "./";

const TeamChannelList = ({ type, userProfile, setTeamChannels }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleClickOpen = () => {
    setIsCreating(true);
  };

  return (
    <>
      <div className="team-channel-list">
        <div className="team-channel-list__header">
          <p className="team-channel-list__header__title">
            {type === "team" ? "Channels" : "Direct Messages"}
          </p>
          {type === "team" && (
            <button onClick={handleClickOpen}>
              <AddChannel type={type} />
            </button>
          )}
        </div>
      </div>
      <CreateChannel
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        userProfile={userProfile}
        setTeamChannels={setTeamChannels}
      />
    </>
  );
};

export default TeamChannelList;
