import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const cookies = new Cookies();

const MemberProfileCard = ({ member, setMemberClicked }) => {
  const navigate = useNavigate();
  const { wid, cid } = useParams();
  const [newMsg, setNewMsg] = useState("");
  const token = cookies.get("jwtToken");

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { data } = await axios.post(
      `${API_ROUTE}/chat/workspace/${wid}/channel/${cid}/msg`,
      {
        from: token,
        to: { workspace: wid, type: "direct", id: member._id },
        msg: newMsg,
      }
    );
    setMemberClicked({ anchorEl: null, member: null });
    navigate(`/workspace/${wid}/channel/${data.to}/room`);
  };

  return (
    <>
      {member && (
        <div className="w-[300px] h-[400px] rounded-lg flex flex-col items-center bg-light-color-purple">
          <div className="h-1/5 w-full relative bg-dark-color-purple-b shrink-0 mb-5">
            <img
              className="w-1/4 absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 border-4 bg-white rounded-full"
              src={API_ROUTE + member.avatarURL}
              alt=""
            />
          </div>
          <div className="w-5/6 h-full my-[25px] rounded-lg bg-white p-4 flex flex-col">
            <h1 className="text-2xl">{member.username}</h1>
            <p className="text-xs text-secondary  my-2 pb-2 border-b border-secondary">
              {member._id}
            </p>
            <p className="text-sm">Joined on</p>
            <p className="text-xs mt-2">2023-06-30</p>
            <form className="w-full mt-auto mb-1" onSubmit={handleSubmit}>
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
