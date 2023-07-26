import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;
const cookies = new Cookies();

const MemberProfileCard = ({ member, setMemberClicked }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const navigate = useNavigate();
  const { wid, cid } = useParams();
  const [newMsg, setNewMsg] = useState("");

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      const { data } = await axios.post(
        `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`,
        {
          from: authToken,
          to: JSON.stringify({ workspace: wid, type: "direct", id: member._id }),
          message: newMsg,
        },
        { headers: { Authorization: authString } }
      );
      setMemberClicked({ anchorEl: null, member: null });
      navigate(`/workspace/${wid}/channel/${data.to}/room`);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {member && (
        <div className="w-[300px] h-[400px] rounded-lg flex flex-col items-center bg-light-color-purple">
          <div className="h-1/5 w-full relative bg-dark-color-purple-b shrink-0 mb-5">
            <img
              className="w-1/4 absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 border-4 rounded-full"
              src={IMG_ROUTE + member.avatarURL}
              alt=""
            />
          </div>
          <div className="w-5/6 h-full my-[25px] rounded-lg bg-white p-4 flex flex-col">
            <h1 className="text-2xl">{member.username}</h1>
            <p className="text-xs text-secondary  my-2 pb-2 border-b border-secondary">{member._id}</p>
            <p className="text-sm">Joined on</p>
            <p className="text-xs mt-2">2023-06-30</p>
            <form className="w-full mt-auto mb-1" onSubmit={handleSubmit} autoComplete="off">
              <input
                className="text-xs pl-2 h-10 border w-full focus:outline-none"
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder={`Send Message to @${member.username}`}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberProfileCard;
