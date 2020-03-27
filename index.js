var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
var server = app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

var connectSequence = 1;

//listen for event when connection from client browser
io.on('connection', function(socket){
	console.log("made socket connection", socket.id);

	if (connectSequence == 1) {
		socket.emit('connectSequence', connectSequence);
		connectSequence = 2;
	}
	else {
		socket.emit('connectSequence', connectSequence);
		connectSequence = 1;
	}

	socket.on('updateBoard', function(data){
		socket.broadcast.emit('updateBoard', data);
	});

	socket.on('reset', function() {
		socket.broadcast.emit('reset');
	});

	socket.on('setFirstPlayer', function(data) {
		socket.broadcast.emit('setFirstPlayer', data);
	});

	socket.on('setSecondPlayer', function(data) {
		socket.broadcast.emit('setSecondPlayer', data);
	})
});
