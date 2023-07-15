import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import { socket } from "./socket";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { Sidebar, ChannelContainer, ChannelListContainer, Home, Auth, NotFound } from "./components";

function App() {
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

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="flex w-screen flex-1 h-full bg-dark-gray-background shadow-black shadow">
        <Routes>
          <Route path="/" element={<Home userProfile={userProfile} setUserProfile={setUserProfile} />} />
          <Route path="/auth" element={<Auth userProfile={userProfile} setUserProfile={setUserProfile} />} />
          <Route
            path="workspace"
            element={
              <Sidebar
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                channelUnread={channelUnread}
                setChannelUnread={setChannelUnread}
              />
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
          <Route path="*" element={<NotFound userProfile={userProfile} setUserProfile={setUserProfile} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
