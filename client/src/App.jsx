import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./socket";
import axios from "axios";
import Cookies from "universal-cookie";
import "./App.css";

import {
  Sidebar,
  ChannelContainer,
  ChannelListContainer,
  Home,
  Auth,
  CreateChannel,
} from "./components";

const cookies = new Cookies();

const authToken = cookies.get("jwtToken");
const authString = `Bearer ${authToken}`;

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

function App() {
  const [userProfile, setUserProfile] = useState({});
  const [notifications, setNotification] = useState({});

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
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      if (authToken) {
        const { data } = await axios.get(`${API_ROUTE}/auth/profile`, {
          headers: {
            Authorization: authString,
          },
        });

        // socket.on(`userId:${userProfile._id}`, ({ from, to, msg }) => {
        //   setNotification((notes) => {
        //     notes[to] = true;
        //     return;
        //   });
        // });
        setUserProfile(data);
      }
    };

    getUserProfile();
  }, [authToken]);

  useEffect(() => {
    socket.on(`userId:${userProfile._id}`, ({ from, to, msg }) => {
      setNotification((notes) => {
        notes[to] = true;
        return;
      });
    });
  }, []);

  if (!authToken) return <Auth />;

  return (
    <>
      <div className="app__wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="workspace"
            element={
              <Sidebar
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            }>
            <Route
              path=":wid/channel"
              element={<ChannelListContainer userProfile={userProfile} />}>
              <Route
                path=":cid/room"
                element={<ChannelContainer userProfile={userProfile} />}
              />
              <Route path="new" element={<CreateChannel />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
