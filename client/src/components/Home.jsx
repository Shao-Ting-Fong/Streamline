import { BiLogoGithub, BiLogoLinkedinSquare } from "react-icons/bi";
import UiTemplate from "../assets/uiTemplate.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const Home = () => {
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

  const logout = () => {
    cookies.remove("jwtToken", { path: "/" });
    window.location.href = "/";
  };

  return (
    <>
      <div className="w-full h-full max-w-screen max-h-screen bg-dark-color-blue-background flex flex-col justify-between ">
        <nav className="h-[56px] w-full bg-dark-color-blue-header flex items-center px-28">
          <h1 className="text-white text-2xl font-bold">Slack Clone</h1>
          <div className="ml-auto flex">
            <div className=" p-1">
              <a href="https://www.linkedin.com/in/shaotingfong">
                <BiLogoLinkedinSquare className="inline-block align-middle text-3xl text-light-color-gray" />
              </a>
            </div>
            <div className=" p-1 ml-3">
              <a href="https://github.com/Shao-Ting-Fong/SlackClone">
                <BiLogoGithub className="inline-block align-middle text-3xl text-light-color-gray" />
              </a>
            </div>
            {authToken ? (
              <button className="text-lg text-light-color-gray ml-8" onClick={logout}>
                Logout
              </button>
            ) : (
              // <Link to={`auth`}>
              <button
                className="text-lg text-light-color-gray ml-8"
                onClick={() => {
                  navigate("/auth");
                }}>
                Signup / Login
              </button>
              // </Link>
            )}
          </div>
        </nav>
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
          <div
            className="z-10 absolute left-[50%] h-5/6 w-1/2 bg-white bg-cover rounded-lg"
            style={{ backgroundImage: `url(${UiTemplate})` }}></div>
        </main>

        <footer className="w-full text-center mb-3 text-light-color-gray text-sm">
          &copy; Appworks School Batch #20 Backend Class. Hosted by Shao-Ting Fong.
        </footer>
      </div>
    </>
  );
};

export default Home;
