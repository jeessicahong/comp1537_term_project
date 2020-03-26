var express = require('express');
var socket = require('socket.io');

// Socket setup
var io = socket(server);

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

app.post('/play-local', (req, res) => {
	res.redirect('/game');
});

app.get('/game', (req, res) => {
	res.sendFile(__dirname + '/public/game.html');
});

app.post('/create-room', (req, res) => {
	// var roomName = JSON.stringify(req.body.roomName);
	// console.log(roomName);

	res.sendFile(__dirname + '/public/game.html');
});

//listen for event when connection from client browser
io.on('connection', function(socket){
	console.log("made socket connection", socket.id);

	socket.on('room', function(room){
		socket.join(room);
		io.sockets.in(room).emit("connectRoom" , "New user has joined room: " + room);
	});
});