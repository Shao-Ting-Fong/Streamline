import { Outlet, useParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { BadgeAvatar } from "./";
import { socket } from "../socket";
import LogoutIcon from "../assets/logout.png";
import { FiLogOut } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";

import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CreateWorkspace from "./CreateWorkspace";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const Sidebar = ({ userProfile, setUserProfile, channelUnread }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const navigate = useNavigate();
  const { wid } = useParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  useEffect(() => {
    const getWorkspaces = async () => {
      try {
        if (!authToken) navigate("/auth");
        const { data } = await axios.get(`${API_ROUTE}/chat/workspace`, {
          headers: {
            Authorization: authString,
          },
        });
        setWorkspaces(data);
      } catch (error) {
        console.error(error);
      }
    };

    getWorkspaces();
  }, [authToken, wid]);

  const handleClickOpen = () => {
    setIsCreatingWorkspace(true);
  };

  const logout = () => {
    cookies.remove("jwtToken", { path: "/" });
    socket.emit("offline", { userId: userProfile._id });
    setUserProfile({});
    window.location.href = "/";
  };

  const hasUnread = (workspaceId, currWorksapce) => {
    return Object.values(channelUnread).some(
      (ele) => ele.workspaceId !== currWorksapce && ele.workspaceId === workspaceId && ele.unread
    );
  };

  return (
    <>
      <div className="channel-list__sidebar">
        {workspaces.map((workspace) => (
          <Link to={`${workspace._id}/channel`} key={workspace._id}>
            <div className="channel-list__sidebar__icon">
              <Tooltip
                key={workspace._id}
                title={<h1 className="text-sm">{workspace.title}</h1>}
                placement="right"
                arrow>
                <div className="icon__inner">
                  <BadgeAvatar
                    imgUrl={IMG_ROUTE + workspace.avatarURL}
                    position={{ vertical: "top", horizontal: "right" }}
                    showState={hasUnread(workspace._id, wid)}
                    stateColor={"#CC3333"}
                  />
                </div>
              </Tooltip>
            </div>
          </Link>
        ))}
        <div className="channel-list__sidebar__icon" onClick={handleClickOpen}>
          <Tooltip title={<h1 className="text-sm">Add Workspace</h1>} placement="right" arrow>
            <div className="icon__inner">
              <AiOutlinePlus className="text-xl text-light-color-blue" />
            </div>
          </Tooltip>
        </div>
        <div className="channel-list__sidebar__icon mt-auto">
          <Tooltip title={<h1 className="text-sm">{userProfile.username}</h1>} placement="right" arrow>
            <div className="icon__inner cursor-default">
              <img src={IMG_ROUTE + userProfile.avatarURL} alt="Profile" width="35" />
            </div>
          </Tooltip>
        </div>
        <div className="channel-list__sidebar__icon">
          <Tooltip title={<h1 className="text-sm">Logout</h1>} placement="right" arrow>
            <div className="icon__inner" onClick={logout}>
              <FiLogOut className="text-2xl text-light-color-blue" />
            </div>
          </Tooltip>
        </div>
      </div>
      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        userProfile={userProfile}
      />

      <Outlet />
    </>
  );
};

export default Sidebar;
