import { BadgeAvatar } from "./";
import { useState } from "react";
import Popover from "@mui/material/Popover";
import MemberProfileCard from "./MemberProfileCard";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const MemberList = ({ currChannel, userProfile }) => {
  const [memberClicked, setMemberClicked] = useState({
    anchorEl: null,
    member: null,
  });

  const handleClick = (event, member) => {
    // console.log(memberClicked);
    setMemberClicked({ anchorEl: event.currentTarget, member });
  };

  const handleClose = () => {
    setMemberClicked({ anchorEl: null, member: null });
  };

  const open = Boolean(memberClicked.anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className="h-[62px] w-full bg-[#F8FAFF] flex items-center pl-3 pr-6 border-0"
          style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
          <h3 className="text-lg">Members</h3>
        </div>
        <div className="h-full border overflow-y-scroll">
          {Object.keys(currChannel).length > 0 &&
            currChannel.members
              .filter((member) => member._id !== userProfile._id)
              .map((member) => (
                <div key={member._id} className="flex items-center m-4" onClick={(e) => handleClick(e, member)}>
                  <BadgeAvatar
                    imgUrl={IMG_ROUTE + member.avatarURL}
                    position={{ vertical: "bottom", horizontal: "right" }}
                    showState={true}
                    stateColor={"#44b700"}
                  />
                  <p className="ml-4">{member.username}</p>
                </div>
              ))}
          <Popover
            id={id}
            open={open}
            anchorEl={memberClicked.anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: -16,
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transitionDuration={0}>
            <MemberProfileCard member={memberClicked.member} setMemberClicked={setMemberClicked} />
          </Popover>
        </div>
      </div>
    </>
  );
};

export default MemberList;
