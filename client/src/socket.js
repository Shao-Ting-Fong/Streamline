import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.VITE_API_ROUTE;

export const socket = io(`${URL}/chatroom`);
// export const videoSocket = io(`${URL}/mediasoup`);
