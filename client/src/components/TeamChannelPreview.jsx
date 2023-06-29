import { Link } from "react-router-dom";

const TeamChannelPreview = ({ channel }) => {
  return (
    <Link to={`${channel._id}/room`}>
      <div className="channel-preview__wrapper">
        <div className="channel-preview__item">
          <p># {channel.title}</p>
          <div className="rounded-full bg-red-500 w-2 h-2"></div>
        </div>
      </div>
    </Link>
  );
};

export default TeamChannelPreview;
