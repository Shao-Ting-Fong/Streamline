import { Outlet } from "react-router-dom";
import { BadgeAvatar } from "./";
import LogoutIcon from "../assets/logout.png";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const cookies = new Cookies();

const authToken = cookies.get("jwtToken");
const authString = `Bearer ${authToken}`;

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const Sidebar = ({ userProfile, setUserProfile, channelUnread }) => {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const getWorkspaces = async () => {
      try {
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

  const hasUnread = (wid) =>
    Object.values(channelUnread).some((ele) => ele.workspaceId === wid);

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
                  showState={() => hasUnread(workspace._id)}
                  stateColor={"#44b700"}
                />
              </div>
            </div>
          </Link>
        ))}
        <div className="channel-list__sidebar__icon mt-auto">
          <div className="icon__inner">
            <img
              src={API_ROUTE + userProfile.avatarURL}
              alt="Profile"
              width="30"
            />
          </div>
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
