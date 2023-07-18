import { BadgeAvatar } from "./";
import { useState } from "react";
import Popover from "@mui/material/Popover";
import MemberProfileCard from "./MemberProfileCard";

const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const MemberList = ({ members, userProfile }) => {
  const [memberClicked, setMemberClicked] = useState({
    anchorEl: null,
    member: null,
  });

  const handleClick = (event, member) => {
    setMemberClicked({ anchorEl: event.currentTarget, member });
  };

  const handleClose = () => {
    setMemberClicked({ anchorEl: null, member: null });
  };

  const open = Boolean(memberClicked.anchorEl);
  const id = open ? "member-popover" : undefined;

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className="h-[50px] w-full bg-dark-gray-sidebar border-b border-dark-gray-navbar shrink-0 flex items-center pl-3 pr-6 border-0"
          style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
          <h3 className="text-lg text-white">Members</h3>
        </div>
        <div className="h-full overflow-y-scroll scrollbar bg-dark-gray-sidebar text-white">
          {members
            .filter((member) => member.online === "1" && member._id !== userProfile._id)
            .map((member) => (
              <div
                key={member._id}
                className=" w-full flex items-center p-2 mx-2 cursor-pointer hover:bg-dark-gray-sidebar-hover"
                onClick={(e) => handleClick(e, member)}>
                <BadgeAvatar
                  imgUrl={IMG_ROUTE + member.avatarURL}
                  position={{ vertical: "bottom", horizontal: "right" }}
                  showState={true}
                  stateColor={"#44b700"}
                />
                <p className="ml-4">{member.username}</p>
              </div>
            ))}
          {members
            .filter((member) => member.online === "0" && member._id !== userProfile._id)
            .map((member) => (
              <div
                key={member._id}
                className=" w-full flex items-center p-2 mx-2 cursor-pointer hover:bg-dark-gray-sidebar-hover opacity-50"
                onClick={(e) => handleClick(e, member)}>
                <BadgeAvatar
                  imgUrl={IMG_ROUTE + member.avatarURL}
                  position={{ vertical: "bottom", horizontal: "right" }}
                  showState={true}
                  stateColor={"#808D9A"}
                />
                <p className="ml-4">{member.username}</p>
              </div>
            ))}
          <div className="w-full flex items-center p-2 mx-2 hover:bg-dark-gray-sidebar-hover">
            <BadgeAvatar
              imgUrl={IMG_ROUTE + userProfile.avatarURL}
              position={{ vertical: "bottom", horizontal: "right" }}
              showState={true}
              stateColor={"#44b700"}
            />
            <p className="ml-4">{`${userProfile.username} (Me)`}</p>
          </div>
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
