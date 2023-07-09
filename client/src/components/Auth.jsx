import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import toastConfig from "../utils/toastConfig";
import Cookies from "universal-cookie";
import axios from "axios";
import { Navbar, Footer } from "./";

const cookies = new Cookies();

const initialState = {
  username: "",
  password: "",
  confirmPassword: "",
  avatarURL: "",
  email: "",
};

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const Auth = ({ userProfile, setUserProfile }) => {
  const authToken = cookies.get("jwtToken");
  const navigate = useNavigate();
  const location = useLocation();
  const inviteURL = location?.state?.inviteURL;

  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(false);

  const handleChange = (evt) => {
    setForm({ ...form, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();

      const { data } = await axios.post(`${API_ROUTE}/auth/${isSignup ? "signup" : "login"}`, form);

      const { access_token, access_expired } = data.data;

      console.log(data.data);

      cookies.set("jwtToken", access_token, {
        // ...COOKIE_OPTIONS,
        maxAge: access_expired,
        path: "/",
      });

      const authString = `Bearer ${access_token}`;

      if (inviteURL) {
        const { data } = await axios.get(inviteURL, {
          headers: {
            Authorization: authString,
          },
        });

        navigate(`/workspace/${data.workspaceId}/channel`);
        toast.success("Workspace joined in successfully!", toastConfig);
        return;
      }

      if (data.data.user.workspaces.length > 0) {
        navigate(`/workspace/${data.data.user.workspaces[0]}/channel`);
        toast.success(`Welcome! ${data.data.user.username}`, toastConfig);
        return;
      }

      navigate("/workspace");
      toast.success(`Welcome! ${data.data.user.username}`, toastConfig);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;

      toast.error(errorMessage, toastConfig);
    }
  };

  const switchMode = () => {
    setIsSignup((prevState) => !prevState);
  };

  if (authToken) navigate("/workspace");

  return (
    <main className="w-full min-h-screen flex flex-col justify-between items-center bg-dark-color-blue-background">
      <Navbar userProfile={userProfile} setUserProfile={setUserProfile} />

      <div className="auth__form-container_fields-content">
        <p>{isSignup ? "Sign Up" : "Sign In"}</p>
        <form onSubmit={handleSubmit}>
          <div className="auth__form-container_fields-content_input">
            <label htmlFor="username">Username</label>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          </div>
          {isSignup && (
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" placeholder="abc@abc.com" onChange={handleChange} required />
            </div>
          )}
          <div className="auth__form-container_fields-content_input">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <div className="auth__form-container_fields-content_button">
            <button> {isSignup ? "Sign Up" : "Sign In"}</button>
          </div>
        </form>
        <div className="auth__form-container_fields-account">
          <p>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span onClick={switchMode}>{isSignup ? "Sign In" : "Sign Up"}</span>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Auth;
