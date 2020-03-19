let turns = 1;
let firstPlayerTurn = true;
let firstPlayerLogo = 'X';
let secondPlayerLogo = 'O';

// keeps track of the total score for each possible winning combination
let firstPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
let secondPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
let movesMap = {
	// adds to the total score for each possible winning combination
	// [row1, row2, row3, col1, col2, col3, diag1, diag2]
	"0": [1, 0, 0, 1, 0, 0, 1, 0],
    "1": [1, 0, 0, 0, 1, 0, 0, 0],
    "2": [1, 0, 0, 0, 0, 1, 0, 1],
    "3": [0, 1, 0, 1, 0, 0, 0, 0],
    "4": [0, 1, 0, 0, 1, 0, 1, 1],
    "5": [0, 1, 0, 0, 0, 1, 0, 0],
    "6": [0, 0, 1, 1, 0, 0, 0, 1],    
    "7": [0, 0, 1, 0, 1, 0, 0, 0],
    "8": [0, 0, 1, 0, 0, 1, 1, 0]    
}
let table = document.getElementById("ticTable");
let gameSettings = document.getElementById("gameSettings")

window.addEventListener("load", loadGame);

function loadGame() {
	$('#gameSettings').modal('show');
	startGame();
}

function startGame() {
	document.getElementById("displayMessage").innerHTML = "First Player's Turn";
}

// first player starts with X
function cellClicked(cell, cell_num) {
	// continue updating table until there are 9 moves (there are 9 squares in tic tac toe)
	if (turns < 10){
		if (!firstPlayerTurn){
			cell.innerHTML = secondPlayerLogo;
			cell.onclick="";
			for (let i = 0; i < movesMap[cell_num].length; i++){
				secondPlayerMoves[i] += movesMap[cell_num][i]
			}
			document.getElementById("displayMessage").innerHTML = "First Player's Turn";
		}
		else {
			cell.innerHTML = firstPlayerLogo;
			cell.onclick="";
			for (let i = 0; i < movesMap[cell_num].length; i++){
				firstPlayerMoves[i] += movesMap[cell_num][i]
			}
			document.getElementById("displayMessage").innerHTML = "Second Player's Turn";
		}		
		
	}
	turns++;
	checkFinish();
	firstPlayerTurn = !firstPlayerTurn;
}

// call this function after every move
function checkFinish() {
	if (turns > 4 && turns < 10) {
		if (firstPlayerTurn) {
			if (firstPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = "First Player Wins!";
				endGame();
			}
		}
		else {
			if (secondPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = "Second Player Wins!";
				endGame();
			}
		}
	}
	else if (turns == 10){
		if (firstPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = "First Player Wins!";
				endGame();
		}
		else {
			document.getElementById("displayMessage").innerHTML = "Game ended in a Draw!";
			endGame();
		}
	}
}

function resetGame() {
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			table.rows[i].cells[j].innerHTML = "";
			table.rows[i].cells[j].onclick= function() {cellClicked(this, i*3 + j)}
		}
	}
	firstPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
	secondPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
	turns = 1;
	firstPlayerTurn = true;
	startGame();
}

function endGame() {
	// Make sure no more moves can be made
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			table.rows[i].cells[j].onclick=""
		}
	}
}