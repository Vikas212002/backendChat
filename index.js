const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const connection = require('./config/db');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let db;
connection().then(database => {
  db = database;
  server.listen(PORT, () => {
    console.log('server running at http://localhost:' + PORT);
  });
}).catch(error => {
  console.error("Failed to establish database connection:", error);
});

app.use(cors());

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Replace socket.id with a user identifier
  const userId = socket.handshake.query.userId;
  connectedUsers[userId] = socket.id; 
  io.emit('active-status', { connectedUsers }); // Broadcast active status to all clients
  console.log(connectedUsers);  

  socket.on('joinRoom', async ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join('_');
    console.log(`User ${sender} joined room: ${roomId}`);
    socket.join(roomId);

    try {
      const messages = await db.collection('messages').find({ roomId }).sort({ timestamp: 1 }).toArray();
      socket.emit("previousMessages", messages);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('chat message', async ({ msg, roomId, sender, receiver }) => {
    const messageObject = { msg, sender };
    io.to(roomId).emit('chat message', messageObject);
    console.log(`message from ${sender} to ${receiver}: ${msg}`);

    try {
      const newChat = {
        sender: sender,
        receiver: receiver,
        message: msg,
        timestamp: Date.now(),
        roomId: roomId
      };
      const collectionName = db.collection('messages');
      const insert = await collectionName.insertOne(newChat);
      if (insert) {
        console.log("Message inserted");
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete connectedUsers[userId]; // Remove user from connected users
    io.emit('disconnection', { connectedUsers }); // Notify all clients of disconnection
  });
});

