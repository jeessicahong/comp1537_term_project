// Variable to count the number of turns
let turns = 1;
// Boolean to track whether it is first player's turn
let firstPlayerTurn = true;
// An array of strings that point to the src of the avatar images
let avatarSrcArray = [
"images/oddish.png", "images/snorlax.png", "images/ditto.png", "images/eevee.png", 
"images/ghastly.png", "images/meowth.png", "images/pikachu.png", "images/pokeball.png"
]
// Set default images
let firstPlayerLogoSrc = avatarSrcArray[0];
let secondPlayerLogoSrc = avatarSrcArray[1];

// Store the type of game. Either PvP or PvE
let gameMode = '';
let gameDifficulty = '';

// Flag to track and disable onclick functions when it is computer's turn
let isComputerTurn = false;

// Set default string for the names
let firstPlayerName = "Player One";
let secondPlayerName = "Player Two";

// Store the index of table cells selected into a list
// This array is mainly used for when it is PvE
let totalMovesList = [];

// Keeps track of the total score for each possible winning combination
// [row1, row2, row3, col1, col2, col3, diag1, diag2]
let firstPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
let secondPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
let movesMap = {
	// adds to the total score for each possible winning combination
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
let indexCount = -1;
// twosInFirstPlayer = all 2s index in firstPlayerMoves
let twosInFirstPlayer = [];

// Store references to DOM elements
let table = document.getElementById("ticTable");
let gameSettings = document.getElementById("gameSettings")

// Store score element
const player1Score = document.getElementById("player1Score");
const player2Score = document.getElementById("player2Score");

//Run the loadGame function when the page is loaded
window.addEventListener("load", loadGame);

function loadGame() {
	// Show the Game Settings when page is loaded
	$('#gameSettings').modal('show');
	startGame();
}

function startGame() {
	document.getElementById("displayMessage").innerHTML = firstPlayerName + "'s Turn";
}

// Function to handle each move
function cellClicked(cell, cell_num) {
	// Create image elements in order to add them to the table later
	let firstPlayerLogo = document.createElement('img');
	firstPlayerLogo.className="avatars";
	firstPlayerLogo.src=firstPlayerLogoSrc;

	let secondPlayerLogo = document.createElement('img');
	secondPlayerLogo.className="avatars";
	secondPlayerLogo.src=secondPlayerLogoSrc;

	// Continue updating table until there are 9 moves (b/c there are 9 squares in tic tac toe)
	if (turns < 10){
		// If it is second player or computer's turn
		if (!firstPlayerTurn){
			// Add the image to the table cell
			cell.appendChild(secondPlayerLogo);

			// Disable the onclick function for the cell
			cell.onclick="";

			// Update the secondPlayerMoves list using the movesMap
			for (let i = 0; i < movesMap[cell_num].length; i++){
				secondPlayerMoves[i] += movesMap[cell_num][i]
			}
			// Update the display message so that it's the next player's turn
			document.getElementById("displayMessage").innerHTML = firstPlayerName + "'s Turn";
		}
		// If it is first player's turn
		else {
			// Add the image to the table cell
			cell.appendChild(firstPlayerLogo);

			// Disable the onclick function for the cell
			cell.onclick="";

			// Update the firstPlayerMoves list using the movesMap
			for (let i = 0; i < movesMap[cell_num].length; i++){
				firstPlayerMoves[i] += movesMap[cell_num][i]
			}

			// Add first player's move to totalMovesList array
			totalMovesList.push(cell_num);

			// Update the display message so that it's the next player's turn
			document.getElementById("displayMessage").innerHTML = secondPlayerName + "'s Turn";
		}
		// Increase the count for turns
		turns++;

		// Check if the game has finished 
		let gameFinished = checkFinish();

		// Change the boolean for which turn it is
		firstPlayerTurn = !firstPlayerTurn;

		// If the game has not finished
		if (!gameFinished) {
			// If playing against Computer and after the player's turn
			if (gameMode == "PvE" && !firstPlayerTurn){
				isComputerTurn = true;
				toggleOnClicks();
				setTimeout(computerTurn, 1000);
			}
		}			
	}	
}

// Function that disables/enables the onclick events based on if it is computer's turn
function toggleOnClicks() {
	// Disable onclick events if it is currently computer's turn
	if (isComputerTurn){
		for (let i = 0; i < 9; i++){
			// Only need to do it for remaining empty cells b/c the selected ones are already disabled
			if (!totalMovesList.includes(i)) {
				let cell = document.getElementById(i.toString());
				cell.onclick="";
			}
		}
	} 
	// Enable onclick events if it is not computer's turn
	else {
		for (let i = 0; i < 9; i++){
			if (!totalMovesList.includes(i)) {
				let cell = document.getElementById(i.toString());
				cell.onclick = function() {cellClicked(this, i)};
			}
		}
	}
}

// Function to handle computer logic
function computerTurn() {
	let computerMove;

	if (gameDifficulty == "Easy") {

		// Randomly choose a cell in the table
		computerMove = Math.floor(Math.random() * 9);
		
		// Check that the chosen cell hasn't already been selected
		while (totalMovesList.includes(computerMove)){
			computerMove = Math.floor(Math.random() * 9);
		}
	}
	// Hard Mode:
	else {
		// [row1, row2, row3, col1, col2, col3, diag1, diag2]
		const winningCombos = {
			0: [0, 1, 2],
			1: [3, 4, 5],
			2: [6, 7, 8],
			3: [0, 3, 6],
			4: [1, 4, 7],
			5: [2, 5, 8],
			6: [0, 4, 8],
			7: [2, 4, 6]
		};
		// twosInFirstPlayer = index of 2s in firstPlayerMoves
		for (let i = 0; i < 8; i++) {
			if (firstPlayerMoves[i] == 2) {
				if (!twosInFirstPlayer.includes(i)) {
					twosInFirstPlayer.push(i);
				}
			}
		}

		// When no move matched a winning pattern
		if (twosInFirstPlayer.length == 0) {		

			// Randomly choose a cell in the table
			computerMove = Math.floor(Math.random() * 9);
			
			// Check that the chosen cell hasn't already been selected
			while (totalMovesList.includes(computerMove)){
				computerMove = Math.floor(Math.random() * 9);
			}
		}
		
		// Matched at least 1 winning combos
		else {
			let two_index = twosInFirstPlayer[indexCount];
			console.log("twosInFirstPlayer: "+twosInFirstPlayer);
			console.log("indexCount: "+indexCount);
			console.log("two_index: "+two_index)
			for (let i = 0; i < 3; i++) {
				if (!totalMovesList.includes(winningCombos[two_index][i])) {
					computerMove = winningCombos[two_index][i];

					while (totalMovesList.includes(computerMove)){
						computerMove = Math.floor(Math.random() * 9);
					}
				}
			}
		}
		indexCount++;
		
	// Get the cell element and pass to cellClicked function
	let cell = document.getElementById(computerMove.toString());
	cellClicked(cell, computerMove);
	
	// Update the moves array
	totalMovesList.push(computerMove);

	// Re-enable the onclicks
	isComputerTurn = false;
	toggleOnClicks();
	}
	console.log("end round")
}

// Check if a winning combination or the table is filled
function checkFinish() {
	// Can only have a winning combination after the 5th turn
	if (turns > 4 && turns < 10) {
		// Depending on which player it is, if the associated array has 3 
		// (it is a winning combination), then end the game
		if (firstPlayerTurn) {
			if (firstPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = firstPlayerName + " Wins!";
				endGame();
				incrementScore(player1Score);
				return true;
			}
		}
		else {
			if (secondPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = secondPlayerName + " Wins!";
				endGame();
				incrementScore(player2Score);
				return true;
			}
		}
	}
	// If the table has been filled
	else if (turns == 10){
		// Check if first player has won - first player goes first, so they would have the last move
		if (firstPlayerMoves.includes(3)) {
				document.getElementById("displayMessage").innerHTML = firstPlayerName + " Wins!";
				endGame();
				return true;
		}
		// If nobody has won...
		else {
			document.getElementById("displayMessage").innerHTML = "Game ended in a Draw!";
			endGame();
			return true;
		}
	}
}

// Function that resets all variables to their default values
function resetGame() {
	// Re-enable all the cells to have onclick functions
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			table.rows[i].cells[j].innerHTML = "";			
			table.rows[i].cells[j].onclick= function() {cellClicked(this, i*3 + j)}
		}
	}

	// Reset all variables
	firstPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
	secondPlayerMoves = [0, 0, 0, 0, 0, 0, 0, 0];
	turns = 1;
	firstPlayerTurn = true;
	totalMovesList = []
	isComputerTurn = false;
	startGame();
}

