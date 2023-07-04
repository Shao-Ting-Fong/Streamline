import { Outlet, useParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { BadgeAvatar } from "./";
import LogoutIcon from "../assets/logout.png";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const Sidebar = ({ userProfile, setUserProfile, channelUnread }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const navigate = useNavigate();
  const { wid } = useParams();
  const [workspaces, setWorkspaces] = useState([]);

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
  }, [authToken]);

  const logout = () => {
    cookies.remove("jwtToken");
    setUserProfile({});
    window.location.href = "/";
  };

  const hasUnread = (wid) => {
    // console.log(Object.values(channelUnread));
    return Object.values(channelUnread).some((ele) => ele.workspaceId !== wid && ele.unread);
  };

  return (
    <>
      <div className="channel-list__sidebar">
        {workspaces.map((workspace) => (
          <Link to={`${workspace._id}/channel`} key={workspace._id}>
            <div className="channel-list__sidebar__icon">
              <div className="icon__inner">
                <BadgeAvatar
                  imgUrl={API_ROUTE + workspace.avatarURL}
                  position={{ vertical: "top", horizontal: "right" }}
                  showState={hasUnread(wid)}
                  stateColor={"#CC3333"}
                />
              </div>
            </div>
          </Link>
        ))}
        <div className="channel-list__sidebar__icon mt-auto">
          <Tooltip title={<h1 className="text-sm">{userProfile.username}</h1>} placement="right" arrow>
            <div className="icon__inner cursor-default">
              <img src={API_ROUTE + userProfile.avatarURL} alt="Profile" width="35" />
            </div>
          </Tooltip>
        </div>
        <div className="channel-list__sidebar__icon">
          <div className="icon__inner" onClick={logout}>
            <img src={LogoutIcon} alt="Logout" width="30" />
          </div>
        </div>
      </div>

      <Outlet />
    </>
  );
};

export default Sidebar;
