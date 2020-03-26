let socket = io.connect('http://localhost:4000');

let notification = document.getElementById("notification");

socket.on('connectRoom', function(data){
	console.log("connected");
	notification.innerHTML = data;
});