// When the game has ended, disable all onclicks and make sure no more moves can be made
function endGame() {
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			table.rows[i].cells[j].onclick=""
		}
	}
}

// Handle showing/hiding Game Setting form elements if Computer is selected to be played against
function formComputerSelected() {
	// Get all form elements by a specified class name
	secondPlayerFormElements = document.getElementsByClassName("formSecondPlayer");
	
	// Hide the form elements that are associated to second player
	for (let i = 0; i < secondPlayerFormElements.length; i++){
		secondPlayerFormElements[i].style.display = "none";
	}	

	// Display form elements that are associated to computer as player
	computerFormElements = document.getElementsByClassName("formComputer");
	for (let i = 0; i < computerFormElements.length; i++){
		computerFormElements[i].style.display = "block";
	}	

	// Change the label for whether the avatar is being selected for Computer or Second Player
	let secondAvatarLabel = document.getElementById("secondAvatarLabel");
	secondAvatarLabel.innerHTML = "Computer Avatar:";
}

// Handle showing/hiding Game Setting form elements if Player is selected to be played against
function formPlayerSelected() {
	// Unhide all form elements that may have been hidden when "Computer" is selected
	secondPlayerFormElements = document.getElementsByClassName("formSecondPlayer");
	for (let i = 0; i < secondPlayerFormElements.length; i++){
		secondPlayerFormElements[i].style.display = "";
	}	

	// Hide the form elements that are associated to computer
	computerFormElements = document.getElementsByClassName("formComputer");
	for (let i = 0; i < computerFormElements.length; i++){
		computerFormElements[i].style.display = "none";
	}	

	// Change the label for whether the avatar is being selected for Computer or Second Player
	let secondAvatarLabel = document.getElementById("secondAvatarLabel");
	secondAvatarLabel.innerHTML = "Player Two Avatar:";
}

