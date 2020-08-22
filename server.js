const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');
const app = express(); // express is web app framework for node
const server = http.createServer(app);
const io = socketio(server);

// Set static folder that is served to the client
app.use(express.static(path.join(__dirname, 'public')));

// Start server
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); // print like this dude!

const connections = [null, null];
// Handle socket connection request from client
io.on('connection', (socket) => {
  console.log('New connection');

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i;
      break;
    }
  }

  // Tell the connecting client what player number they are
  // socket.emit sends to only the socket that connected/emitted connection event
  socket.emit('player-number', playerIndex);
  console.log({ playerIndex });

  // Ignore player 3
  if (playerIndex === -1) return;

  connections[playerIndex] = false; // false = not ready

  // alert other player of new connection
  // broadcast.emit sends to everyone
  socket.broadcast.emit('player-connection', playerIndex);
});
