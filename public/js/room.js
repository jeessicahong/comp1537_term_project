let socket = io.connect('http://localhost:4000');

let createRoomName = document.getElementById("createRoom");
let joinRoomName = document.getElementById("joinRoom");

function createRoom() {
	socket.emit('room', createRoomName);
}

function joinRoom() {
	socket.emit('room', joinRoomName);
}