// Handle updates to Game Settings
function saveSettings() {
	// Set the avatars based on user selection
	let firstPlayerAvatar = document.getElementById("firstAvatar");
	firstPlayerLogoSrc = avatarSrcArray[firstPlayerAvatar.options.selectedIndex]

	let secondPlayerAvatar = document.getElementById("secondAvatar");
	secondPlayerLogoSrc = avatarSrcArray[secondPlayerAvatar.options.selectedIndex]

	// Set the names based on user input
	if (document.getElementById("p-one-name").value != ""){
		firstPlayerName = document.getElementById("p-one-name").value;
	}
	else {
		firstPlayerName = "Player One";
	}

	// track the gameMode before it gets changed by user
	let oldGameMode = gameMode;

	//Set the second player name based on game mode
	gameMode = document.querySelector('input[name="gameSelect"]:checked').value;

	gameDifficulty = document.querySelector('input[name="difficultySelect"]:checked').value;

	if (gameMode == "PvP"){
		if (document.getElementById("p-two-name").value != ""){
			secondPlayerName = document.getElementById("p-two-name").value;
		}
		else {
			secondPlayerName = "Player Two";
		}
	}
	else {
		secondPlayerName = "Computer";
	}

	//reset the score if gameMode changed
	if (checkGameMode(oldGameMode, gameMode)) {
		resetScore();
	}

	$('#gameSettings').modal('hide');
	resetGame();
}

// increment the player scores

function incrementScore(playerCurrentScore) {
	newScore = parseInt(playerCurrentScore.innerText) + 1
	playerCurrentScore.innerText = newScore;
}

// reset score
function resetScore() {
		player2Score.innerText = "0";
		player1Score.innerText = "0";
}

// check if game mode changed
function checkGameMode(oldMode, newMode) {
	return (oldMode === newMode) ? false : true;
}

