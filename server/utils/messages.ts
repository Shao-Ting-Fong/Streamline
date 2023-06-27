import dayjs from "dayjs";

const formatMessage = (username: string, text: string): object => ({
  username,
  text,
  time: dayjs().format("HH:mm a"),
});

export default formatMessage;
