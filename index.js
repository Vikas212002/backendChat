const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const connection = require('./config/db');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let db;
connection().then(database => {
  db = database;
  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join('_');
    socket.join(roomId);

    // Fetch previous messages
    const collectionName = db.collection('messages');
    collectionName.find({ roomId }).toArray((err, messages) => {
      if (err) throw err;
      socket.emit('previousMessages', messages);
    });
  });

  socket.on('chat message', async ({ msg, roomId }) => {
    io.to(roomId).emit('chat message', msg);
    console.log('message: ' + msg);

    try {
      const newChat = {
        message: msg,
        timestamp: Date.now(),
        roomId
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
  });
});
