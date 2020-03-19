let turns = 1;
let firstPlayerTurn = true;

let avatarSrcArray = [
"images/oddish.png", "images/snorlax.png", "images/ditto.png", "images/eevee.png", 
"images/ghastly.png", "images/meowth.png", "images/pikachu.png", "images/pokeball.png"
]
let firstPlayerLogoSrc = avatarSrcArray[0];
let secondPlayerLogoSrc = avatarSrcArray[1];
let gameMode;

let firstPlayerName = "Player One";
let secondPlayerName = "Player Two";

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
	document.getElementById("displayMessage").innerHTML = firstPlayerName + "'s Turn";
}

// first player starts with X
function cellClicked(cell, cell_num) {
	let firstPlayerLogo = document.createElement('img');
	firstPlayerLogo.className="avatars";
	firstPlayerLogo.src=firstPlayerLogoSrc;

	let secondPlayerLogo = document.createElement('img');
	secondPlayerLogo.className="avatars";
	secondPlayerLogo.src=secondPlayerLogoSrc;

	// continue updating table until there are 9 moves (there are 9 squares in tic tac toe)
	if (turns < 10){
		if (!firstPlayerTurn){
			cell.appendChild(secondPlayerLogo);
			cell.onclick="";
			for (let i = 0; i < movesMap[cell_num].length; i++){
				secondPlayerMoves[i] += movesMap[cell_num][i]
			}
			document.getElementById("displayMessage").innerHTML = firstPlayerName + "'s Turn";
		}
		else {
			cell.appendChild(firstPlayerLogo);
			cell.onclick="";
			for (let i = 0; i < movesMap[cell_num].length; i++){
				firstPlayerMoves[i] += movesMap[cell_num][i]
			}
			document.getElementById("displayMessage").innerHTML = secondPlayerName + "'s Turn";
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
				document.getElementById("displayMessage").innerHTML = firstPlayerName + " Wins!";
				endGame();
			}
		}
		else {
			if (secondPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = secondPlayerName + " Wins!";
				endGame();
			}
		}
	}
	else if (turns == 10){
		if (firstPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = firstPlayerName + " Wins!";
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

function formComputerSelected() {
	secondPlayerFormElements = document.getElementsByClassName("formSecondPlayer");
	for (let i = 0; i < secondPlayerFormElements.length; i++){
		secondPlayerFormElements[i].style.display = "none";
	}	
	computerFormElements = document.getElementsByClassName("formComputer");
	for (let i = 0; i < computerFormElements.length; i++){
		computerFormElements[i].style.display = "block";
	}	
}

function formPlayerSelected() {
	// unhide all form elements that may have been hidden when "Computer" is selected
	secondPlayerFormElements = document.getElementsByClassName("formSecondPlayer");
	for (let i = 0; i < secondPlayerFormElements.length; i++){
		secondPlayerFormElements[i].style.display = "";
	}	
	computerFormElements = document.getElementsByClassName("formComputer");
	for (let i = 0; i < computerFormElements.length; i++){
		computerFormElements[i].style.display = "none";
	}	
}

function saveSettings() {
	let firstPlayerAvatar = document.getElementById("firstAvatar");
	firstPlayerLogoSrc = avatarSrcArray[firstPlayerAvatar.options.selectedIndex]

	let secondPlayerAvatar = document.getElementById("secondAvatar");
	secondPlayerLogoSrc = avatarSrcArray[secondPlayerAvatar.options.selectedIndex]

	firstPlayerName = document.getElementById("p-one-name").value;
	
	gameMode = document.querySelector('input[name="gameSelect"]:checked').value;
	if (gameMode == "PvP"){
		secondPlayerName = document.getElementById("p-two-name").value;
	}
	else {
		secondPlayerName = "Computer";
	}

	$('#gameSettings').modal('hide');
	resetGame();
}