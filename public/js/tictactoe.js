// let socket = io.connect('http://localhost:4000/');
let socket = io.connect('https://tic-tac-toe-1537.herokuapp.com/');

// store variable to keep track of which name/avatar to set when playing online
let onlinePlayerNum;
socket.on('connectSequence', function(data){
	onlinePlayerNum = data;
});

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

// Store the game mode. Either PvP or PvE
let gameMode = '';
let gameDifficulty = '';
let gameType = '';

// Flag to track and disable onclick functions when it is computer's turn
let isComputerTurn = false;

// Boolean to track whether the game is finished or not
let gameFinished;

// Set default string for the names
let firstPlayerName = "Player One";
let secondPlayerName = "Player Two";

let firstPlayerIndex;
let secondPlayerIndex;

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

// Store references to DOM elements
let table = document.getElementById("ticTable");
let gameSettings = document.getElementById("gameSettings")

// Store score element
const player1Score = document.getElementById("player1Score");
const player2Score = document.getElementById("player2Score");
const player1ScoreDiv = document.getElementById("player1ScoreDiv");
const player2ScoreDiv = document.getElementById("player2ScoreDiv");

//Run the loadGame function when the page is loaded
window.addEventListener("load", loadGame);

function loadGame() {
	// Show the Game Settings when page is loaded
	$('#gameSettings').modal('show');
	startGame();
	updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
	updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
}

function startGame() {
	document.getElementById("displayMessage").innerHTML = firstPlayerName + "'s Turn";
}

// listen for updateBoard event to call cellClicked and update the tic tac toe
socket.on('updateBoard', function(data){
	cellClicked(data.cell_num, true);
});

// Function to handle each move
function cellClicked(cell_num, onlineUpdate) {
	// prevent the function from infinitely emit the event
	// only emit if it is clicked on client side and not when received from server
	if (!onlineUpdate){
		socket.emit('updateBoard', {
			cell_num: cell_num
		});
	}	

	if (onlinePlayerNum == 1){
		socket.emit('setFirstPlayer', {
			firstPlayerName: firstPlayerName,
			firstPlayerIndex: firstPlayerIndex
		});	
	} 
	else if (onlinePlayerNum == 2) {
		socket.emit('setSecondPlayer', {
			secondPlayerName: secondPlayerName,
			secondPlayerIndex: secondPlayerIndex
		});
	}	

	let cell_elem = document.getElementById(cell_num.toString());

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
			cell_elem.appendChild(secondPlayerLogo);

			// Disable the onclick function for the cell
			cell_elem.onclick="";

			// Update the secondPlayerMoves list using the movesMap
			for (let i = 0; i < movesMap[cell_num].length; i++){
				secondPlayerMoves[i] += movesMap[cell_num][i]
			}
			// Update the display message so that it's the next player's turn
			document.getElementById("displayMessage").innerHTML = "Go, " + firstPlayerName + "!";
		}
		// If it is first player's turn
		else {
			// Add the image to the table cell
			cell_elem.appendChild(firstPlayerLogo);

			// Disable the onclick function for the cell
			cell_elem.onclick="";

			// Update the firstPlayerMoves list using the movesMap
			for (let i = 0; i < movesMap[cell_num].length; i++){
				firstPlayerMoves[i] += movesMap[cell_num][i]
			}

			// Add first player's move to totalMovesList array
			totalMovesList.push(cell_num);

			// Update the display message so that it's the next player's turn
			document.getElementById("displayMessage").innerHTML = "Go, " + secondPlayerName + "!";
		}

		// Increase the count for turns
		turns++;

		// Check if the game has finished 
		gameFinished = checkFinish();

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
				cell.onclick = function() {cellClicked(i, false)};
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
		
		// keep a track of the last index so we can look for the next occurrence of 2 if needed
		let two_index_count = 1;
		
		// Continue trying to find a move until one is calculated
		while (computerMove == undefined){
			
			// use last_index to help search for the next index of 2 if the previous one is already filled
			let last_index = -1;
			
			// get the next index of 2 in firstPlayerMoves array
			for (let i = 0; i < two_index_count; i++) {
				last_index = firstPlayerMoves.indexOf(2, last_index + 1);
			}

			let two_index = last_index;
			// If 2 is not found or all the existing 2's are already filled
			if (two_index == -1) {
				// Randomly choose a cell in the table
				computerMove = Math.floor(Math.random() * 9);
				
				// Check that the chosen cell hasn't already been selected
				while (totalMovesList.includes(computerMove)){
					computerMove = Math.floor(Math.random() * 9);
				}
			}
			// If there is a 2, determine if it is already filled
			// If it is filled, computerMove will be undefined
			// If it is not filled, we will get the correct blocking cell for computerMove
			else {
				for (let i = 0; i < 3; i++){
					if (!totalMovesList.includes(winningCombos[two_index][i])){
						computerMove = winningCombos[two_index][i];
					}
				}		
			}
			two_index_count++;
		}		
	}
		
	cellClicked(computerMove, false);
	
	// Update the moves array
	totalMovesList.push(computerMove);

	if (!gameFinished){
		// Re-enable the onclicks
		isComputerTurn = false;
		toggleOnClicks();
	}	
}

