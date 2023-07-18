import { useState } from "react";
import { BiSolidShareAlt, BiCheck } from "react-icons/bi";
import Tooltip from "@mui/material/Tooltip";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const CompanyHeader = ({ wid, workspaceTitle }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyInviteURL = () => {
    const inviteURL = `${API_ROUTE}/chat/workspace/${wid}/invite`;
    navigator.clipboard.writeText(inviteURL);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="h-[50px] border-b border-dark-gray-navbar bg-dark-gray-sidebar flex items-center pl-4 shrink-0 sticky top-0 z-10">
      <p className="text-xl font-bold text-white truncate">{workspaceTitle}</p>
      <Tooltip title={<h1 className="text-sm">{isCopied ? "Copied!" : "Invitation Link"}</h1>} placement="right" arrow>
        <div className="ml-auto mr-3">
          {isCopied ? (
            <BiCheck className=" inline-block align-bottom text-xl text-success-color" />
          ) : (
            <BiSolidShareAlt className="inline-block align-bottom text-xl text-white" onClick={copyInviteURL} />
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default CompanyHeader;
