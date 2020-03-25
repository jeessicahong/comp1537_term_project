var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();

const PORT = process.env.PORT || 4000;
var server = app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

//listen for event when connection from client browser
io.on('connection', function(socket){
	console.log("made socket connection", socket.id);

	// listen for the chat message
	socket.on('chat', function(data) {
		io.sockets.emit('chat', data);
	});

	socket.on('typing', function(data){
		socket.broadcast.emit('typing', data);
	});
});