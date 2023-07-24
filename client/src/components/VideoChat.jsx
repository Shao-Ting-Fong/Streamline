import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as mediasoupClient from "mediasoup-client";
import Cookies from "universal-cookie";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

const SOCKET_ROUTE = import.meta.env.VITE_SOCKET_ROUTE;

const cookies = new Cookies();

function Video({ mediaSrc }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && mediaSrc) {
      ref.current.srcObject = mediaSrc;
    }
  }, [mediaSrc]);

  return <video autoPlay ref={ref}></video>;
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
    return io(`${SOCKET_ROUTE}/mediasoup`);
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

    const streamSuccess = async (stream) => {
      setLocalStream(stream);
      onClose = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      audioParams.current.track = stream.getAudioTracks()[0];
      videoParams.current.track = stream.getVideoTracks()[0];

      const data = await new Promise((resolve, reject) => {
        videoSocket.emit("joinRoom", { roomName: cid, workspace: wid, token: authToken }, (data) => {
          if (data.error) {
            toast.error(data.error);
            setStreaming(false);
            reject(data.error);
          }

          resolve(data);
        });
      });
      // createDevice;
      return data;
    };

    const createDevice = async (data) => {
      try {
        device.current = new mediasoupClient.Device();

        await device.current.load({
          routerRtpCapabilities: data.rtpCapabilities,
        });
      } catch (error) {
        console.log(error);
        if (error.name === "UnsupportedError") toast.error("Browser not Supported.");
      }
    };

    const createSendTransport = () => {
      videoSocket.emit("createWebRtcTransport", { isConsumer: false }, ({ params }) => {
        if (params.error) {
          console.log(params.error);
          toast.error("Oops! Something went wrong:(");
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

    const signalNewConsumerTransport = (remoteProducerId) => {
      if (consumingTransports.includes(remoteProducerId)) return;
      consumingTransports.push(remoteProducerId);

      videoSocket.emit("createWebRtcTransport", { isConsumer: true }, ({ params }) => {
        try {
          if (params.error) throw new Error(params.error);
          const consumerTransport = device.current.createRecvTransport(params);
          consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
            try {
              videoSocket.emit("transport-recv-connect", {
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
        } catch (error) {
          console.log(error);
          toast.error("Oops! Something went wrong:(");
          return;
        }
      });
    };

    const connectRecvTransport = (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
      videoSocket.emit(
        "consume",
        {
          rtpCapabilities: device.current.rtpCapabilities,
          remoteProducerId,
          serverConsumerTransportId,
        },
        async ({ params }) => {
          if (params.error) {
            toast.error(params.error.message);
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
              socketId: params.socketId,
              enabled: true,
            };
            return { ...streams };
          });

          videoSocket.emit("consumer-resume", {
            serverConsumerId: params.serverConsumerId,
          });
        }
      );
    };

    // server informs the client of a new producer just joined
    videoSocket.on("new-producer", ({ producerId }) => signalNewConsumerTransport(producerId));

    const getProducers = () => {
      videoSocket.emit("getProducers", (producerIds) => {
        // for each of the producer create a consumer
        producerIds.forEach(signalNewConsumerTransport);
      });
    };

    videoSocket.on("connection-success", async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        const deviceData = await streamSuccess(stream);
        await createDevice(deviceData);
        createSendTransport();
      } catch (error) {
        if (error.name === "UnsupportedError") {
          toast.error("Browser not Supported.");
          return;
        }
        toast.error(error.message);
      }
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
      if (onClose) onClose();
    };
  }, []);

  useEffect(() => {
    videoSocket.on("updateTrack", ({ remoteProducerId, state }) => {
      setRemoteStreams((streams) => {
        streams[remoteProducerId].enabled = state;
        return { ...streams };
      });
    });

    return () => {
      videoSocket.off("updateTrack");
    };
  }, []);

  const toggleAudio = () => {
    localStream.getAudioTracks()[0].enabled = isMute;
    videoSocket.emit("trackState", {
      remoteProducerId: audioProducer.current.id,
      roomName: cid,
      kind: "audio",
      state: isMute,
    });
    setMute((prev) => !prev);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = isStopPlaying;
    videoSocket.emit("trackState", {
      remoteProducerId: videoProducer.current.id,
      roomName: cid,
      kind: "video",
      state: isStopPlaying,
    });
    setStopPlaying((prev) => !prev);
  };

  const handleCloseCall = () => {
    setStreaming(false);
  };

  const findAudioState = (obj, videoSocketId) => {
    for (const key of Object.keys(obj)) {
      const { kind, socketId, enabled } = obj[key];
      if (kind === "audio" && socketId === videoSocketId) return enabled;
    }
    return false;
  };

  return (
    <main className="h-full w-full flex">
      <div id="main_videos" className="grow relative bg-black justify-center items-center">
        <div className="w-full h-full flex justify-center items-center flex-wrap overflow-y-scroll scrollbar">
          <div className="relative h-[200px] w-[300px] max-h-[300px] max-w-[400px] object-cover m-2">
            {isStopPlaying ? (
              <div className="w-full h-full bg-dark-gray-background text-white flex justify-center items-center opacity-50">
                <VideocamOffIcon fontSize="large" />
              </div>
            ) : (
              <Video mediaSrc={localStream} />
            )}
            {isMute && <MicOffIcon fontSize="small" className="absolute bottom-0 right-0 text-[#EB534B]" />}
            {/* <div className="absolute bottom-0 left-0 text-base px-2 bg-black text-white opacity-70">
              {userProfile.username}
            </div> */}
          </div>

          {Object.keys(remoteStreams).map((key) => {
            if (remoteStreams[key].kind === "audio") {
              return <Audio mediaSrc={remoteStreams[key].src} key={key} />;
            } else {
              const audioState = findAudioState(remoteStreams, remoteStreams[key].socketId);
              return (
                <div className="relative h-[200px] w-[300px] max-h-[300px] max-w-[400px] object-cover m-2" key={key}>
                  {remoteStreams[key].enabled ? (
                    <Video mediaSrc={remoteStreams[key].src} />
                  ) : (
                    <div className="w-full h-full bg-dark-gray-background text-white flex justify-center items-center opacity-50">
                      <VideocamOffIcon fontSize="large" />
                    </div>
                  )}
                  {!audioState && <MicOffIcon fontSize="small" className="absolute bottom-0 right-0 text-[#EB534B]" />}
                </div>
              );
            }
          })}
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
              <CallEndIcon fontSize="large" onClick={handleCloseCall} />
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
