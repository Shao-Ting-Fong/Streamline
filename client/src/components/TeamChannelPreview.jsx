import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { BiHash, BiLockAlt } from "react-icons/bi";

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
    return channelUnread[channelId]?.unread && cid !== channelId;
  };

  return (
    <Link to={`${channel._id}/room`} onClick={() => markAsRead(channel._id)}>
      <div className="channel-preview__wrapper">
        <div className="channel-preview__item">
          <p>{channel.category === "public" ? <BiHash /> : <BiLockAlt />}</p>
          <p className="ml-2">{channel.title}</p>
          {onUnread(channel._id) && <div className="rounded-full bg-red-500 w-2 h-2 ml-auto"></div>}
        </div>
      </div>
    </Link>
  );
};

export default TeamChannelPreview;
