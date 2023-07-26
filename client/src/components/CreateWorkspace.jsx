import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Button from "@mui/material/Button";
import Cookies from "universal-cookie";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import ImageUploadIcon from "../assets/imageUpload.png";
import {
  AiOutlineRocket,
  AiOutlineMail,
  AiOutlineLeft,
  AiOutlineRight,
  AiFillCloseCircle,
  AiFillPlusCircle,
} from "react-icons/ai";

const cookies = new Cookies();

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const CreateWorkspace = ({ isCreatingWorkspace, setIsCreatingWorkspace }) => {
  const authToken = cookies.get("jwtToken");
  const authString = `Bearer ${authToken}`;
  const navigate = useNavigate();
  const [workspaceAvatar, setWorkspaceAvatar] = useState(ImageUploadIcon);
  const [currentPage, setCurrentPage] = useState("home");

  const handleAvatarPreview = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        setWorkspaceAvatar(e.target.result);
      };
    }
  };

  const handleClose = () => {
    setIsCreatingWorkspace(false);
    setWorkspaceAvatar(ImageUploadIcon);
    setTimeout(() => setCurrentPage("home"), 500);
  };

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      let workspaceId;
      if (currentPage === "new") {
        const formData = new FormData(evt.target);
        const { data } = await axios.post(`${API_ROUTE}/chat/workspace/new`, formData, {
          headers: {
            Authorization: authString,
          },
        });
        workspaceId = data.workspaceId;
      }

      if (currentPage === "invite") {
        const inviteURL = evt.target.invitation.value;

        const { data } = await axios.get(inviteURL, {
          headers: {
            Authorization: authString,
          },
        });
        workspaceId = data.workspaceId;
      }

      evt.target.reset();
      setWorkspaceAvatar(ImageUploadIcon);
      setIsCreatingWorkspace(false);
      setCurrentPage("home");
      navigate(`/workspace/${workspaceId}/channel`);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.errors : error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isCreatingWorkspace} onClose={setIsCreatingWorkspace} maxWidth={"sm"} fullWidth={true}>
      {currentPage === "home" && (
        <>
          <DialogTitle className="flex items-center">
            <p>Add New Workspace</p>
            <AiFillCloseCircle className="text-2xl ml-auto cursor-pointer" onClick={handleClose} />
          </DialogTitle>

          <DialogContent>
            <p>Establish a new workspace, invite members and chat!</p>
            <div
              className="flex items-center border rounded-lg p-3 mt-4 cursor-pointer"
              onClick={() => setCurrentPage("new")}>
              <AiOutlineRocket className="text-3xl" />
              <p className="ml-4">Create your new workspace.</p>
              <AiOutlineRight className="ml-auto" />
            </div>
            <div
              className="flex items-center border rounded-lg p-3 mt-4 cursor-pointer"
              onClick={() => setCurrentPage("invite")}>
              <AiOutlineMail className="text-3xl" />
              <p className="ml-4">Join workspace by invitation link.</p>
              <AiOutlineRight className="ml-auto" />
            </div>
          </DialogContent>
        </>
      )}
      {currentPage === "new" && (
        <>
          <DialogTitle className="flex items-center">
            <AiOutlineLeft onClick={() => setCurrentPage("home")} />
            <p className="ml-3">Create New Workspace</p>
          </DialogTitle>

          <DialogContent>
            <form id="createWorkspace" method="post" onSubmit={handleSubmit} className="w-full" autoComplete="off">
              <div className="border h-[80px] w-[80px] rounded-full relative mx-auto p-2">
                <label htmlFor="avatarInput" className="cursor-pointer">
                  <AiFillPlusCircle className="absolute right-0 top-0 text-xl" />
                  <img src={workspaceAvatar} alt="File Preview" />
                </label>
              </div>

              <input
                className="hidden"
                type="file"
                id="avatarInput"
                name="file"
                accept="image/*"
                onChange={handleAvatarPreview}
              />
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="New Workspace Name"
                type="text"
                fullWidth
                variant="standard"
                name="workspaceName"
                required
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" form="createWorkspace">
              Create
            </Button>
          </DialogActions>
        </>
      )}

      {currentPage === "invite" && (
        <>
          <DialogTitle className="flex items-center">
            <AiOutlineLeft onClick={() => setCurrentPage("home")} />
            <p className="ml-3">Join Workspace by Invitation Link</p>
          </DialogTitle>
          <DialogContent>
            <p>Paste the invitation link below.</p>
            <form
              id="inviteWorkspace"
              method="post"
              onSubmit={handleSubmit}
              className="mt-4 w-full flex"
              autoComplete="off">
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Invitation link"
                type="text"
                fullWidth
                variant="standard"
                name="invitation"
                required
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" form="inviteWorkspace">
              Join Now
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CreateWorkspace;
