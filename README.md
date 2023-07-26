# Streamline

![](https://i.imgur.com/L3if3hy.png)

Streamline is a real-time chat application inspired by Discord, designed to facilitate seamless communication and collaboration among users. This README provides an overview of the app and a brief introduction of how I designed the architecture.

- [Website](https://streamline.fonguniverse.com/)
- [Demo & Explanation Video](https://drive.google.com/file/d/19P6xscDAvW_xlV_CykDalIQneZfrplMM/iew?usp=drive_link)

## Try it Yourself!

|     | Username | Password |
| :-: | :------: | :------: |
|  1  |  Demo1   |  demo1   |
|  2  |  Demo2   |  demo2   |

Please follow these steps to test the chat app's functionality:

1. Login with two different accounts using two separate browsers or one in a regular tab and the other in an Incognito window.

2. Once logged in, both accounts can send messages and images to each other or initiate a video meeting to communicate face-to-face.

## Features

- **Real-time Messaging:** Instantly send and receive messages in real-time, creating a dynamic chatting experience.

- **Image Sharing:** Share pictures with ease, allowing users to exchange images.

- **Private Messaging:** Engage in private conversations with other users in a one-on-one setting.

- **Notifications:** Get notified of new messages to stay updated on the conversation.

- **Group Channels:** Join or create public channels to discuss topics with like-minded individuals.

- **Video Meetings:** Host or join video meetings to connect face-to-face with other users, making remote collaboration more effective.

- **Create Your Own Workspaces:** Organize conversations by creating personalized workspaces, enabling users to categorize discussions based on projects or topics.

- **Instantly Update User's Online State:** See real-time updates of user's online/offline status, allowing for efficient communication and knowing when users are available.

## Tech Stack

**MERN** (MongoDB, Express, React, Node.js) fullstack app built with the following tools:

- **Programming Language:** JavaScript, TypeScript

- **Client:** React, React Router, Tailwind CSS

- **Server:** Node.js, Express

- **Database:** MongoDB, Redis

- **Real-time Communication:**

  - Messaging: WebSocket, Socket.IO
  - Video Meeting: WebRTC, mediasoup
  - Cross-server Communication: Redis Pub/Sub

- **AWS Cloud Service:** EC2, Elastic Load Balancer, S3

- **Containerization:** Docker

## Architecture Design

### Overall Diagram

![](https://i.imgur.com/lLk9Xw4.png)

**Highlight**

- Decoupled WebSocket/WebRTC server from API server for scalable architecture with user growth.
- Utilized Redis caching for instant user online status updates and Pub/Sub for cross-server communication.
- Improved deployment efficiency by containerizing development environments with docker compose.

### Video Meeting Network

![](https://i.imgur.com/kORZAWd.png)

**Advantages**

- **Lower CPU Consumption:** Unlike MCUs that process media streams, SFUs primarily focus on routing. As a result, they consume considerably less CPU, making them more cost-effective and scalable, especially in scenarios with a large number of participants.