// Check if a winning combination or the table is filled
function checkFinish() {
	// Can only have a winning combination after the 5th turn
	if (turns > 4 && turns < 10 ) {
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
				incrementScore(player1Score);
				return true;
		}
		// If nobody has won...
		else {
			document.getElementById("displayMessage").innerHTML = "Game ended in a Draw!";
			endGame();
			return true;
		}
	}
	return false;
}

socket.on('reset', function(){
	resetGame(true);
});

// Function that resets all variables to their default values
function resetGame(onlineUpdate) {
	if (!onlineUpdate){
		socket.emit('reset');
	}	

	// Re-enable all the cells to have onclick functions
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			table.rows[i].cells[j].innerHTML = "";			
			table.rows[i].cells[j].onclick= function() {cellClicked(i*3 + j, false)}
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

// Handle showing/hiding Game Setting form elements if Local game is selected
function formLocalSelected() {
	localFormElements = document.getElementsByClassName("localForm");
	for (let i = 0; i < localFormElements.length; i++){
		localFormElements[i].style.display = "";
	}
}

// Handle showing/hiding Game Setting form elements if Online game is selected
function formOnlineSelected() {
	localFormElements = document.getElementsByClassName("localForm");
	for (let i = 0; i < localFormElements.length; i++){
		localFormElements[i].style.display = "none";
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

// Listen for socket event to change the First Player Name and Avatar
socket.on('setFirstPlayer', function(data) {
	if (onlinePlayerNum == 2) {
		firstPlayerName = data.firstPlayerName;
		document.getElementById("player1Name").innerText = data.firstPlayerName;

		firstPlayerIndex = data.firstPlayerIndex;

		if (firstPlayerIndex != 0) {
			firstPlayerLogoSrc = avatarSrcArray[firstPlayerIndex - 1]
			updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
		} else {
			firstPlayerLogoSrc = avatarSrcArray[0];
			updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
		}
	}
});

// Listen for socket event to change the Second Player Name and Avatar
socket.on('setSecondPlayer', function(data) {
	if (onlinePlayerNum == 1) {
		secondPlayerName = data.secondPlayerName;
		document.getElementById("player2Name").innerText = data.secondPlayerName;

		secondPlayerIndex = data.secondPlayerIndex;
		if (secondPlayerIndex != 0) {
			secondPlayerLogoSrc = avatarSrcArray[secondPlayerIndex - 1]
			updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
		} else {
			secondPlayerLogoSrc = avatarSrcArray[1];
			updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
		}
	}
});

// Handle updates to Game Settings
function saveSettings() {
	// track the gameMode before it gets changed by user
	let oldGameMode = gameMode;

	//Set the second player name based on game mode
	gameMode = document.querySelector('input[name="gameSelect"]:checked').value;
	gameDifficulty = document.querySelector('input[name="difficultySelect"]:checked').value;
	gameType = document.querySelector('input[name="gameType"]:checked').value;

	if (gameType == "Local") {
		// Set the avatars based on user selection
		let firstPlayerAvatar = document.getElementById("pl1");
		firstPlayerIndex = firstPlayerAvatar.options.selectedIndex;

		if (firstPlayerIndex != 0) {
			firstPlayerLogoSrc = avatarSrcArray[firstPlayerAvatar.options.selectedIndex - 1]
			updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
		} else {
			firstPlayerLogoSrc = avatarSrcArray[0];
			updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
		}
		
		let secondPlayerAvatar = document.getElementById("pl2");
		secondPlayerIndex = secondPlayerAvatar.options.selectedIndex;

		if (secondPlayerIndex != 0) {
			secondPlayerLogoSrc = avatarSrcArray[secondPlayerAvatar.options.selectedIndex - 1]
			updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
		} else {
			secondPlayerLogoSrc = avatarSrcArray[1];
			updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
		}

		// Set the names based on user input
		if (document.getElementById("p-one-name").value != ""){
			firstPlayerName = document.getElementById("p-one-name").value;
			document.getElementById("player1Name").innerText = `${document.getElementById("p-one-name").value}`;
		}
		else {
			firstPlayerName = "Player One";
		}
		if (gameMode == "PvP") {
			if (document.getElementById("p-two-name").value != ""){
				secondPlayerName = document.getElementById("p-two-name").value;
				document.getElementById("player2Name").innerText = `${document.getElementById('p-two-name').value}`;
			}
			else {
				secondPlayerName = "Player Two";
			}
		}
		else {
			secondPlayerName = "Computer";
			document.getElementById("player2Name").innerText = secondPlayerName;
		}
	} 
	else if (gameType == "Online") {
		if (onlinePlayerNum == 1) {
			let firstPlayerAvatar = document.getElementById("pl1");
			firstPlayerIndex = firstPlayerAvatar.options.selectedIndex;

			if (firstPlayerIndex != 0) {
				firstPlayerLogoSrc = avatarSrcArray[firstPlayerAvatar.options.selectedIndex - 1]
				updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
			} else {
				firstPlayerLogoSrc = avatarSrcArray[0];
				updatePlayerAvatarScoreTracker(player1ScoreDiv, firstPlayerLogoSrc);
			}

			if (document.getElementById("p-one-name").value != ""){
				firstPlayerName = document.getElementById("p-one-name").value;
				document.getElementById("player1Name").innerText = `${document.getElementById("p-one-name").value}`;
			}
			else {
				firstPlayerName = "Player One";
			}
			socket.emit('setFirstPlayer', {
				firstPlayerName: firstPlayerName,
				firstPlayerIndex: firstPlayerIndex
			});
		} 
		// else... if onlinePlayerNum == 2
		else {
			// use the avatar selected as player one in modal for player two during online!
			let secondPlayerAvatar = document.getElementById("pl1");
			secondPlayerIndex = secondPlayerAvatar.options.selectedIndex;

			if (secondPlayerIndex != 0) {
				secondPlayerLogoSrc = avatarSrcArray[secondPlayerAvatar.options.selectedIndex - 1]
				updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
			} else {
				secondPlayerLogoSrc = avatarSrcArray[1];
				updatePlayerAvatarScoreTracker(player2ScoreDiv, secondPlayerLogoSrc);
			}

			// use the player one name entered in modal for player two during online!
			if (document.getElementById("p-one-name").value != ""){
				secondPlayerName = document.getElementById("p-one-name").value;
				document.getElementById("player2Name").innerText = `${document.getElementById("p-one-name").value}`;
			}
			else {
				secondPlayerName = "Player Two";
			}

			socket.emit('setSecondPlayer', {
				secondPlayerName: secondPlayerName,
				secondPlayerIndex: secondPlayerIndex
			});
		}
	}	

	//reset the score if gameMode changed
	if (checkGameMode(oldGameMode, gameMode)) {
		resetScore();
	}

	$('#gameSettings').modal('hide');
	resetGame(false);
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

// check if game mode changed for reseting of the score
function checkGameMode(oldMode, newMode) {
	return (oldMode === newMode) ? false : true;
}

// function to ensure 2 players can't have the same avatar
function checkAvatar() {
  dropdownValues = [];

  for (let index = 0; index < 2 ; index++) {
    dropdownValues[index] = document.getElementById('pl'+(index+1)).value;
	}
  
  for (let index = 0; index < 2; index++) {
    for (let value = 1; value < 9; value++) {
    document.getElementById('pl'+(index+1)).options[value].style.display = "block";
      for (let c = 0; c < 4; c++) {
        if(document.getElementById('pl'+(index+1)).options[value].value == dropdownValues[c]) {
          document.getElementById('pl'+(index+1)).options[value].style.display = "none";
        }
      }
    }
  }
}

// function to update image on the score tracker
function updatePlayerAvatarScoreTracker(parentElement, image) {
	
	if(parentElement.querySelector("img") == null) {
		imageElement = document.createElement("img");
		imageElement.className = "scoreImg";
		imageElement.src = image;
		parentElement.insertBefore(imageElement, parentElement.childNodes[1]);
	} else {
		parentElement.removeChild(parentElement.childNodes[1]);
		updatePlayerAvatarScoreTracker(parentElement, image);
	}
}
