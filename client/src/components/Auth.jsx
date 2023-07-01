import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";

import signinImage from "../assets/signup.jpg";

const cookies = new Cookies();

const initialState = {
  username: "",
  password: "",
  confirmPassword: "",
  avatarURL: "",
  email: "",
};

// const COOKIE_OPTIONS = {
//   httpOnly: true,
//   path: "/",
//   secure: true,
//   sameSite: "strict",
// };

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const Auth = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(true);

  const handleChange = (evt) => {
    setForm({ ...form, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const { data } = await axios.post(
      `${API_ROUTE}/auth/${isSignup ? "signup" : "login"}`,
      form
    );

    const { access_token, access_expired } = data.data;

    cookies.set("jwtToken", access_token, {
      // ...COOKIE_OPTIONS,
      maxAge: access_expired,
    });

    navigate("/workspace");
    window.location.reload();
  };

  const switchMode = () => {
    setIsSignup((prevState) => !prevState);
  };

  return (
    <div className="auth__form-container">
      <div className="auth__form-container_fields">
        <div className="auth__form-container_fields-content">
          <p>{isSignup ? "Sign Up" : "Sign In"}</p>
          <form onSubmit={handleSubmit}>
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="abc@abc.com"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth__form-container_fields-content_button">
              <button> {isSignup ? "Sign Up" : "Sign In"}</button>
            </div>
          </form>
          <div className="auth__form-container_fields-account">
            <p>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <span onClick={switchMode}>
                {isSignup ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="auth__form-container_image">
        <img src={signinImage} alt="sign in" />
      </div>
    </div>
  );
};

export default Auth;
