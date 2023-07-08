import UiTemplate from "../assets/uiTemplate.png";
import MainPage from "../assets/MainPage.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import Cookies from "universal-cookie";
import Navbar from "./Navbar";
import Footer from "./Footer";

const cookies = new Cookies();

const Home = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;

  // if (authToken) navigate("/workspace");

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const inviteURL = evt.target.inviteURL.value;

    if (!authToken) {
      navigate("/auth", { state: { inviteURL } });
      return;
    }

    const { data } = await axios.get(inviteURL, {
      headers: {
        Authorization: authString,
      },
    });

    navigate(`/workspace/${data.workspaceId}/channel`);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-dark-color-blue-background flex flex-col justify-between ">
        <Navbar userProfile={userProfile} setUserProfile={setUserProfile} />
        <main className="w-full h-full relative">
          <header className="absolute top-[25%] left-[8%] w-[500px] ">
            <h1 className="text-light-color-blue text-[64px] font-bold leading-tight">Slack Clone</h1>
            <h2 className="text-white text-[64px] font-bold leading-tight">Chat. Connect. Collaborate.</h2>
            <h2 className="text-light-color-gray mt-2 ml-1">
              The all-in-one chat app for seamless team communication, collaboration, and video meetings.
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 w-full flex">
              <input
                className="bg-transparent text-white border h-[48px] grow rounded-xl pl-4 focus:outline-none"
                type="text"
                name="inviteURL"
                placeholder="Workspace invite link"
              />
              <button className="bg-light-color-azure text-white ml-3 px-4 py-2 rounded-xl ">Join Now!</button>
            </form>
            <p className="text-light-color-gray mt-4">
              Already a member?{" "}
              <a className="font-bold" href="/workspace">
                Go to Workspace
              </a>
            </p>
          </header>
          <img className="z-10 absolute left-1/2 top-[10%] w-1/2 shadow-2xl" src={MainPage} alt="" />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
