import MainPage from "../assets/MainPage.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import Navbar from "./Navbar";
import Footer from "./Footer";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const Home = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      const inviteURL = evt.target.inviteURL.value;

      /* eslint-disable no-useless-escape */
      // prettier-ignore
      const pattern = new RegExp(`^${API_ROUTE.replace("/", "\/")}\/chat\/workspace\/([0-9a-fA-F]{24})\/invite$`);
      if (!inviteURL.match(pattern)) {
        throw new Error("Invalid invitation link.");
      }
      if (!authToken) {
        toast.error("Log in to continue.");
        navigate("/auth", { state: { inviteURL } });
        return;
      }

      const { data } = await axios.get(inviteURL, {
        headers: {
          Authorization: authString,
        },
      });

      navigate(`/workspace/${data.workspaceId}/channel`);
      toast.success("Workspace joined in successfully!");
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-dark-color-blue-background flex flex-col justify-between ">
        <Navbar userProfile={userProfile} setUserProfile={setUserProfile} />
        <main className="w-full h-full relative">
          <header className="absolute top-[25%] left-[8%] w-[500px] ">
            <h1 className="text-light-color-blue text-[64px] font-bold leading-tight">Streamline</h1>
            <h2 className="text-white text-[64px] font-bold leading-tight">Chat. Connect. Collaborate.</h2>
            <h2 className="text-light-color-gray mt-2">
              The all-in-one chat app for seamless team communication, collaboration, and video meetings.
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 w-full flex" autoComplete="off">
              <input
                className="bg-transparent text-white border h-[48px] grow rounded-xl pl-4 focus:outline-none"
                type="text"
                name="inviteURL"
                placeholder="Invitation Link"
              />
              <button className="bg-light-color-azure text-white ml-3 px-4 py-2 rounded-xl ">Join Now!</button>
            </form>
            <p className="text-light-color-gray mt-4 inline-flex">
              Already a member?
              <Link to={authToken ? "/workspace" : "/auth"}>
                <span className="ml-2 font-bold">Go to Workspace</span>
              </Link>
            </p>
          </header>
          {/* <div className=""></div> */}
          <div className="z-10 absolute left-[47%] top-[10%] w-[53%] shadow-2xl">
            <img className="w-full" src={MainPage} alt="" />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
