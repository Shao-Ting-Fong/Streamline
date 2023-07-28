import axios from "axios";
import {
  Button,
  TextField,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiLockAlt, BiSearch } from "react-icons/bi";
import { socket } from "../socket";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const IMG_ROUTE = import.meta.env.VITE_IMG_ROUTE;
const cookies = new Cookies();

const CreateChannel = ({ isCreatingChannel, setIsCreatingChannel, userProfile, setTeamChannels }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const { wid } = useParams();
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [searchPattern, setSearchPattern] = useState(new RegExp());
  const navigate = useNavigate();

  useEffect(() => {
    const getWorkspaceMembers = async () => {
      const { data } = await axios.get(`${API_ROUTE}/chat/workspace/${wid}/members`, {
        headers: { Authorization: authString },
      });
      setWorkspaceMembers(data);
    };
    try {
      getWorkspaceMembers();
      socket.on("newMember", () => {
        getWorkspaceMembers();
      });
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }

    return () => {
      socket.off("newMember");
    };
  }, [wid, authToken]);

  const handleClose = () => {
    setIsCreatingChannel(false);
  };

  const handleSearch = (evt) => {
    setSearchPattern(new RegExp(`^${evt.target.value}`, "i"));
  };

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      const formData = new FormData(evt.target);

      if (!evt.target.isPrivate.checked) {
        formData.set("isPrivate", "false");
      }

      const { data } = await axios.post(`${API_ROUTE}/chat/workspace/${wid}/channel/new`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authString,
        },
      });

      setIsCreatingChannel(false);
      setTeamChannels((prev) => [...prev, data]);
      navigate(`/workspace/${wid}/channel/${data._id}/room`);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <Dialog open={isCreatingChannel} onClose={setIsCreatingChannel} maxWidth={"sm"} fullWidth={true}>
      <DialogTitle>Create New Channel</DialogTitle>

      <DialogContent>
        <form id="createChannel" method="post" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New Channel Name"
            type="text"
            fullWidth
            variant="standard"
            name="channelName"
          />
          <div className="w-full flex items-center mt-8">
            <label htmlFor="privateChannel">
              <div className="">
                <div className="flex items-center -ml-1">
                  <BiLockAlt className="text-xl" />
                  <h1 className="text-lg ml-1">Private Channel?</h1>
                </div>

                <p className="text-sm mt-2">Only the invited members can view this channel.</p>
              </div>
            </label>
            <Switch className="ml-auto" id="privateChannel" name="isPrivate" value="true" />
          </div>

          <h3 className="mt-8 mb-2 text-xl">Invite Members</h3>
          <TextField
            margin="dense"
            id="search"
            label="Search Member"
            type="text"
            fullWidth
            variant="standard"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <BiSearch fontSize="large" />
                </InputAdornment>
              ),
            }}
            onChange={handleSearch}
          />
          <div className="h-full mt-4">
            {workspaceMembers
              // .filter((member) => member.username.match(searchPattern))
              .map((member) => (
                <div
                  className={`flex items-center px-3 py-2 hover:bg-light-color-purple ${
                    member._id === userProfile._id || !member.username.match(searchPattern) ? "hidden" : ""
                  }`}
                  key={member._id}>
                  <img className="h-10" src={IMG_ROUTE + member.avatarURL} alt="" />
                  <label htmlFor={member._id} className="ml-6">
                    {member.username}
                  </label>
                  <input
                    className=" ml-auto w-4 h-4"
                    type="checkbox"
                    defaultChecked={member._id === userProfile._id}
                    name={member._id}
                    id={member._id}
                  />
                </div>
              ))}
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="createChannel">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChannel;
