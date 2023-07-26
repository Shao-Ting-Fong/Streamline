import { BiLogoGithub, BiLogoLinkedinSquare } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const Navbar = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const authToken = cookies.get("jwtToken");

  const logout = () => {
    cookies.remove("jwtToken", { path: "/" });
    socket.emit("offline", { userId: userProfile._id });
    setUserProfile({});
    navigate("/");
  };

  return (
    <nav className="h-[56px] w-full bg-dark-color-blue-header flex items-center px-28">
      <Link to="/">
        <h1 className="text-white text-2xl font-bold">Streamline</h1>
      </Link>

      <div className="ml-auto flex">
        <div className=" p-1">
          <a href="https://www.linkedin.com/in/shaotingfong">
            <BiLogoLinkedinSquare className="inline-block align-middle text-3xl text-light-color-gray" />
          </a>
        </div>
        <div className=" p-1 ml-3">
          <a href="https://github.com/Shao-Ting-Fong/Streamline">
            <BiLogoGithub className="inline-block align-middle text-3xl text-light-color-gray" />
          </a>
        </div>
        {authToken ? (
          <button className="text-lg text-light-color-gray ml-8" onClick={logout}>
            Logout
          </button>
        ) : (
          <button
            className="text-lg text-light-color-gray ml-8"
            onClick={() => {
              navigate("/auth");
            }}>
            Signup / Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
