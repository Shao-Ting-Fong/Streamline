import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const WorkspaceInvitation = () => {
  const { wid } = useParams();

  useEffect(() => {}, []);
  return <div>WorkspaceInvitation</div>;
};

export default WorkspaceInvitation;
