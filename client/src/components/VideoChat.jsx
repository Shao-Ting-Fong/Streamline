import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import toastConfig from "../utils/toastConfig";
import * as mediasoupClient from "mediasoup-client";
import Cookies from "universal-cookie";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

const API_ROUTE = import.meta.env.VITE_API_ROUTE;

const cookies = new Cookies();

function Video({ mediaSrc }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && mediaSrc) {
      ref.current.srcObject = mediaSrc;
    }
  }, [mediaSrc]);

  return <video autoPlay className="video" ref={ref}></video>;
}

function Audio({ mediaSrc }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && mediaSrc) {
      ref.current.srcObject = mediaSrc;
    }
  }, [mediaSrc]);

  return <audio autoPlay ref={ref}></audio>;
}

let params = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const VideoChat = ({ setStreaming }) => {
  const [videoSocket] = useState(() => {
    return io(`${API_ROUTE}/mediasoup`);
  });

  const authToken = cookies.get("jwtToken");

  const device = useRef();
  const producerTransport = useRef();
  const videoProducer = useRef({});
  const audioProducer = useRef({});
  const audioParams = useRef({});
  const videoParams = useRef({ params });

  const { wid, cid } = useParams();
  const [localStream, setLocalStream] = useState();
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMute, setMute] = useState(false);
  const [isStopPlaying, setStopPlaying] = useState(false);

  useEffect(() => {
    let consumerTransports = [];
    let consumingTransports = [];
    let onClose;

    const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
      await videoSocket.emit(
        "consume",
        {
          rtpCapabilities: device.current.rtpCapabilities,
          remoteProducerId,
          serverConsumerTransportId,
        },
        async ({ params }) => {
          if (params.error) {
            console.log("Cannot Consume.");
            toast.error("Oops! Something went wrong:(", toastConfig);
            return;
          }

          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          consumerTransports = [
            ...consumerTransports,
            {
              consumerTransport,
              serverConsumerTransportId: params.id,
              producerId: remoteProducerId,
              consumer,
            },
          ];

          const { track } = consumer;

          setRemoteStreams((streams) => {
            streams[remoteProducerId] = {
              src: new MediaStream([track]),
              kind: params.kind,
            };
            return { ...streams };
          });

          videoSocket.emit("consumer-resume", {
            serverConsumerId: params.serverConsumerId,
          });
        }
      );
    };

    const connectSendTransport = async () => {
      audioProducer.current = await producerTransport.current.produce(audioParams.current);
      videoProducer.current = await producerTransport.current.produce(videoParams.current);

      audioProducer.current.on("trackended", () => {
        console.log("audio track ended");

        // close audio track
      });

      audioProducer.current.on("transportclose", () => {
        console.log("audio transport ended");

        // close audio track
      });

      videoProducer.current.on("trackended", () => {
        console.log("video track ended");

        // close video track
      });

      videoProducer.current.on("transportclose", () => {
        console.log("video transport ended");

        // close video track
      });
    };

    const signalNewConsumerTransport = async (remoteProducerId) => {
      if (consumingTransports.includes(remoteProducerId)) return;
      consumingTransports.push(remoteProducerId);

      await videoSocket.emit("createWebRtcTransport", { consumer: true }, ({ params }) => {
        if (params.error) {
          console.log(params.error);
          toast.error("Oops! Something went wrong:(", toastConfig);
          return;
        }
        let consumerTransport;
        try {
          consumerTransport = device.current.createRecvTransport(params);
        } catch (error) {
          console.log(error);
          toast.error("Oops! Something went wrong:(", toastConfig);
          return;
        }

        consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            await videoSocket.emit("transport-recv-connect", {
              dtlsParameters,
              serverConsumerTransportId: params.id,
            });

            // Tell the transport that parameters were transmitted.
            callback();
          } catch (error) {
            // Tell the transport that something was wrong
            errback(error);
          }
        });

        connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      });
    };

    // server informs the client of a new producer just joined
    videoSocket.on("new-producer", ({ producerId }) => signalNewConsumerTransport(producerId));

    const getProducers = () => {
      videoSocket.emit("getProducers", (producerIds) => {
        // for each of the producer create a consumer
        producerIds.forEach(signalNewConsumerTransport);
      });
    };

    const createSendTransport = () => {
      videoSocket.emit("createWebRtcTransport", { consumer: false }, ({ params }) => {
        if (params.error) {
          console.log(params.error);
          toast.error("Oops! Something went wrong:(", toastConfig);
          return;
        }

        producerTransport.current = device.current.createSendTransport(params);

        producerTransport.current.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            await videoSocket.emit("transport-connect", {
              dtlsParameters,
            });

            callback();
          } catch (error) {
            errback(error);
          }
        });

        producerTransport.current.on("produce", async (parameters, callback, errback) => {
          try {
            await videoSocket.emit(
              "transport-produce",
              {
                kind: parameters.kind,
                rtpParameters: parameters.rtpParameters,
                appData: parameters.appData,
              },
              ({ id, producersExist }) => {
                callback({ id });

                // if producers exist, then join room
                if (producersExist) getProducers();
              }
            );
          } catch (error) {
            errback(error);
          }
        });

        connectSendTransport();
      });
    };

    const createDevice = async (data) => {
      try {
        device.current = new mediasoupClient.Device();

        await device.current.load({
          routerRtpCapabilities: data.rtpCapabilities,
        });

        // createSendTransport
        createSendTransport();
      } catch (error) {
        console.log(error);
        if (error.name === "UnsupportedError") toast.error("Browser not Supported.", toastConfig);
      }
    };

    const streamSuccess = (stream) => {
      console.log("Set Stream");
      setLocalStream(stream);
      onClose = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      audioParams.current.track = stream.getAudioTracks()[0];
      videoParams.current.track = stream.getVideoTracks()[0];

      // joinRoom()
      videoSocket.emit("joinRoom", { roomName: cid, workspace: wid, token: authToken }, (data) => {
        // createDevice()
        createDevice(data);
      });
    };

    videoSocket.on("connection-success", ({ socketId }) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then(streamSuccess)
        .catch((error) => {
          toast.error(error.message, toastConfig);
        });
    });

    videoSocket.on("producer-closed", ({ remoteProducerId }) => {
      const producerToClose = consumerTransports.find((transportData) => transportData.producerId === remoteProducerId);
      producerToClose.consumerTransport.close();
      producerToClose.consumer.close();

      // remove the consumer transport from the list
      consumerTransports = consumerTransports.filter((transportData) => transportData.producerId !== remoteProducerId);

      // remove the video div element
      setRemoteStreams((streams) => {
        delete streams[remoteProducerId];
        return { ...streams };
      });
    });

    return () => {
      videoSocket.off("connection-success");
      videoSocket.off("producer-closed");
      videoSocket.disconnect();
      console.log("First useEffect cleanup");
      if (onClose) onClose();
    };
  }, []);

  const toggleAudio = () => {
    localStream.getAudioTracks()[0].enabled = isMute;
    setMute((prev) => !prev);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = isStopPlaying;
    setStopPlaying((prev) => !prev);
  };

  return (
    <main className="h-full w-full flex">
      <div id="main_videos" className="grow relative bg-black justify-center items-center">
        <div className="w-full h-full flex justify-center items-center">
          <Video mediaSrc={localStream} className="video" />

          {Object.keys(remoteStreams).map((key) =>
            remoteStreams[key].kind === "audio" ? (
              <Audio mediaSrc={remoteStreams[key].src} key={key} />
            ) : (
              <Video mediaSrc={remoteStreams[key].src} key={key} className="video" />
            )
          )}
        </div>

        <div id="main_controls" className="absolute right-0 top-1/2 -translate-y-1/2  bg-transparent text-white">
          <div id="main_controls_block" className="flex flex-col justify-center">
            {isMute ? (
              <div className="main_controls_btn hover:bg-[#343434] text-[#EB534B]" onClick={toggleAudio}>
                <MicOffIcon fontSize="large" />
              </div>
            ) : (
              <div className="main_controls_btn hover:bg-[#343434]" onClick={toggleAudio}>
                <KeyboardVoiceIcon fontSize="large" />
              </div>
            )}
            <div className="main_controls_btn  bg-[#EB534B]">
              <CallEndIcon fontSize="large" onClick={() => setStreaming(false)} />
            </div>

            {isStopPlaying ? (
              <div className="main_controls_btn hover:bg-[#343434] text-[#EB534B]" onClick={toggleVideo}>
                <VideocamOffIcon fontSize="large" />
              </div>
            ) : (
              <div className="main_controls_btn hover:bg-[#343434]" onClick={toggleVideo}>
                <VideocamIcon fontSize="large" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VideoChat;
