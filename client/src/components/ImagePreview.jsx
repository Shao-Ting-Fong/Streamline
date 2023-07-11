const ImagePreview = ({ imagePreviewUrl, setImagePreviewUrl, setIsPreview }) => {
  const handleClose = () => {
    setIsPreview(false);
    setImagePreviewUrl("");
  };
  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-full max-w-screen max-h-screen z-10 bg-black opacity-80 flex justify-center items-center"
        onClick={() => handleClose()}></div>
      <img
        className=" max-h-[75%] max-w-[75%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        src={imagePreviewUrl}
        alt=""
      />
    </>
  );
};

export default ImagePreview;
