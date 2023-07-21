import { types as mediasoupTypes } from "mediasoup";
import { Socket } from "socket.io";
import { Types } from "mongoose";

export interface Room {
  router: mediasoupTypes.Router;
  peers?: string[];
}

export interface Peer {
  roomName: string;
  socket: Socket;
  transports: string[];
  producers: string[];
  consumers: string[];
  peerDetails: any; // Replace with the actual type for peerDetails
}

export interface TransportEntry {
  socketId: string;
  roomName: string;
  transport: mediasoupTypes.WebRtcTransport;
  isConsumer: boolean;
  close: () => void;
}

export interface ProducerEntry {
  socketId: string;
  roomName: string;
  producer: mediasoupTypes.Producer;
  close: () => void;
}

export interface ConsumerEntry {
  socketId: string;
  roomName: string;
  consumer: mediasoupTypes.Consumer;
  close: () => void;
}

interface AudioCodec {
  kind: "audio";
  mimeType: string;
  clockRate: number;
  channels: number;
}

interface VideoCodec {
  kind: "video";
  mimeType: string;
  clockRate: number;
  parameters: {
    [key: string]: any;
  };
}

export type MediaCodec = AudioCodec | VideoCodec;

export interface RoomInfo {
  roomName: string;
  workspace: Types.ObjectId;
  token: string;
}
