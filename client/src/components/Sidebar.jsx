import { Outlet, useParams, Link, useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { BadgeAvatar } from "./";
import { socket } from "../socket";
import { toast } from "react-toastify";
import { FiLogOut } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateWorkspace from "./CreateWorkspace";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;

const Sidebar = ({ userProfile, setUserProfile, channelUnread, setChannelUnread }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const navigate = useNavigate();
  const { wid } = useParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        if (authToken) {
          const { data } = await axios.get(`${API_ROUTE}/auth/profile`, {
            headers: {
              Authorization: authString,
            },
          });

          socket.emit("online", { userId: data._id });

          socket.on("notification", async ({ to }) => {
            const { data } = await axios.get(`${API_ROUTE}/chat/channel/${to}`, {
              headers: {
                Authorization: authString,
              },
            });

            setChannelUnread((status) => {
              status[to] = {
                workspaceId: data.workspaceId,
                unread: true,
              };
              return { ...status };
            });
          });

          setUserProfile(data);
        }
      } catch (error) {
        const errorMessage = error.response ? error.response.data.errors : error.message;
        toast.error(errorMessage);
        if (error.response.status === 404) {
          cookies.remove("jwtToken", { path: "/" });
          return navigate("/auth");
        }
      }
    };

    getUserProfile();

    return () => {
      socket.off("notification");
    };
  }, [authToken]);

  useEffect(() => {
    const getWorkspaces = async () => {
      try {
        if (!authToken) {
          toast.error("Log in to continue.");
          return navigate("/auth");
        }
        const { data } = await axios.get(`${API_ROUTE}/chat/workspace`, {
          headers: {
            Authorization: authString,
          },
        });
        setWorkspaces(data);
      } catch (error) {
        const errorMessage = error.response ? error.response.data.errors : error.message;
        toast.error(errorMessage);
        if (error.response.status === 404) {
          cookies.remove("jwtToken", { path: "/" });
          return navigate("/auth");
        }
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
    toast.success("Bye~👋");
    navigate("/");
  };

  const hasUnread = (workspaceId, currWorkspace) => {
    return Object.values(channelUnread).some(
      (ele) => ele.workspaceId !== currWorkspace && ele.workspaceId === workspaceId && ele.unread
    );
  };

  return (
    <>
      <div className="channel-list__sidebar">
        <div className="overflow-y-scroll scrollbar">
          {workspaces.length > 0 &&
            workspaces.map((workspace) => (
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
        </div>
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
