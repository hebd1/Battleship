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
