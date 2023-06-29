const DirectMessagePreview = ({ member }) => {
  return (
    <div className="channel-preview__wrapper" onClick={() => {}}>
      <p className="channel-preview__item"># {member.username}</p>
    </div>
  );
};

export default DirectMessagePreview;
