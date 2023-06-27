import { Socket, Server } from "socket.io";
import mediasoup, { types as mediasoupTypes } from "mediasoup";

const HOST_IP = process.env.HOST_IP || "127.0.0.1";
const rtcMinPort: number = Number(process.env.MEDIASOUP_RTCMINPORT) ?? 2000;
const rtcMaxPort: number = Number(process.env.MEDIASOUP_RTCMAXPORT) ?? 2100;

const videoChat = function () {
  const _self = this;

  _self.init = async function (connections: Server) {
    const createWorker = async () => {
      const worker = await mediasoup.createWorker({
        rtcMinPort,
        rtcMaxPort,
      });
      console.log(`worker pid ${worker.pid}`);

      worker.on("died", () => {
        // This implies something serious happened, so kill the application
        console.error("mediasoup worker has died");
        // setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
      });

      return worker;
    };

    // We create a Worker as soon as our application starts
    const worker = await createWorker();
    interface Room {
      router: mediasoupTypes.Router;
      peers?: string[];
    }

    interface Peer {
      roomName: string;
      socket: Socket;
      transports: string[];
      producers: string[];
      consumers: string[];
      peerDetails: any; // Replace with the actual type for peerDetails
    }

    interface TransportEntry {
      socketId: string;
      roomName: string;
      transport: mediasoupTypes.WebRtcTransport;
      consumer: mediasoupTypes.Consumer;
      close: () => void;
    }

    interface ProducerEntry {
      socketId: string;
      roomName: string;
      producer: mediasoupTypes.Producer;
      close: () => void;
    }

    interface ConsumerEntry {
      socketId: string;
      roomName: string;
      consumer: mediasoupTypes.Consumer;
      close: () => void;
    }

    const rooms: { [roomName: string]: Room } = {};
    const peers: { [socketId: string]: Peer } = {};
    let transports: TransportEntry[] = [];
    let producers: ProducerEntry[] = [];
    let consumers: ConsumerEntry[] = [];

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

    type MediaCodec = AudioCodec | VideoCodec;

    // This is an Array of RtpCapabilities
    const mediaCodecs: MediaCodec[] = [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
    ];

    connections.on("connection", async (socket: Socket) => {
      console.log(socket.id);
      socket.emit("connection-success", {
        socketId: socket.id,
      });

      const removeItems = (
        items: ConsumerEntry[] | ProducerEntry[] | TransportEntry[],
        socketId: string
      ) => {
        items.forEach((item) => {
          if (item.socketId === socketId) {
            item.close();
          }
        });
        // @ts-ignore
        const itemsIdRemoved = items.filter(
          (item: ConsumerEntry | ProducerEntry | TransportEntry) =>
            item.socketId !== socketId
        );

        return itemsIdRemoved;
      };

      socket.on("disconnect", () => {
        // do some cleanup
        console.log("peer disconnected");
        consumers = removeItems(consumers, socket.id);
        producers = removeItems(producers, socket.id);
        transports = removeItems(transports, socket.id);

        const { roomName } = peers[socket.id];
        delete peers[socket.id];

        // remove socket from room
        rooms[roomName] = {
          router: rooms[roomName].router,
          peers: rooms[roomName].peers?.filter(
            (socketId) => socketId !== socket.id
          ),
        };
      });

      socket.on(
        "joinRoom",
        async ({ roomName }: { roomName: string }, callback: Function) => {
          const createRoom = async (socketId: string) => {
            let router1;
            let currentPeers: string[] = [];
            if (rooms[roomName]) {
              router1 = rooms[roomName].router;
              currentPeers = rooms[roomName].peers || [];
            } else {
              router1 = await worker.createRouter({ mediaCodecs });
            }

            console.log(`Router ID: ${router1.id}`, currentPeers.length);

            rooms[roomName] = {
              router: router1,
              peers: [...currentPeers, socketId],
            };

            return router1;
          };

          // create Router if it does not exist
          // const router1 = rooms[roomName] && rooms[roomName].get('data').router || await createRoom(roomName, socket.id)
          const router1 = await createRoom(socket.id);

          peers[socket.id] = {
            socket,
            roomName, // Name for the Router this Peer joined
            transports: [],
            producers: [],
            consumers: [],
            peerDetails: {
              name: "",
              isAdmin: false, // Is this Peer the Admin?
            },
          };

          // get Router RTP Capabilities
          const { rtpCapabilities } = router1;

          // call callback from the client and send back the rtpCapabilities
          callback({ rtpCapabilities });
        }
      );

      const createWebRtcTransport = (
        mediasoupRouter: mediasoupTypes.Router
      ): Promise<mediasoupTypes.WebRtcTransport> =>
        new Promise((resolve, reject) => {
          const createTransport = async (): Promise<void> => {
            try {
              const webRtcTransportOptions: mediasoupTypes.WebRtcTransportOptions =
                {
                  listenIps: [
                    {
                      ip: "0.0.0.0", // replace with relevant IP address
                      announcedIp: HOST_IP,
                    },
                  ],
                  enableUdp: true,
                  enableTcp: true,
                  preferUdp: true,
                };

              const transport = await mediasoupRouter.createWebRtcTransport(
                webRtcTransportOptions
              );
              // console.log(`transport id: ${transport.id}`);

              transport.on(
                "dtlsstatechange",
                (dtlsState: mediasoupTypes.DtlsState) => {
                  if (dtlsState === "closed") {
                    transport.close();
                  }
                }
              );

              transport.on("@close", () => {
                console.log("transport closed");
              });

              resolve(transport);
            } catch (error) {
              reject(error);
            }
          };

          createTransport();
        });

      const addTransport = (
        transport: mediasoupTypes.WebRtcTransport,
        roomName: string,
        consumer: mediasoupTypes.Consumer
      ) => {
        transports.push({
          socketId: socket.id,
          transport,
          roomName,
          consumer,
          close: () => {
            transport.close();
          },
        });

        peers[socket.id] = {
          ...peers[socket.id],
          transports: [...peers[socket.id].transports, transport.id],
        };
      };

      // Client emits a request to create server side Transport
      // We need to differentiate between the producer and consumer transports
      socket.on(
        "createWebRtcTransport",
        async (
          { consumer }: { consumer: mediasoupTypes.Consumer },
          callback: Function
        ) => {
          // get Room Name from Peer's properties
          const { roomName } = peers[socket.id];

          // get Router (Room) object this peer is in based on RoomName
          const { router: mediasoupRouter } = rooms[roomName];

          createWebRtcTransport(mediasoupRouter).then(
            (transport) => {
              callback({
                params: {
                  id: transport.id,
                  iceParameters: transport.iceParameters,
                  iceCandidates: transport.iceCandidates,
                  dtlsParameters: transport.dtlsParameters,
                },
              });

              // add transport to Peer's properties
              addTransport(transport, roomName, consumer);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      );

      const addProducer = (
        producer: mediasoupTypes.Producer,
        roomName: string
      ) => {
        producers.push({
          socketId: socket.id,
          producer,
          roomName,
          close: () => {
            producer.close();
          },
        });

        peers[socket.id] = {
          ...peers[socket.id],
          producers: [...peers[socket.id].producers, producer.id],
        };
      };

      const addConsumer = (
        consumer: mediasoupTypes.Consumer,
        roomName: string
      ) => {
        // add the consumer to the consumers list
        consumers.push({
          socketId: socket.id,
          consumer,
          roomName,
          close: () => {
            consumer.close();
          },
        });

        // add the consumer id to the peers list
        peers[socket.id] = {
          ...peers[socket.id],
          consumers: [...peers[socket.id].consumers, consumer.id],
        };
      };

      const informConsumers = (
        roomName: string,
        socketId: string,
        producerId: string
      ) => {
        console.log(`just joined, id ${producerId} ${roomName}, ${socketId}`);
        // A new producer just joined
        // let all consumers to consume this producer
        producers.forEach((producerData) => {
          if (
            producerData.socketId !== socketId &&
            producerData.roomName === roomName
          ) {
            const producerSocket = peers[producerData.socketId].socket;
            // use socket to send producer id to producer
            producerSocket.emit("new-producer", { producerId });
          }
        });
      };

      const getTransport = (socketId: string) => {
        const [producerTransport] = transports.filter(
          (transport) => transport.socketId === socketId && !transport.consumer
        );
        return producerTransport.transport;
      };

      socket.on("getProducers", (callback: Function) => {
        // return all producer transports
        const { roomName } = peers[socket.id];

        const producerList: string[] = [];
        producers.forEach((producerData) => {
          if (
            producerData.socketId !== socket.id &&
            producerData.roomName === roomName
          ) {
            producerList.push(producerData.producer.id);
          }
        });

        // return the producer list back to the client
        callback(producerList);
      });

      // see client's socket.emit('transport-connect', ...)
      socket.on(
        "transport-connect",
        ({ dtlsParameters }: { dtlsParameters: any }) => {
          // console.log("DTLS PARAMS... ", { dtlsParameters });
          getTransport(socket.id).connect({ dtlsParameters });
        }
      );

      // see client's socket.emit('transport-produce', ...)
      socket.on(
        "transport-produce",
        async (
          {
            kind,
            rtpParameters,
          }: { kind: "video" | "audio"; rtpParameters: any },
          callback: Function
        ) => {
          // call produce based on the parameters from the client
          const producer = await getTransport(socket.id).produce({
            kind,
            rtpParameters,
          });

          // add producer to the producers array
          const { roomName } = peers[socket.id];

          addProducer(producer, roomName);

          informConsumers(roomName, socket.id, producer.id);

          console.log("Producer ID: ", producer.id, producer.kind);

          producer.on("transportclose", () => {
            console.log("transport for this producer closed ");
            producer.close();
          });

          // Send back to the client the Producer's id
          callback({
            id: producer.id,
            producersExist: producers.length > 1,
          });
        }
      );

      // see client's socket.emit('transport-recv-connect', ...)
      socket.on(
        "transport-recv-connect",
        async ({
          dtlsParameters,
          serverConsumerTransportId,
        }: {
          dtlsParameters: any;
          serverConsumerTransportId: string;
        }) => {
          // console.log(`DTLS PARAMS: ${dtlsParameters}`);
          const consumerTransport = transports.find(
            (transportData) =>
              transportData.consumer &&
              transportData.transport.id === serverConsumerTransportId
          )?.transport;
          await consumerTransport?.connect({ dtlsParameters });
        }
      );

      socket.on(
        "consume",
        async (
          {
            rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
          }: {
            rtpCapabilities: any;
            remoteProducerId: string;
            serverConsumerTransportId: string;
          },
          callback: Function
        ) => {
          try {
            const { roomName } = peers[socket.id];
            const { router: mediasoupRouter } = rooms[roomName];
            const consumerTransport = transports.find(
              (transportData) =>
                transportData.consumer &&
                transportData.transport.id === serverConsumerTransportId
            )?.transport;

            if (!consumerTransport) {
              console.error("consumerTransport is empty.");
              return;
            }

            // check if the router can consume the specified producer
            if (
              mediasoupRouter.canConsume({
                producerId: remoteProducerId,
                rtpCapabilities,
              })
            ) {
              // transport can now consume and return a consumer
              const consumer = await consumerTransport.consume({
                producerId: remoteProducerId,
                rtpCapabilities,
                paused: true,
              });

              consumer.on("transportclose", () => {
                console.log("transport close from consumer");
              });

              consumer.on("producerclose", () => {
                console.log("producer of consumer closed");
                socket.emit("producer-closed", { remoteProducerId });

                consumerTransport.close();
                transports = transports.filter(
                  (transportData) =>
                    transportData.transport.id !== consumerTransport.id
                );
                consumer.close();
                consumers = consumers.filter(
                  (consumerData) => consumerData.consumer.id !== consumer.id
                );
              });

              addConsumer(consumer, roomName);

              // from the consumer extract the following params
              // to send back to the Client
              const params = {
                id: consumer.id,
                producerId: remoteProducerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                serverConsumerId: consumer.id,
              };

              // send the parameters to the client
              callback({ params });
            }
          } catch (error) {
            console.log(error);
            callback({
              params: { error },
            });
          }
        }
      );

      socket.on(
        "consumer-resume",
        async ({ serverConsumerId }: { serverConsumerId: string }) => {
          // console.log("consumer resume");
          const findConsumer = consumers.find(
            (consumerData) => consumerData.consumer.id === serverConsumerId
          );
          const consumer = findConsumer?.consumer;
          await consumer?.resume();
        }
      );
    });
  };
};

export default new videoChat();
