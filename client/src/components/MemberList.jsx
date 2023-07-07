import { BadgeAvatar } from "./";
import { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import MemberProfileCard from "./MemberProfileCard";
import { socket } from "../socket";

const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const MemberList = ({ members, setMembers, userProfile }) => {
  const [memberClicked, setMemberClicked] = useState({
    anchorEl: null,
    member: null,
  });

  // useEffect(() => {
  //   socket.on("onlineState", ({ userId, state }) => {
  //     console.log("Online state changed. userId:", userId);
  //     setMembers((prevMembers) => {
  //       const idxOfMember = prevMembers.findIndex((member) => member._id === userId);
  //       if (idxOfMember !== -1) {
  //         prevMembers[idxOfMember].online = state;
  //       }
  //       return [...prevMembers];
  //     });
  //   });

  //   return () => {
  //     socket.off("onlineState");
  //   };
  // }, []);

  const handleClick = (event, member) => {
    // console.log(memberClicked);
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
          className="h-[62px] w-full bg-[#F8FAFF] flex items-center pl-3 pr-6 border-0"
          style={{ boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)" }}>
          <h3 className="text-lg">Members</h3>
        </div>
        <div className="h-full border overflow-y-scroll">
          {members
            .filter((member) => member.online === "1" && member._id !== userProfile._id)
            .map((member) => (
              <div
                key={member._id}
                className="flex items-center m-4 cursor-pointer"
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
                className="flex items-center m-4 cursor-pointer opacity-50"
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
          <div className="flex items-center m-4">
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
