import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const TeamChannelPreview = ({ channel, channelUnread, setChannelUnread }) => {
  const { cid } = useParams();

  useEffect(() => {
    markAsRead(cid);
    return () => {
      markAsRead(cid);
    };
  }, [cid]);

  const markAsRead = (channelId) => {
    setChannelUnread((status) => {
      if (status[channelId]) status[channelId].unread = false;
      return { ...status };
    });
  };

  const onUnread = (channelId) => {
    // if(cid === channelId) markAsRead(channelId)
    return channelUnread[channelId]?.unread && cid !== channelId;
  };

  return (
    <Link to={`${channel._id}/room`} onClick={() => markAsRead(channel._id)}>
      <div className="channel-preview__wrapper">
        <div className="channel-preview__item">
          <p># {channel.title}</p>
          {onUnread(channel._id) && (
            <div className="rounded-full bg-red-500 w-2 h-2"></div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TeamChannelPreview;
