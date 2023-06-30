import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";

const TeamChannelPreview = ({ channel, channelUnread, setChannelUnread }) => {
  // const { cid } = useParams;
  const markAsRead = (channelId) => {
    setChannelUnread((status) => {
      if (status[channelId]) status[channelId].unread = false;
      return { ...status };
    });
  };
  return (
    <Link to={`${channel._id}/room`} onClick={() => markAsRead(channel._id)}>
      <div className="channel-preview__wrapper">
        <div className="channel-preview__item">
          <p># {channel.title}</p>
          {channelUnread[channel._id]?.unread && (
            <div className="rounded-full bg-red-500 w-2 h-2"></div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TeamChannelPreview;
