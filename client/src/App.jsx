import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./socket";
import axios from "axios";
import Cookies from "universal-cookie";
import "./App.css";

import { Sidebar, ChannelContainer, ChannelListContainer, Home, Auth } from "./components";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

function App() {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const [userProfile, setUserProfile] = useState({});
  const [channelUnread, setChannelUnread] = useState({});

  useEffect(() => {
    function onConnect() {
      console.log("Connected.");
    }

    function onDisconnect() {
      console.log("Disconnected.");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    const cleanup = () => {
      console.log("cleanup");
      console.log(userProfile._id);
      if (userProfile._id) {
        console.log("before emit offline");
        socket.emit("offline", { userId: userProfile._id });
        console.log("after emit offline");
      }
    };
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [authToken, userProfile]);

  useEffect(() => {
    const getUserProfile = async () => {
      if (authToken) {
        const { data } = await axios.get(`${API_ROUTE}/auth/profile`, {
          headers: {
            Authorization: authString,
          },
        });

        socket.emit("online", { userId: data._id });

        socket.on("notification", async ({ to }) => {
          console.log(`Get Unread meassage to ${to}`);
          const { data } = await axios.get(`${API_ROUTE}/chat/channel/${to}`);

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
    };

    getUserProfile();

    return () => {
      socket.off("notification");
    };
  }, [authToken]);

  console.log(userProfile._id);

  return (
    <>
      <div className="flex w-screen flex-1 h-full bg-dark-gray-background shadow-black shadow">
        <Routes>
          <Route path="/" element={<Home userProfile={userProfile} setUserProfile={setUserProfile} />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="workspace"
            element={
              <Sidebar userProfile={userProfile} setUserProfile={setUserProfile} channelUnread={channelUnread} />
            }>
            <Route
              path=":wid/channel"
              element={
                <ChannelListContainer
                  channelUnread={channelUnread}
                  setChannelUnread={setChannelUnread}
                  userProfile={userProfile}
                />
              }>
              <Route path=":cid/room" element={<ChannelContainer userProfile={userProfile} />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
